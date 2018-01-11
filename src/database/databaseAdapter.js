const MySQL = require('promise-mysql');
const _ = require('lodash');

class DatabaseAdapter {
    constructor(poolCount = 5) {

        const inTestMode = process.env.NODE_ENV === 'test';

        this.poolPromise = MySQL.createPool({
            host     : process.env.DB_HOST,
            port     : process.env.DB_PORT || 3306,
            user     : 'root',
            password : process.env.DB_ROOT_PASSWORD,
            connectionLimit: poolCount,
            database: process.env.DB_NAME + ( inTestMode ? 'test' : '' )
        })

    }

    //region - User -

    /**
     * Gets the user from database matching the passed userEmail
     * @param userParams Must be filled with userEmail
     * @returns user Object
     */
    getUser(userParams) {

        let promiseQuery;

        if(userParams.userMail){
            promiseQuery = this.poolPromise.query('SELECT * FROM user WHERE ' +
                'email = ?', [userParams.userMail])
        } else if (userParams.userId) {
            promiseQuery = this.poolPromise.query('SELECT * FROM user WHERE ' +
                'id = ?', [userParams.userId])
        }
        else {
            throw Error('Wrong Params.');
        }

        return promiseQuery.then((users) => {
            if(users.length <= 0) {
                return null;
            } else {
                return users[0];
            }
        });

    }

    /**
     * Saves the user to the database and returns the user with filled id
     * @param user User Object
     */
    putUser(user)
    {
        let promiseQuery = this.poolPromise.query('INSERT INTO user ' + this.createInsertPart(user));

        return promiseQuery.then((result) => {
            user.id = result.insertId;
            return user;
        });
    }

    //endregion

    //region - Courses -

    /**
     * Saves the course to the database and returns the course with filled id
     * @param course
     */
    putCourse(course)
    {
        let promiseQuery = this.poolPromise.query('INSERT INTO course ' + this.createInsertPart(course));

        return promiseQuery.then((result) => {
           course.id = result.insertId;
           return course;
        });
    }

    /**
     * Gets the courses matching the passed params
     * @param params
     */
    getCourses(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM course' + this.createWherePart(params));

        return promiseQuery.then((paramsParam) => {
            if(paramsParam.length <= 0) {
                return null;
            } else {
                return paramsParam;
            }
        });
    }

    //endregion

