const MySQL = require('promise-mysql');
const DatabaseSecrets = require('../../secrets/databaseSecrets');
const _ = require('lodash');

class DatabaseAdapter {
    constructor(poolCount = 5) {

        const inTestMode = process.env.NODE_ENV === 'test';

        this.poolPromise = MySQL.createPool({
            ...DatabaseSecrets.DatabaseSecrets,
            connectionLimit: poolCount,
            database: DatabaseSecrets.DatabaseSecrets.database + ( inTestMode ? 'test' : '' )
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
    getCourseUserProgressD(userProgressTupel){
        let promiseQuery = this.poolPromise.query('SELECT courseinstance.id as courseinstanceId, course.displayname, course.shortname, semester.displayname, semester.aenddate, semester.id as SemesterId, admissionrequirementitem.minPercentage, admissionrequirementitem.minTasks, admissionrequirementitem.maxTasks, admissionrequirementitem.mandatory, admissionrequirementitem.admissionrequirementtype, admissionrequirementitemweek.maxCount, admissionrequirementitemweek.creationUserId, admissionRequirementitemweek.semesterweek, userProgress.`taskCount` FROM \n' +
            '\n' +
            'usercourseinstance \n' +
            'JOIN courseinstance ON courseinstance.id = usercourseinstance.courseinstanceid \n' +
            'JOIN course ON course.id = courseinstance.courseid \n' +
            'JOIN semester ON semester.id = courseinstance.semesterid \n' +
            'JOIN admissionrequirement ON courseinstance.id = admissionrequirement.courseinstanceid \n' +
            'JOIN admissionrequirementitem ON admissionrequirement.id = admissionrequirementitem.admissionrequirementid \n' +
            'LEFT JOIN admissionrequirementitemweek ON admissionrequirementitem.id = admissionrequirementitemweek.admissionrequirementitemid\n' +
            'JOIN userProgress ON userProgress.admissionrequirementitemweekid = admissionrequirementitemweek.id\n' +
            'WHERE usercourseinstance.userid = 1', [userProgressTupel.courseInstanceId, userProgressTupel.userId]);

        return promiseQuery;
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

            let promiseQuery = this.poolPromise.query('SELECT courseinstance.id as courseinstanceId, course.displayname as CourseName , course.shortname as CourseShortName, semester.displayname as SemesterName, semester.enddate, semester.id as SemesterId, admissionrequirementitem.minPercentage, admissionrequirementitem.minTasks, admissionrequirementitem.maxTasks, admissionrequirementitem.mandatory, admissionrequirementitem.admissionrequirementtype, SUM(admissionrequirementitemweek.maxCount) as TasksAvailable, SUM(userProgress.`taskCount`) as TasksSolved, admissionrequirementitem.minPercentage, courseinstance.room, courseinstance.docent, (SUM(userProgress.`taskCount`) / SUM(admissionrequirementitemweek.maxCount)) as Percentage\n' +
                '\n' +
                'FROM \n' +
                '\n' +
                'usercourseinstance \n' +
                'JOIN courseinstance ON courseinstance.id = usercourseinstance.courseinstanceid \n' +
                'JOIN course ON course.id = courseinstance.courseid \n' +
                'JOIN semester ON semester.id = courseinstance.semesterid \n' +
                'JOIN admissionrequirement ON courseinstance.id = admissionrequirement.courseinstanceid \n' +
                'JOIN admissionrequirementitem ON admissionrequirement.id = admissionrequirementitem.admissionrequirementid \n' +
                'LEFT JOIN admissionrequirementitemweek ON admissionrequirementitem.id = admissionrequirementitemweek.admissionrequirementitemid\n' +
                'JOIN userProgress ON userProgress.admissionrequirementitemweekid = admissionrequirementitemweek.id\n' +
                'WHERE usercourseinstance.userid = 1 AND admissionrequirementitem.mandatory = 1 AND admissionrequirementitem.admissionrequirementtype = 0' + semesterisnotNull, [userProgressTupel.userId]);

        return promiseQuery.then((result) => {
            return {
                Result : {
                    TasksAccomplished : result[0].TasksSolved,
                    TasksAvailable: result[0].TasksAvailable,
                    PercentageDone : result[0].Percentage
                },
                courseInstance : {
                    Id : result[0].courseinstanceId,
                    displayName : result[0].CourseName,
                    shortName : result[0].CourseShortName,
                    Room : result[0].room,
                    Docent : result[0].docent
                },
                Semester : {
                    Id : result[0].SemesterId,
                    EndDate : result[0].enddate,
                    Name : result[0].SemesterName
                },
                Requirements : {
                    minTasks : result[0].minTasks,
                    maxTasks : result[0].maxTasks,
                    Type : result[0].admissionRequirementType,
                    minPercentage : result[0].minPercentage
                }
            };
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

            queryString += this.poolPromise.escape(currentDate) + ' BETWEEN startDate AND endDate ';
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

    //endregion

    //region - AdmissionRequirements -

    /**
     * Saves the admissionRequirement to the database and returns the admissionRequirement with filled id
     * @param admissionRequirement
     */
    putAdmissionRequirement(admissionRequirement)
    {
        /*let promiseQuery = this.poolPromise.query('INSERT INTO admissionrequirement (courseInstanceId) VALUES (?)', [admissionRequirement.courseInstanceId]);*/

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
        /*let promiseQuery = this.poolPromise.query('INSERT INTO admissionrequirement (admissionRequirementType, expireDate, maxTasks, minTasks, minPercentage, mandatory, admissionRequirementId) VALUES (?,?,?,?,?,?,?)', [admissionRequirementItem.admissionRequirementType, admissionRequirementItem.expireDate, admissionRequirementItem.maxTasks, admissionRequirementItem.minTasks, admissionRequirementItem.minPercentage, admissionRequirementItem.mandatory, admissionRequirementItem.admissionRequirementId]);*/

        let promiseQuery = this.poolPromise.query('INSERT INTO admissionrequirementItem ' + this.createInsertPart(admissionRequirementItem));


        return promiseQuery.then((result) => {
            admissionRequirementItem.id = result.insertId;
            return admissionRequirementItem;
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
            'INNER JOIN  admissionRequirementItem arItem ON ar.id = arItem.admissionRequirementId' + this.createWherePart(params) + ' ORDER BY arId');

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