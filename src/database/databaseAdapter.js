const MySQL = require('promise-mysql');
const DatabaseSecrets = require('../../secrets/databaseSecrets');


class DatabaseAdapter {
    constructor(poolCount) {

        this.poolPromise = MySQL.createPool({
            ...DatabaseSecrets.DatabaseSecrets,
            connectionLimit: poolCount
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
        let promiseQuery = this.poolPromise.query('INSERT INTO user (email,' +
            ' displayName, passwordHash) VALUES(?, ?, ?)',
            [user.email, user.displayName, user.passwordHash]);

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

    }

    /**
     * Gets the courses matching the passed params
     * @param params
     */
    getCourses(params)
    {

    }

    //endregion

    //region - CourseInstances -

    /**
     * Saves the courseInstance to the database and returns the courseInstance with filled id
     * @param courseInstance
     */
    putCourseInstance(courseInstance)
    {

    }

    /**
     * Gets the courseInstances matching the passed params
     * @param params semesterId
     */
    getCourseInstances(params)
    {

    }

    /**
     * Saves the userCourseInstance to the database and returns the userCourseInstance with filled id
     * @param courseInstance
     */
    putCourseInstance(userCourseInstance)
    {

    }

    /**
     * Gets the userCourseInstances matching the passed params
     * @param params semesterId, userId
     */
    getUserCourseInstances(params)
    {

    }

    /**
     * Gets the courseInstanceGroups matching the passed params
     * @param params courseInstanceId
     */
    getCourseInstanceGroups(params)
    {

    }

    //endregion

    //region - AdmissionRequirements -

    /**
     * Saves the admissionRequirement to the database and returns the admissionRequirement with filled id
     * @param admissionRequirement
     */
    putAdmissionRequirement(admissionRequirement)
    {

    }

    /**
     * Saves the admissionRequirementItem to the database and returns the admissionRequirementItem with filled id
     * @param admissionRequirementItem
     */
    putAdmissionRequirementItem(admissionRequirementItem)
    {

    }

    /**
     * Gets the admissionRequirementItems matching the passed params
     * @param params semesterId
     */
    getAdmissionRequirementItems(params)
    {

    }

    //endregion

    //region - UserProgess -

    /**
     * Saves the userProgess to the database and returns the userProgess with filled id
     * @param userProgess
     */
    putUserProgess(admissionRequirementItem)
    {

    }

    /**
     * Gets the userProgresses matching the passed params
     * @param params userId, admissionRequirementWeekId
     */
    getUserProgesses(params)
    {

    }

    //endregion

    //region - Help Methods -

    /**
     * Creates a SQL WHERE String including the passed parameters
     * @param params Array of columnNames and values
     */
    createWherePart(params)
    {

    }

    //endregion
}

module.exports = DatabaseAdapter;