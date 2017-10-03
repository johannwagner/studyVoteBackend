const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['email', 'displayName', 'passwordHash']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

routerInstance.get('/', authenticationMiddleware,  (req, res, next) => {
    res.send({message: 'Hallo Fred.', tokenContext: req.tokenContext})
});

routerInstance.post('/', (req, res, next) => {

});

/**
 * Saves a userProgress to the database
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

routerInstance.delete('/', (req, res, next) => {

});

module.exports = routerInstance;