    //region - progress
    /**
     * Returns weekly progress of a user in a single course, with a bunch of information about it
     * @param  userProgressTupel
     */
    getCourseUserProgressDetailed(userProgressTupel){
        let promiseQuery = this.poolPromise.query('SELECT admissionrequirementitem.id AS arId, admissionrequirementitem.admissionrequirementtype AS arType, courseinstance.id as courseinstanceId, course.displayname as CourseName , course.shortname as CourseShortName, semester.displayname as SemesterName, semester.enddate, semester.id as SemesterId, admissionrequirementitem.mandatory, admissionrequirementitem.admissionrequirementtype, admissionrequirementitemweek.maxCount as TasksAvailable, userProgress.`taskCount` as TasksSolved, (userProgress.`taskCount`/ admissionrequirementitemweek.maxCount) as Percentage, admissionrequirementitemweek.id as weekId, admissionrequirementitemweek.semesterWeek \n' +
            '             \n' +
            '            FROM  \n' +
            '             \n' +
            '            usercourseinstance  \n' +
            '            JOIN courseinstance ON courseinstance.id = usercourseinstance.courseinstanceid  \n' +
            '            JOIN course ON course.id = courseinstance.courseid  \n' +
            '            JOIN semester ON semester.id = courseinstance.semesterid  \n' +
            '            LEFT JOIN admissionrequirement ON courseinstance.id = admissionrequirement.courseinstanceid  \n' +
            '            LEFT JOIN admissionrequirementitem ON admissionrequirement.id = admissionrequirementitem.admissionrequirementid  \n' +
            '            LEFT JOIN admissionrequirementitemweek ON admissionrequirementitem.id = admissionrequirementitemweek.admissionrequirementitemid \n' +
            '            LEFT JOIN userProgress ON admissionrequirementitemweek.id = userProgress.admissionrequirementitemweekid AND userProgress.userId = usercourseInstance.userId \n' +
            '            WHERE usercourseinstance.userid = ? AND courseinstance.id = ? ORDER BY admissionrequirementitem.admissionrequirementtype, admissionrequirementitemweek.semesterWeek', [userProgressTupel.userId, userProgressTupel.courseInstanceId]);

        return promiseQuery.then((resultList) => {
            let pushList = [];
            resultList.forEach((element) => {

                let admissionRequirementItem = {
                    id: element.arId,
                    type: element.arType
                };

                if(pushList.length < 1 || pushList[pushList.length - 1].id !== admissionRequirementItem.id)
                    pushList.push(admissionRequirementItem);

                let resultElem = {};
                let elementFound = false;
                if(!_.isNil(element.TasksAvailable)) {
                    elementFound = true;
                    resultElem.result = {
                        percentage : element.Percentage,
                            tasksSolved : element.TasksSolved,
                            tasksAvailable: element.TasksAvailable
                    };
                }
                if(element.weekId) {
                    elementFound = true;
                    resultElem.requirementWeek ={
                        id: element.weekId,
                            semesterWeek: element.semesterWeek
                    }
                }
                    /*,
                    courseInstance: {
                        id: element.courseinstanceId,
                        courseName: element.CourseName,
                        courseShortName: element.CourseShortName
                    },
                    semester : {
                        id: element.SemesterId,
                        name: element.SemesterName,
                        endDate: element.enddate
                    }*/

                //pushList.push(resultElem);
                if(elementFound) {
                    if(!pushList[pushList.length - 1].progress)
                        pushList[pushList.length - 1].progress = [];

                    pushList[pushList.length - 1].progress.push(resultElem);
                }
            });
            return pushList;
        });
    }

