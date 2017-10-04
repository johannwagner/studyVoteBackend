const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['admissionRequirementItemId']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -
/**
 *
 */
routerInstance.get('/', authenticationMiddleware,  (req, res, next) => {
    let UserProgressTupel = {
        userId: req.body.userId,
    }

    databaseAdapter.getCourseUserProgressComplete(UserProgressTupel).then((stats) =>{
        res.send(200).json(stats);
    }).catch((error) => {
        res.status(500).json(error);
    });

});

//endregion

//region - Put -

/**
 * Saves a userProgress to the database
 * Put Parameter: admissionRequirementItemId, taskCount?
 */
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware,(req, res, next) => {
    // userId, admissionRequirementItemWeekId, taskCount
    let userProgress = {
        userId: req.body.userId,
        admissionRequirementItemWeekId: req.body.admissionRequirementItemWeekId,
        taskCount: req.body.taskCount
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
