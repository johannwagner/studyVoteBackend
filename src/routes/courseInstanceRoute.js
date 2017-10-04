const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['semesterId']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -

/**
 * Get the courseInstances from database
 * Get Parameter: semesterId, courseId
 * returns: the courseInstances matching the given parameters
 **/
routerInstance.get('/:id?', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {

    };

    // Handle optional Parameters
    if(req.query['semesterId'])
        semesterId: req.query['semesterId'];

    if(req.params.id)
        params['courseInstance.id'] = req.params.id;

    // Get the courseInstances matching the given params
    databaseAdapter.getCourseInstances(params).then((courseInstances) => {
        res.status(200).json(courseInstances);

    }).catch((error) => {
        res.status(500).json(error);
    });
});

/**
 * Get the courseInstanceGroups from database
 * Get Parameter:
 * returns: the courseInstanceGroups matching the given id
 **/
routerInstance.get('/:id/group/:groupId?', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {
        courseInstanceId: req.params.id
    };

    // Handle optional parameters
    if(req.params.groupId)
        params.id = req.params.groupId;

    // Get the courseInstanceGroups matching the given params
    databaseAdapter.getCourseInstanceGroups(params).then((courseInstanceGroups) => {
        res.status(200).json(courseInstanceGroups);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

//region - Put -

/**
 * Save a courseInstance, if the courseId is not filled, create course automatically
 * Put Parameter: semesterId, courseId?, shortName?, displayName?; displayName and ShortName are mandatory if no courseId is passed
 **/
routerInstance.put('/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let courseInstance = {
        semesterId: req.body.semesterId
    };

    // courseId
    if(req.body.courseId) {
        courseInstance.courseId = req.body.courseId;

        // Insert courseInstance
        putCourseInstance(req, res, next, courseInstance);
    }
    // Create course if shortName and displayName are valid
    else if(req.body.shortName && req.body.displayName) {
        let course = {
                shortName: req.body.shortName,
                displayName: req.body.displayName
            };

        databaseAdapter.putCourse(course).then((course) => {
            courseInstance.courseId = course.id;

            return putCourseInstance(req, res, next, courseInstance);
        });
    }
    // Invalid parameters
    else {
        res.status(422).json({
            error: 'CreateCourseInstance: displayName and shortName cannot be null if no courseId is passed',
            errorCode: Constants.ErrorConstants.INVALID_PARAMETERS
        });
        return;
    }

});

/**
 * Saves the courseInstanceGroup to database
 * Put Parameter: room?, startTime?, endTime?
 **/
routerInstance.put('/:id/group/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let courseInstanceGroup = {
        courseInstanceId: req.params.id,
        room: req.body.room,
        startTime: req.body.startTime,
        endTime: req.body.endTime
    };

    // Get the courseInstanceGroups matching the given params
    databaseAdapter.putCourseInstanceGroup(courseInstanceGroup).then((courseInstanceGroup) => {
        res.status(200).json(courseInstanceGroup);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

//region - Help Methods -

/**
 * Saves the given courseInstance to the database and sends back the id in case of success
 * @param req request
 * @param res response
 * @param next next
 * @param courseInstance courseInstance
 * @returns {Promise.<TResult>}
 */
function putCourseInstance(req, res, next, courseInstance)
{
    return databaseAdapter.putCourseInstance(courseInstance).then((courseInstance) => {
        res.status(200).json(courseInstance);
    }).catch((error) => {
        switch(error.code)
        {
            case 'ER_DUP_ENTRY':
                res.status(500).json({
                    error: 'CourseInstance already existing in the semester',
                    errorCode: Constants.ErrorConstants.DUPLICATE_ENTRY
                });
                break;
            default:
                res.status(500).json({
                    error: error.sqlMessage,
                    errorCode: Constants.ErrorConstants.DATABASE_ERROR
                });
        }
    });
}

//endregion

//region - Not Used -

routerInstance.delete('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.post('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

//endregion

module.exports = routerInstance;