    /**
     * Returns progress of a user for single semester composed of all votes
     * @param userProgressTupel
     */
    getCourseUserProgressComplete(userProgressTupel){
        let semesterisnotNull = '';
        if(userProgressTupel.semesterId){
           semesterisnotNull = 'AND semester.id =' + this.poolPromise.escape(userProgressTupel.semesterId);
        }

            let promiseQuery = this.poolPromise.query('SELECT\n' +
                '    courseinstance.id AS courseinstanceId,\n' +
                '    course.displayname AS CourseName,\n' +
                '    course.shortname AS CourseShortName,\n' +
                '    semester.displayname AS SemesterName,\n' +
                '    semester.enddate,\n' +
                '    semester.id AS SemesterId,\n' +
                '    admissionrequirementitem.minPercentage,\n' +
                '    admissionrequirementitem.minTasks,\n' +
                '    admissionrequirementitem.maxTasks,\n' +
                '    admissionrequirementitem.mandatory,\n' +
                '    admissionrequirementitem.admissionrequirementtype,\n' +
                '    SUM(\n' +
                '        admissionrequirementitemweek.maxCount\n' +
                '    ) AS TasksAvailable,\n' +
                '    SUM(up2.`taskCount`) AS TasksSolved,\n' +
                '    admissionrequirementitem.minPercentage,\n' +
                '    courseinstance.room,\n' +
                '    courseinstance.docent,\n' +
                '    (\n' +
                '        SUM(up2.`taskCount`) / SUM(\n' +
                '            admissionrequirementitemweek.maxCount\n' +
                '        )\n' +
                '    ) AS Percentage\n' +
                'FROM\n' +
                '    usercourseinstance\n' +
                'JOIN courseinstance ON courseinstance.id = usercourseinstance.courseinstanceid\n' +
                'JOIN course ON course.id = courseinstance.courseid\n' +
                'JOIN semester ON semester.id = courseinstance.semesterid\n' +
                'LEFT JOIN admissionrequirement ON courseinstance.id = admissionrequirement.courseinstanceid\n' +
                'LEFT JOIN admissionrequirementitem ON admissionrequirement.id = admissionrequirementitem.admissionrequirementid\n' +
                'LEFT JOIN(\n' +
                '        admissionrequirementitemweek\n' +
                '    LEFT JOIN(\n' +
                '        SELECT\n' +
                '            *\n' +
                '        FROM\n' +
                '            userprogress\n' +
                '        WHERE\n' +
                '            userprogress.userid = ?\n' +
                '    ) AS up2\n' +
                'ON\n' +
                '    up2.admissionrequirementitemweekid = admissionrequirementitemweek.id\n' +
                '    )\n' +
                'ON\n' +
                '    admissionrequirementitem.id = admissionrequirementitemweek.admissionrequirementitemid\n' +
                'WHERE\n' +
                '    usercourseinstance.userid = ?\n' + semesterisnotNull +
                'GROUP BY\n' +
                '    courseinstance.id', [userProgressTupel.userId, userProgressTupel.userId]);

        return promiseQuery.then((resultlist) => {
            let pushList = [];
            resultlist.forEach((result) => {
                if(!result.TasksSolved){
                    result.TasksSolved = 0;
                    result.Percentage = 0.0;
                }
                let element = {
                    progress : {
                    tasksAccomplished : result.TasksSolved,
                    tasksAvailable: result.TasksAvailable,
                    percentageDone : result.Percentage
                    },
                    courseInstance : {
                        id : result.courseinstanceId,
                        displayName : result.CourseName,
                        shortName : result.CourseShortName,
                        room : result.room,
                        docent : result.docent
                    },
                    semester : {
                        id : result.SemesterId,
                        endDate : result.enddate,
                        name : result.SemesterName
                    },
                    requirements : {
                        minTasks : result.minTasks,
                        maxTasks : result.maxTasks,
                        type : result.admissionRequirementType,
                        minPercentage : result.minPercentage
                    }
                };
                pushList.push(element);
            });
            return pushList;
        });

    }

    //endregion

    //region - semester
    /**
     * Adds new semester to table, returns new entry
     * @param semester
     */
    putSemester(semester){
        let promiseQuery = this.poolPromise.query('INSERT INTO semester ' + this.createInsertPart(semester));

        return promiseQuery.then((param) => {
            semester.id = param.insertId;
            return semester;
        });
    }

    /**
     * Searches for a semester inside of the semester table according to search parameters
     * @param semester
     */
    getSemester(semester, currentDate){
        let queryString = 'SELECT * FROM semester '+ this.createWherePart(semester);

        // Check if currentDate is passed
        if(currentDate) {

            // Be sure not to create 2 WHERE String or something like this
            if(semester.length && semester.length > 0)
               queryString += ' AND ';
            else
                queryString +=' WHERE ';

            queryString += this.poolPromise.escape(currentDate) + ' BETWEEN startDate AND endDate ORDER BY id LIMIT 1';
        }

        let promiseQuery = this.poolPromise.query(queryString);

        return promiseQuery.then((param) => {
            return param;
        });
    }

    //endregion

    //region - CourseInstances -

    /**
     * Saves the courseInstance to the database and returns the courseInstance with filled id
     * @param courseInstance
     */
    putCourseInstance(courseInstance)
    {
        /*let promiseQuery = this.poolPromise.query('INSERT INTO courseInstance (semesterId, courseId) VALUES ' +
            '(?,?)',[courseInstance.semesterId, courseInstance.courseId]);*/

        let promiseQuery = this.poolPromise.query('INSERT INTO courseInstance '+ this.createInsertPart(courseInstance));

        return promiseQuery.then((result) => {
            courseInstance.id = result.insertId;
            return courseInstance;
        });
    }

