const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['courseInstanceId']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -
/**
 * Get the admissionRequirements matching the given Parameters
 * Get Parameter: courseInstanceId
 * @return: admissionRequirement Object, contains a List of admissionRequirementItems
 **/
routerInstance.get('/:id?', authenticationMiddleware,  (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {};

    // Handle optional Parameters
    if(req.body.courseInstanceId)
        params.courseInstanceId = req.body.courseInstanceId;

    if(req.params.id)
        params.id = req.params.id;

    // Get the semesters matching the given params
    databaseAdapter.getAdmissionRequirements(params).then((semesters) => {
        res.status(200).json(semesters);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

//region - Put -

/**
 * Saves an admissionRequirementItem to the database
 * Put Parameter: courseInstanceId, items: [ {type, date?, maxTasks?, minTasks?, minPercentage?, mandatory?}, ...]
 */
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware,(req, res, next) => {

    // Check if an admissionRequirement already exists
    let admissionRequirement = {
        courseInstanceId: req.body.courseInstanceId
    };

    // Save the new user
    databaseAdapter.putUserProgress(userProgress).then((userProgress) => {

    });

});

//endregion

//region - Not used -

routerInstance.delete('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.post('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

//endregion

module.exports = routerInstance;
