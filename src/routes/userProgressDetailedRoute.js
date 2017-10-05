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
        courseInstanceId: req.query.courseInstanceId
    }

    databaseAdapter.getCourseUserProgressDetailed(UserProgressTupel).then((stats) =>{
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

    // Mandatory Parameters
    let arItemWeekParams = {
        semesterWeek: req.body.semesterWeek,
        admissionRequirementItemId: req.body.admissionRequirementItemId,
    }

    // Check if an admissionRequirementItemWeek exists for the current semesterWeek
    databaseAdapter.getAdmissionRequirementItemWeeks(arItemWeekParams).then((arItemWeeks) => {
        // Create arItemWeek with maxCount
        if(!arItemWeeks || arItemWeeks.length < 1)
        {
            //TODO: Maxcount mandatory???
            let arItemWeek = {
                ...arItemWeekParams,
                maxCount: req.body.maxCount,
                creationUserId: req.tokenContext.userId
            }

            return databaseAdapter.putAdmissionRequirementItemWeek(arItemWeek);
        }

        return arItemWeeks[0];

    }).then((arItemWeek) => {
        // Save the userProgress to the admissionRequirementItemWeek
        let userProgress = {
            userId: req.tokenContext.userId,
            admissionRequirementItemWeekId: arItemWeek.id,
            taskCount: req.body.taskCount
        };

        return databaseAdapter.putUserProgess(userProgress)
    }).then((userProgress) => {
        res.status(200).json(userProgress);
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
