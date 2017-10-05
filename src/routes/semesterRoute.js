const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['displayName', 'startDate', 'endDate']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -

/**
 * Get the semesters from database
 * Get Parameter: currentDate?
 * returns: the semester matching the currentDate or if undefined all semesters
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
 * Save a semester
 * Put Parameter: displayName, startDate, endDate
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