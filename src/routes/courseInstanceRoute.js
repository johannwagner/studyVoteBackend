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
routerInstance.get('/:id', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {
        semesterId: req.headers['semesterid'],
        courseId: req.params.id
    };

    // Get the courses matching the given params
    databaseAdapter.getCourseInstances(params).then((courseInstances) => {
        res.status(200).json(courseInstances);

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
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware,(req, res, next) => {

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
        res.status(200).json({ id: courseInstance.id});
    }).catch((error) => {
        res.status(500).json(error);
    });
}

//endregion

//region - Not Used -

routerInstance.delete('/', (req, res, next) => {

});

routerInstance.post('/', (req, res, next) => {

});

//endregion

module.exports = routerInstance;