    /**
     * Updates the courseInstance to the database and returns the result
     * @param courseInstance
     */
    postCourseInstance(courseInstance, params)
    {
        /*let promiseQuery = this.poolPromise.query('INSERT INTO courseInstance (semesterId, courseId) VALUES ' +
            '(?,?)',[courseInstance.semesterId, courseInstance.courseId]);*/

        let promiseQuery = this.poolPromise.query('UPDATE courseInstance ' + this.createUpdatePart(courseInstance) + this.createWherePart(params));

        return promiseQuery.then((result) => {
            return result;
        });
    }

    /**
     * Gets the courseInstances matching the passed params
     * @param params semesterId
     */
    getCourseInstances(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT courseInstance.id, course.shortName, course.displayName, courseInstance.semesterId, course.id as id2, semester.id as id3, semester.displayName as semesterName, semester.startDate, semester.endDate FROM courseInstance JOIN semester ON courseInstance.semesterId = semester.id JOIN course ON courseInstance.courseId = course.id ' + this.createWherePart(params));

        return promiseQuery.then((resultList) => {
            return _.map(resultList, (rItem) => {
                return {
                    id: rItem.id,
                    course: {
                        id: rItem.id2,
                        shortName: rItem.shortName,
                        displayName: rItem.displayName,
                    },
                    semester: {
                        id: rItem.id3,
                        semesterName: rItem.semesterName,
                        semesterStart: rItem.startDate,
                        semesterEnd: rItem.endDate,
                    },
                };
            });
        });
    }

    /**
     * Gets the courseInstance with Details matching the passed params
     * @param params semesterId
     */
    getCourseInstanceDetails(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT courseInstance.id, course.shortName, course.displayName, courseInstance.semesterId, ' +
        'course.id as courseId, semester.id as semesterId, semester.displayName as semesterName, semester.startDate, semester.endDate, ar.id AS arId, arItem.id AS arItemId, arItem.admissionRequirementType,' +
        'arItem.expireDate, arItem.maxTasks, arItem.minTasks, arItem.minPercentage, arItem.mandatory, ciGroup.id AS ciGroupId, ciGroup.courseInstanceId, ciGroup.room AS groupRoom, ' +
        'ciGroup.startTime, ciGroup.endTime, ciGroup.weekDay, ciGroup.docent, arItem.description AS arItemDesc ' +
        'FROM courseInstance INNER JOIN semester ON courseInstance.semesterId = semester.id ' +
        'INNER JOIN course ON courseInstance.courseId = course.id ' +
        'LEFT JOIN courseInstanceGroup ciGroup ON courseInstance.id = ciGroup.courseInstanceId ' +
        'LEFT JOIN admissionRequirement ar ON ar.courseInstanceId = courseInstance.id ' +
        'LEFT JOIN admissionRequirementItem arItem ON ar.id = arItem.admissionRequirementId  ' + this.createWherePart(params) + ' ORDER BY arItem.id, ciGroup.id '); //+ );

