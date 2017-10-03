const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['email', 'displayName', 'passwordHash']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);


routerInstance.get('/:id', authenticationMiddleware, ensureParametersMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {userId: req.tokenContext.userId};

    // CourseInstanceId
    if(req.params.id)
        params.id = req.params.id;

    // SemesterId
    if(req.body.semesterId)
        params.semesterId = req.body.semesterId;

    // courseId
    if(req.body.courseId)
        params.courseId = req.body.courseId;

    // Get the courses matching the given params
    databaseAdapter.getCourseInstances(params).then((courseInstances) => {
        res.status(200).json(courseInstances);

    }).catch((error) => {
        res.status(500).json(error);
    });
});

routerInstance.post('/', (req, res, next) => {

});

routerInstance.put('/', ensureParametersMiddleware,(req, res, next) => {

});

routerInstance.delete('/', (req, res, next) => {

});

module.exports = routerInstance;