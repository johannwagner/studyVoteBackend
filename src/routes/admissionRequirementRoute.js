const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['courseInstanceId']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);
const handleError = require('../helper/errorHandling');
const _ = require('lodash');

//region - Get -
/**
 * @namespace /admissionRequirement
 */

/**
 * Get the admissionRequirements matching the given Parameters
 * @function GET
 * @param {number} /:id? path
 * @param {number} courseInstanceId optional
 * @return admissionRequirement Object, contains a List of admissionRequirementItems
 * @memberOf /admissionRequirement
 **/
routerInstance.get('/:id?', authenticationMiddleware, (req, res, next) => {

    // Check which parameters are passed in the request
    let params = {};

    // Handle optional Parameters
    if (req.body.courseInstanceId)
        params.courseInstanceId = req.body.courseInstanceId;

    if (req.params.id)
        params['ar.id'] = req.params.id;

    // Get the semesters matching the given params
    databaseAdapter.getAdmissionRequirements(params).then((semesters) => {
        res.status(200).json(semesters);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

/**
 * Get the admissionRequirementItems matching the given Parameters
 * @function GET
 * @param {number} /:id/item/:itemId? path
 * @param {number} courseInstanceId optional
 * @return admissionRequirementItems
 * @memberOf /admissionRequirement
 **/
routerInstance.get('/:id/item/:itemId?', authenticationMiddleware, (req, res, next) => {

        // Check which parameters are passed in the request
        let params = {};

        // Handle optional Parameters
        if (req.body.courseInstanceId)
            params.courseInstanceId = req.body.courseInstanceId;

        if (req.params.id)
            params['admissionRequirementId'] = req.params.id;

        if (req.params.itemId)
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
 * @function PUT
 * @param {number} / path
 * @param {number} courseInstanceId mandatory
 * @return admissionRequirement
 * @memberOf /admissionRequirement
 **/
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
 * @function PUT
 * @param {number} /item path
 * @param {number} courseInstanceId mandatory
 * @param {number} type admissionRequirementType
 * @param {date} expireDate?
 * @param {number} maxTasks?
 * @param {number} minTasks?
 * @param {float} minPercentage?
 * @param {bool} mandatory?
 * @return admissionRequirementItem
 * @memberOf /admissionRequirement
 **/
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

//region - Post -

/**
 * Updates the exisiting admissionRequirementItem
 * @function POST
 * @param {number} /item/:id path
 * @param {number} courseInstanceId?
 * @param {number} type admissionRequirementType
 * @param {date} expireDate?
 * @param {number} maxTasks?
 * @param {number} minTasks?
 * @param {float} minPercentage?
 * @param {bool} mandatory?
 * @return SQL-Result from mysql-js
 * @memberOf /admissionRequirement
 **/
routerInstance.post('/item/:id', authenticationMiddleware, (req, res, next) => {

    // Update the existing admissionRequirementItem
    let params = {
        id: req.params.id
    };

    // Fetch the row from the Database to be sure it exists
    databaseAdapter.getAdmissionRequirementItems(params).then((admissionRequirementItems) => {

        if(!admissionRequirementItems || admissionRequirementItems.length < 1)
            throw { message: 'AdmissionRequirement for id ' + params.id + ' not found', errorCode: Constants.ErrorConstants.NO_ENTRY_FOR_ID };

        return admissionRequirementItems[0];

    }).then((admissionRequirementItem) => {

        let newAdmissionRequirementItem = {};

        // Update only passed Parameters
        if(req.body.admissionRequirementType)
            newAdmissionRequirementItem.admissionRequirementType = req.body.admissionRequirementType;

        if(req.body.expireDate)
            newAdmissionRequirementItem.expireDate = req.body.expireDate;

        if(!_.isUndefined(req.body.maxTasks))
            newAdmissionRequirementItem.maxTasks = req.body.maxTasks;

        if(!_.isUndefined(req.body.minTasks))
            newAdmissionRequirementItem.minTasks = req.body.minTasks;

        if(req.body.minPercentage)
            newAdmissionRequirementItem.minPercentage = req.body.minPercentage;

        if(!_.isUndefined(req.body.mandatory))
            newAdmissionRequirementItem.mandatory = req.body.mandatory;

        if(Object.keys(newAdmissionRequirementItem).length < 1)
            throw { message: 'No update Parameter sent', errorCode: Constants.ErrorConstants.INVALID_PARAMETERS};

        return databaseAdapter.postAdmissionRequirementItem(newAdmissionRequirementItem, params);

    }).then((admissionRequirementItem) => {
        res.status(200).json(admissionRequirementItem);
    }).catch((error) => {
        handleError(req, res, next, error);
    });

});

//endregion

//region - Delete -

/**
 *  Deletes the admissionRequirement if no references are set to it
 * @function DELETE
 * @param {number} /item/id: path
 * @return SQL-Result from mysql-js
 * @memberOf /admissionRequirement
 **/
routerInstance.delete('/item/:id', (req, res, next) => {
    // Update the existing admissionRequirementItem
    let params = {
        id: req.params.id
    };

    // Fetch the row from the Database to be sure it exists
    databaseAdapter.getAdmissionRequirementItems(params).then((admissionRequirementItems) => {

        if(!admissionRequirementItems || admissionRequirementItems.length < 1)
            throw { message: 'AdmissionRequirement for id ' + params.id + ' not found', errorCode: Constants.ErrorConstants.NO_ENTRY_FOR_ID };

        return admissionRequirementItems[0];

    }).then((admissionRequirementItem) => {
        return databaseAdapter.deleteAdmissionRequirementItem(params);

    }).then((result) => {
        res.status(200).json(result);
    }).catch((error) => {
        handleError(req, res, next, error);
    });
});

//endregion

//region - Not used -

routerInstance.delete('/:id?', (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.post('/:id?', (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.post('/item', (req, res, next) => {
    res.status(403).send('not implemented');
});

//endregion

module.exports = routerInstance;