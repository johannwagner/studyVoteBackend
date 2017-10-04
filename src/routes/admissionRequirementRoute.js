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
        params['ar.id'] = req.params.id;

    // Get the semesters matching the given params
    databaseAdapter.getAdmissionRequirements(params).then((semesters) => {
        res.status(200).json(semesters);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

/**
 * Get the admissionRequirementItemss matching the given Parameters
 * Get Parameter: courseInstanceId
 * @return: admissionRequirement Object, contains a List of admissionRequirementItems
 **/
routerInstance.get('/:id/item/:itemId?', authenticationMiddleware,  (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {};

    // Handle optional Parameters
    if(req.body.courseInstanceId)
        params.courseInstanceId = req.body.courseInstanceId;

    if(req.params.id)
        params['admissionRequirementId'] = req.params.id;

    if(req.params.itemId)
        params['id'] = req.params.itemId;

    // Get the semesters matching the given params
    databaseAdapter.getAdmissionRequirementItems(params).then((semesters) => {
        res.status(200).json(semesters);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

//region - Put -

/**
 * Saves an admissionRequirement to the database
 * Put Parameter: courseInstanceId, items: [ {type, date?, maxTasks?, minTasks?, minPercentage?, mandatory?}, ...]
 */
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware,(req, res, next) => {

    // Check if an admissionRequirement already exists
    let admissionRequirement = {
        courseInstanceId: req.body.courseInstanceId
    };

    // Save the new user
    databaseAdapter.putAdmissionRequirement(admissionRequirement).then((admissionRequirement) => {
        res.status(200).json(admissionRequirement);
    }).catch((error) => {
        res.status(500).json(error);
    });

});

/**
 * Saves an admissionRequirementItem to the database
 * Put Parameter: courseInstanceId, admissionRequirementId? [ {admissionRequirementType, date?, maxTasks?, minTasks?, minPercentage?, mandatory?}, ...]
 */
routerInstance.put('/item', authenticationMiddleware, ensureParametersMiddleware,(req, res, next) => {

    // Check if an admissionRequirement already exists
    let params = {
        courseInstanceId: req.body.courseInstanceId
    };

    // Handle optional Parameters
    if(req.body.admissionRequirementId)
        params.id = req.body.admissionRequirementId;

    databaseAdapter.getAdmissionRequirements(params).then((admissionRequirement) => {
        // Create admissionRequirement if no one exists
        if(!admissionRequirement || admissionRequirement.length < 1)
            return databaseAdapter.putAdmissionRequirement({courseInstanceId: params.courseInstanceId});

        return admissionRequirement[0];

    }).then((admissionRequirement) => {
        // Create Item to the admissionRequirement
        let admissionRequirementItem = {
            admissionRequirementType: req.body.admissionRequirementType,
            expireDate: req.body.expireDate,
            maxTasks: req.body.maxTasks,
            minTasks: req.body.minTasks,
            minPercentage: req.body.minPercentage,
            mandatory: req.body.mandatory,
            admissionRequirementId: admissionRequirement.id
        };

        return databaseAdapter.putAdmissionRequirementItem(admissionRequirementItem);

    }).then((admissionRequirementItem) => {
        res.status(200).json(admissionRequirementItem);
    }).catch((error) => {
        res.status(500).json(error);
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
