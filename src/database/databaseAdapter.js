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
            promiseQuery = this.poolPromise.query('SELECT * FROM user WHERE email = ?', [userParams.userMail])
        } else {
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
        /*let promiseQuery = this.poolPromise.query('INSERT INTO user (email,' +
            ' displayName, passwordHash) VALUES(?, ?, ?)',
            [user.email, user.displayName, user.passwordHash]);
*/
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
        /*let promiseQuery = this.poolPromise.query('INSERT INTO course (shortName, displayName) VALUES ' +
            '(?,?)',[course.shortName, course.displayName]);*/

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

    //region - semester
    //TODO put & get semester, delete usercourseinstance

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
        let promiseQuery = this.poolPromise.query('SELECT courseInstance.id, course.shortName, course.displayName, courseInstance.semesterId, course.id as course.id2 FROM courseInstance JOIN course ON courseInstance.courseId = course.id ' + this.createWherePart(params));

        return promiseQuery.then((list) => {
            let result = [];
            _.forEach(list, (current) => {
                let temp2 = {
                    id: current.id2,
                    shortName: current.shortName,
                    displayName: current.displayName,
                    };
                let temp = {
                    id: current.id,
                    course: temp2,
                    semesterId: current.semesterId,
                    };
                result.push(temp)
                });
            return result;
            });
    }

    /**
     * Gets the userCourseInstances matching the passed params
     * @param params semesterId, userId
     */
    getUserCourseInstances(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM usercourseinstance ' + this.createWherePart(params));

        return promiseQuery.then((paramsParam) => {
            if(paramsParam.length <= 0) {
                return null;
            } else {
                return paramsParam;
            }
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

        let promiseQuery = this.poolPromise.query('INSERT INTO admissionrequirement ' + this.createInsertPart(admissionRequirementItem));


        return promiseQuery.then((result) => {
            admissionRequirementItem.id = result.insertId;
            return admissionRequirementItem;
        });
    }

    /**
     * Gets the admissionRequirementItems matching the passed params
     * @param params courseInstanceId
     */
    getAdmissionRequirementItems(params)
    {
        let promiseQuery = this.poolPromise.query('SELECT * FROM admissionRequirementItem ' + this.createWherePart(params));

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

        return promiseQuery.then((paramsParam) => {
            if(paramsParam.length <= 0) {
                return null;
            } else {
                return paramsParam;
            }
        });
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