        return promiseQuery.then((resultList) => {
            let result = {};
            let groupsAdded = false;
            let firstRow = true;
            _.forEach(resultList, (current) => {

                // At first create Items to use in every row
                let admissionRequirementItem = {
                    id: current.arItemId,
                    admissionRequirementType: current.admissionRequirementType,
                    expireDate: current.expireDate,
                    minTasks: current.minTasks,
                    maxTasks: current.maxTasks,
                    minPercentage: current.minPercentage,
                    mandatory: current.mandatory,
                    description: current.arItemDesc
                };

                let courseInstanceGroup = {
                    id: current.ciGroupId,
                    room: current.groupRoom,
                    docent: current.docent,
                    weekDay: current.weekDay,
                    startTime: current.startTime,
                    endTime: current.endTime
                };

                // Course, Semester and courseInstance added only once
                if(firstRow)
                {
                    let course = {
                        id: current.courseId,
                        displayName: current.displayName,
                        shortName: current.shortName
                    };

                    let semester = {
                        id: current.semesterId,
                        displayName: current.semesterName,
                        startDate: current.startDate,
                        endDate: current.endDate
                    };

                    result = {
                        id: current.id,
                        course: course,
                        semester: semester
                    };

                    if(current.arId) {
                        result.admissionRequirement = {
                            id: current.arId,
                            admissionRequirementItems : [admissionRequirementItem]
                        }
                    }

                    if(current.ciGroupId) {
                       result.courseInstanceGroups = [courseInstanceGroup]

                    }else
                    {
                        groupsAdded = true;
                    }

                }


                // Add groups only one time within the first arItem
                if(!groupsAdded) {
                    if (!result.admissionRequirement || result.admissionRequirement.admissionRequirementItems[result.admissionRequirement.admissionRequirementItems.length - 1].id === current.arItemId) {
                        // courseInstanceGroup is already added
                        if(!firstRow)
                            result.courseInstanceGroups.push(courseInstanceGroup);
                    }
                    // All groups added, dont need to readd them
                    else {
                        groupsAdded = true;
                    }
                }

                // Skip all rows with the same arItemId
                if(result.admissionRequirement && result.admissionRequirement.admissionRequirementItems[result.admissionRequirement.admissionRequirementItems.length - 1].id !== current.arItemId)
                {
                    result.admissionRequirement.admissionRequirementItems.push(admissionRequirementItem);
                }

                firstRow = false;
            });
            return result;
        });
    }
    /**
     * Deletes one entry from CourseInstance table
     * @param params
     */
    deleteUserCourseInstance(params){
        this.poolPromise.query('DELETE FROM usercourseinstance ' + this.createWherePart(params));

    }
    /**
     * Gets the userCourseInstances matching the passed params
     * @param params semesterId, userId
     */
    getUserCourseInstances(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM usercourseinstance ' + this.createWherePart(params));

        return promiseQuery.then((paramsParam) => {
                return paramsParam;
        });
    }

    /**
     * Saves the userCourseInstance matching the passed parameters
     * @param params courseInstanceId, userId
     */
    putUserCourseInstance(params)
    {
        /*let promiseQuery = this.poolPromise.query('INSERT INTO usercourseinstance (userId, courseInstanceId) VALUES (?,?)', [params.userId, params.courseInstanceId]);*/

        let promiseQuery = this.poolPromise.query('INSERT INTO usercourseinstance ' + this.createInsertPart(params));

        return promiseQuery.then((result) => {
            params.id = result.insertId;
            return params;
        });
    }

    /**
     * Gets the courseInstanceGroups matching the passed params
     * @param params courseInstanceId
     */
    getCourseInstanceGroups(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM courseinstancegroup '+ this.createWherePart(params));

        return promiseQuery.then((result) => {
            return result;
        });
    }

    /**
     * Adds new group to table
     * @param params
     */
    putCourseInstanceGroup(courseInstanceGroup){
        let promiseQuery = this.poolPromise.query('INSERT INTO courseinstancegroup ' + this.createInsertPart(courseInstanceGroup));

        return promiseQuery.then((result) => {
            courseInstanceGroup.id =  result.insertId;
            return  courseInstanceGroup;
        });
    }

    /**
     * Updates the given courseInstanceGroup
     * @param params
     */
     postCourseInstanceGroup(courseInstanceGroup, params){
        let promiseQuery = this.poolPromise.query('UPDATE courseInstanceGroup ' + this.createUpdatePart(courseInstanceGroup) + this.createWherePart(params));

        return promiseQuery.then((result) => {
            return result;
        });
    }


    //endregion

    //region - AdmissionRequirements -

    /**
     * Saves the admissionRequirement to the database and returns the admissionRequirement with filled id
     * @param admissionRequirement
     */
    putAdmissionRequirement(admissionRequirement)
    {

        let promiseQuery = this.poolPromise.query('INSERT INTO admissionrequirement ' + this.createInsertPart(admissionRequirement));

        return promiseQuery.then((result) => {
            admissionRequirement.id = result.insertId;
            return admissionRequirement;
        });
    }

    /**
     * Saves the admissionRequirementItem to the database and returns the admissionRequirementItem with filled id
     * @param admissionRequirementItem
     */
    putAdmissionRequirementItem(admissionRequirementItem)
    {
        let promiseQuery = this.poolPromise.query('INSERT INTO admissionrequirementItem ' + this.createInsertPart(admissionRequirementItem));


        return promiseQuery.then((result) => {
            admissionRequirementItem.id = result.insertId;
            return admissionRequirementItem;
        });
    }

    /**
     * Updates the admissionRequirementItem to the database and returns the rows Updated
     * @param admissionRequirementItem entity
     * @param params WHERE params (obviously id...)
     */
    postAdmissionRequirementItem(admissionRequirementItem, params)
    {
        let promiseQuery = this.poolPromise.query('UPDATE admissionrequirementItem ' + this.createUpdatePart(admissionRequirementItem) + ' ' + this.createWherePart(params));

        return promiseQuery.then((result) => {
            return result;
        });
    }

    /**
     * Delete the admissionRequirementItem to the database and returns the rows Updated
     * @param params WHERE params (obviously id...)
     */
    deleteAdmissionRequirementItem(params)
    {
        let promiseQuery = this.poolPromise.query('DELETE FROM admissionrequirementItem ' + this.createWherePart(params));

        return promiseQuery.then((result) => {
            result;
        });
    }

    /**
     * Saves the admissionRequirementItemWeek to the database and returns the admissionRequirementItem with filled id
     * @param admissionRequirementItem
     */
    putAdmissionRequirementItemWeek(admissionRequirementItemWeek)
    {
        let promiseQuery = this.poolPromise.query('INSERT INTO admissionRequirementItemWeek ' + this.createInsertPart(admissionRequirementItemWeek));

        return promiseQuery.then((result) => {
            admissionRequirementItemWeek.id = result.insertId;
            return admissionRequirementItemWeek;
        });
    }

    /**
     * Gets the admissionRequirementItems matching the passed params
     * @param params courseInstanceId
     */
    getAdmissionRequirementItems(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM admissionRequirementItem ' + this.createWherePart(params));

        return promiseQuery;
    }

    /**
     * Gets the admissionRequirements matching the passed params with a list of its Items
     * @param params courseInstanceId
     */
    getAdmissionRequirements(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT ar.id AS arId, ar.courseInstanceId, arItem.id AS itemId, arItem.admissionRequirementType, ' +
            'arItem.expireDate, arItem.minTasks, arItem.maxTasks, arItem.minPercentage, arItem.mandatory FROM admissionRequirement ar ' +
            'LEFT JOIN  admissionRequirementItem arItem ON ar.id = arItem.admissionRequirementId' + this.createWherePart(params) + ' ORDER BY arId');

        return promiseQuery.then((list) => {
            let result = [];
            _.forEach(list, (current) => {
                // At first create Item to use it in both cases
                let admissionRequirementItem = {
                    id: current.itemId,
                    admissionRequirementType: current.admissionRequirementType,
                    expireDate: current.expireDate,
                    minTasks: current.minTasks,
                    maxTasks: current.maxTasks,
                    minPercentage: current.minPercentage,
                    mandatory: current.mandatory
                };

                // Add item to the last admissionRequirement if the id is matching the last id
                if(result.length > 0 && result[result.length - 1].id === current.arId)
                {
                    result[result.length - 1].admissionRequirementItems.push(admissionRequirementItem);
                }
                // Create a new admissionRequirement
                else
                {
                    let temp = {
                        id: current.arId,
                        courseInstanceId: current.courseInstanceId,
                        admissionRequirementItems : [admissionRequirementItem]
                    };
                    result.push(temp)
                }

            });
            return result;
        });
    }


    /**
     * Gets the admissionRequirementItemWeekss matching the passed params
     * @param params
     */
    getAdmissionRequirementItemWeeks(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM admissionRequirementItemWeek ' + this.createWherePart(params));

        return promiseQuery.then((result) => {
            return result;
        });
    }

    //endregion

    //region - UserProgess -

    /**
     * Saves the userProgess to the database and returns the userProgess with filled id
     * @param userProgess
     */
    putUserProgess(userProgressItem)
    {
        /*let promiseQuery = this.poolPromise.query('INSERT INTO userprogress (userId, admissionRequirementItemWeekId, createDate, taskCount) VALUES (?,?,?,?)', [admissionRequirementItem.userId, admissionRequirementItem.admissionRequirementItemWeekId, admissionRequirementItem.createDate, admissionRequirementItem.taskCount]);*/

        let promiseQuery = this.poolPromise.query('INSERT INTO userprogress ' + this.createInsertPart(userProgressItem));

        return promiseQuery.then((result) => {
            userProgressItem.id = result.insertId;
            return userProgressItem;
        });
    }

    /**
     * Gets the userProgresses matching the passed params
     * @param params userId, admissionRequirementWeekId
     */
    getUserProgesses(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM userprogress ' + this.createWherePart(params));

        return promiseQuery;
    }

    /**
     * Deletes single Userprogress Item from table
     * @param id of entry
     */
    deleteUserProgress(param){
        let promiseQuery = this.poolPromise.query('DELETE FROM userprogress WHERE id = ?', [param]);
        return promiseQuery;
    }

    /**
     * Updating UserProgress with defined parameters
     * @param paramPackage
     */
    updateUserProgress(paramPackage, returnObject){
        let promiseQuery = this.poolPromise.query('UPDATE userprogress SET taskCount = ? WHERE id = ?', [paramPackage.taskCount, paramPackage.id]);
        return promiseQuery;
    }

    //endregion

    //region - Help Methods -

    /**
     * Used for lazy creation of insert queries with passed parameters
     * @param Object of columnNames and values
     */
    createInsertPart(params) {

        if (Object.keys(params) <= 0) {
            return '';
        }
        // INSERT INTO ... (column names) VALUES (variables)
        let columns = _.map(params, (value, key) => {
            return this.poolPromise.escapeId(key);
        }).join();

        let values = _.map(params, (value, key) => {
            return this.poolPromise.escape(value);
        }).join();


        return ' (' + columns + ') VALUES (' + values + ')';
    }

    /**
     * Creates a SQL WHERE String including the passed parameters
     * @param params Object of columnNames and values
     */
    createWherePart(params)
    {
        if(Object.keys(params).length <= 0) {
            return '';
        }

        let whereParts = _.map(params, (value, key) => {
            return this.poolPromise.escapeId(key) + '=' + this.poolPromise.escape(value);
        });

        return ' WHERE ' + whereParts.join(' AND ')
    }

    /**
     *
     * @param object
     */
    createUpdatePart(params)
    {
        if(Object.keys(params).length <= 0) {
            return '';
        }

        let whereParts = _.map(params, (value, key) => {
            return this.poolPromise.escapeId(key) + '=' + this.poolPromise.escape(value);
        });

        return ' SET ' + whereParts.join(', ')
    }

    /**
     * Method removes data from table. It does not complain about foreign keys.
     * @param tableName Name of table
     */
    truncateTable(tableName) {
        return this.poolPromise.query("SET FOREIGN_KEY_CHECKS = 0").then(() => {
            return this.poolPromise.query("TRUNCATE ??", [tableName]);
        }).then(() => {
            return this.poolPromise.query("SET FOREIGN_KEY_CHECKS = 1");
        }).catch((error) => {
            throw Error(error);
        })
    }

    //endregion
}

module.exports = DatabaseAdapter;