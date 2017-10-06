const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['displayName', 'startDate', 'endDate']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -

/**
 * Defines API functions to get/create/update semesters
 * defaultRoute: /semester
 * @namespace /semester
 */

/**
 * Get the semesters matching the given Parameters
 * @function GET
 * @param {string} /:id? path
 * @param {date} currentDate? if passed, a semester where currentDate is between startDate and endDate is returned
 * @return List of semester Objects
 * @memberOf /semester
 **/
routerInstance.get('/:id?', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {};

    // Handle optional Parameters
    if(req.params.id)
        params.id = req.params.id;

    // Get the semesters matching the given params
    databaseAdapter.getSemester(params, req.query['currentDate']).then((semesters) => {
        res.status(200).json(semesters);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

//region - Put -

/**
 * Save a semester to the database
 * @function PUT
 * @param {string} / path
 * @param {string} displayName? Displayname of the semester
 * @param {date} startDate? startDate
 * @param {date} endDate? endDate
 * @return semester with filled id
 * @memberOf /semester
 **/
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let semester = {
        displayName: req.body.displayName,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    };

    databaseAdapter.putSemester(semester).then((semester) => {
        res.status(200).json(semester);
    }).catch((error) => {
        res.status(500).json(error);
    });

});

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