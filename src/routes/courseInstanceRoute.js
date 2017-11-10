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
 * Defines API functions to get/create/update courseInstance(Group)s
 * defaultRoute: /courseInstance
 * @namespace /courseInstance
 */

/**
 * Get the courseInstances from database with filled Semester and Course
 * @function GET
 * @param {string} / path
 * @param {number} semesterId? optional, AS QUERYPARAMETER!
 * @return List of courseInstance Objects
 * @memberOf /courseInstance
 **/
routerInstance.get('/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {

    };

    // Handle optional Parameters
    if(req.query['semesterId'])
        params['semester.id'] = req.query['semesterId'];

    // Get the courseInstances matching the given params
    databaseAdapter.getCourseInstances(params).then((courseInstances) => {
        res.status(200).json(courseInstances);

    }).catch((error) => {
        res.status(500).json(error);
    });
});

/**
 * Get the courseInstances from database with filled Semester, Course and admissionRequirementItems and courseInstanceGroups
 * @function GET
 * @param {string} /:id path
 * @return List of courseInstance Objects
 * @memberOf /courseInstance
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
 * @function GET
 * @param {string} /:id/group/:groupId? path
 * @return List of courseInstance Objects
 * @memberOf /courseInstance
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
 * displayName and ShortName are mandatory if no courseId is passed
 * @function PUT
 * @param {string} / path
 * @param {number} semesterId add the course to a semester
 * @param {number] courseId? optional
 * @param {string} shortName? shortName of the course
 * @param {string} displayName? displayName of the course
 * @param {string} room? room of the courseInstance
 * @param {string} docent? docent of the courseInstance
 * @return courseInstance Object filled with the id
 * @memberOf /courseInstance
 **/
routerInstance.put('/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let courseInstance = {
        semesterId: req.body.semesterId,
        room: req.body.room,
        docent: req.body.docent
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
 * Save a courseInstanceGroup to the database
 * @function PUT
 * @param {string} /:id/group/ path
 * @param {string} room? room of the courseInstanceGroup
 * @param {date} startTime? startTime of the courseInstanceGroup
 * @param {date} endTime? endTime of the courseInstanceGroup
 * @return courseInstanceGroup Object filled with the id
 * @memberOf /courseInstance
 **/
routerInstance.put('/:id/group/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let courseInstanceGroup = {
        courseInstanceId: req.params.id,
        room: req.body.room,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        docent: req.body.docent,
        weekDay: req.body.weekDay
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

/**
 * Updates a courseInstance
 * @function POST
 * @param {string} /:id path
 * @param {string} room? room of the courseInstance
 * @param {string} docent? docent of the courseInstance
 * @return SQL-Result from mysql-js
 * @memberOf /courseInstance
 **/
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
 *
 * Post Parameter:
 **/

/**
 * Updates the courseInstanceGroup
 * @function POST
 * @param {string} /:id/group/:groupId path
 * @param {string} room? room of the courseInstanceGroup
 * @param {date} startTime? startTime of the courseInstanceGroup
 * @param {date} endTime? endTime of the courseInstanceGroup
 * @return SQL-Result from mysql-js
 * @memberOf /courseInstance
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
 * @ignore
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