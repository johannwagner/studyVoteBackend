const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['courseInstanceId']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -

/**
 * Get the userCourseInstances from database for the current User
 * Get Parameter: courseId
 * returns: the semester matching the currentDate or if undefined all semesters
 **/
routerInstance.get('/', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {
        userId: req.tokenContext.userId
    };

    // Handle optional parameters
    if(req.headers['courseid'])
        params.courseId = req.headers['courseid'];

    // Get the userCourseInstances matching the given params
    databaseAdapter.getUserCourseInstances(params).then((userCourseInstances) => {
        res.status(200).json(userCourseInstances);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

//region - Put -

/**
 * Save a userCourseInstance for the current User
 * Put Parameter: courseInstanceId
 **/
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let userCourseInstance = {
        courseInstanceId: req.body.courseInstanceId,
        userId: req.tokenContext.userId
    };

    databaseAdapter.putUserCourseInstance(userCourseInstance).then((userCourseInstance) => {
        res.status(200).json(userCourseInstance);
    }).catch((error) => {
        res.status(500).json(error);
    });

});

//endregion

//region - Not Used -

routerInstance.delete('/', (req, res, next) => {

});

routerInstance.post('/', (req, res, next) => {

});

//endregion

module.exports = routerInstance;