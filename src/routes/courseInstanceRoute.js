const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['semesterId']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);
const handleError = require('../helper/errorHandling');

//region - Get -

/**
 * Get the courseInstances from database
 * Get Parameter: semesterId, courseId
 * returns: the courseInstances matching the given parameters
 **/
routerInstance.get('/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {

    };

    // Handle optional Parameters
    if(req.query['semesterId'])
        params['semester.id'] = req.query['semesterId'];

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
 * Get the courseInstances from database
 * Get Parameter: semesterId, courseId
 * returns: the courseInstances matching the given parameters
 **/
routerInstance.get('/:id', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {
        'courseInstance.id': req.params.id
    };

    // Get the courseInstances matching the given params
    databaseAdapter.getCourseInstanceDetails(params).then((courseInstance) => {
        res.status(200).json(courseInstance);

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

//region - Post -

routerInstance.post('/:id', (req, res, next) => {
    // Update the existing admissionRequirementItem
    let params = {
        'courseInstance.id': req.params.id
    };

    // Fetch the row from the Database to be sure it exists
    databaseAdapter.getCourseInstances(params).then((courseInstances) => {

        if(!courseInstances || courseInstances.length < 1)
            throw { message: 'CourseInstance for id ' + params.id + ' not found', errorCode: Constants.ErrorConstants.NO_ENTRY_FOR_ID };

        return courseInstances[0];

    }).then((courseInstance) => {

        let newCourseInstance = {};

        // Update only passed Parameters
        if(req.body.docent)
            newCourseInstance.docent = req.body.docent;

        if(req.body.room)
            newCourseInstance.room = req.body.room;

        if(Object.keys(newCourseInstance).length < 1)
            throw { message: 'No update Parameter sent', errorCode: Constants.ErrorConstants.INVALID_PARAMETERS};

        return databaseAdapter.postCourseInstance(newCourseInstance, { id: req.params.id });

    }).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        handleError(req, res, next, error);
    });
});

/**
 * Updates the courseInstanceGroups
 * Post Parameter:
 **/
routerInstance.post('/:id/group/:groupId', authenticationMiddleware, (req, res, next) => {
    // Update the existing admissionRequirementItem
    let params = {
        id: req.params.groupId
    };

    // Fetch the row from the Database to be sure it exists
    databaseAdapter.getCourseInstanceGroups(params).then((courseInstanceGroups) => {

        if(!courseInstanceGroups || courseInstanceGroups.length < 1)
            throw { message: 'CourseInstanceGroup for id ' + params.id + ' not found', errorCode: Constants.ErrorConstants.NO_ENTRY_FOR_ID };

        return courseInstanceGroups[0];

    }).then((courseInstanceGroup) => {

        let newCourseInstanceGroup = {};

        // Update only passed Parameters
        if(req.body.room)
            newCourseInstanceGroup.room = req.body.room;

        if(req.body.startTime)
            newCourseInstanceGroup.startTime = req.body.startTime;

        if(req.body.endTime)
            newCourseInstanceGroup.endTime = req.body.endTime;

        if(Object.keys(newCourseInstanceGroup).length < 1)
            throw { message: 'No update Parameter sent', errorCode: Constants.ErrorConstants.INVALID_PARAMETERS};

        return databaseAdapter.postCourseInstanceGroup(newCourseInstanceGroup, { id: req.params.groupId });

    }).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        handleError(req, res, next, error);
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