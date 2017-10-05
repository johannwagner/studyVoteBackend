const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['admissionRequirementItemId', 'semesterWeek']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);

//region - Get -
/**
 *
 */
routerInstance.get('/', authenticationMiddleware,  (req, res, next) => {
    let UserProgressTupel = {
        userId: req.tokenContext.userId,
        semesterId : req.query.semesterId,
    }

    databaseAdapter.getCourseUserProgressComplete(UserProgressTupel).then((stats) =>{
        res.status(200).json(stats);
    }).catch((error) => {
        res.status(500).json(error);
    });

});

//endregion

//region - Put -

/**
 * Saves a userProgress to the database
 * Put Parameter: admissionRequirementItemId, taskCount?, maxTaskCount?, semesterWeek
 */
routerInstance.put('/', authenticationMiddleware, ensureParametersMiddleware,(req, res, next) => {
//Empty for now because of slight repurpose of userProgressRoute
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
