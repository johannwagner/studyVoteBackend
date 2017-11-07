const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['admissionRequirementItemId', 'semesterWeek']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);
//const aaaa = require('jsdoc')
//region - Get -
/**
 * Defines API functions to get/create/update/delete userProgressItems
 * defaultRoute: /userProgress
 * @namespace /userProgress
 */

/**
 * Get userProgress statistics according to the current userId for all occupied courses
 * @function GET
 * @param {string} /:id? id of the user
 * @param {number} semesterId id of the current or selected semester
 * @return List of all occupied courses with the total number of mandatory vote tasks as well as solved ones
 * @memberOf /userProgress
 **/
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

/**
 * Get userProgress statistics according to the current userId for a single course
 * @function GET
 * @param {string} /:id? path
 * @param {number} courseInstanceId id of the select courseInstance
 * @return List of all userProgressItems for a single course with some additional information
 * @memberOf /userProgress
 **/
routerInstance.get('/:courseInstanceId', authenticationMiddleware,  (req, res, next) => {
    let UserProgressTupel = {
        userId: req.tokenContext.userId,
        courseInstanceId: req.params.courseInstanceId
    };

    databaseAdapter.getCourseUserProgressDetailed(UserProgressTupel).then((stats) =>{
        res.status(200).json(stats);
    }).catch((error) => {
        res.status(500).json(error);
    });

});
//endregion

//region - Put -

/**
 * Inserts UserProgressItem for a single admissionRequirementItemWeek
 * @function PUT
 * @param {string} / path
 * @param {number} admissionRequirementItemId id of the selected RequirementItem
 * @param {number} taskCount Count of tasks the user want to vote
 * @param {number} maxCount Max count of tasks for this week
 * @param {semesterWeek} semesterWeek Current SemesterWeek
 * @return returns inserted item for control purposes
 * @memberOf /userProgress
 **/
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

        let filterParams = {
            userId: req.tokenContext.userId,
            admissionRequirementItemWeekId: arItemWeek.id
        };
        arItemWeekParams.weekId =  arItemWeek.id;

        return databaseAdapter.getUserProgesses(filterParams);

    }).then((userProgresses) => {

        // Save the userProgress to the admissionRequirementItemWeek
        let userProgress = {
            userId: req.tokenContext.userId,
            admissionRequirementItemWeekId: arItemWeekParams.weekId,
            taskCount: req.body.taskCount
        };

        if(!userProgresses || userProgresses.length < 1) {
            return databaseAdapter.putUserProgess(userProgress);
        }
        else
        {
            let newUserProgress = {
                id: userProgresses[0].id,
                taskCount: userProgress.taskCount
            };
            return databaseAdapter.updateUserProgress(newUserProgress, true);
        }
    }).then((userProgress) => {
        res.status(200).json(userProgress);
    }).catch((error) => {
        res.status(500).json(error);
    });


});

//endregion

//region - Not used till now!-

/**
 * Deletes a single userProgress entry
 * @function DELETE
 * @param {string} /:id? id of the entry
 * @return stats of deletion
 * @memberOf /userProgress
 **/
routerInstance.delete('/:id', (req, res, next) => {
    return databaseAdapter.deleteUserProgress(req.params.id).then((userProgress) => {
        res.status(200).json(userProgress);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

/**
 * Edit a single entry of the userProgress table, only taskCount changeable
 * @function PUT
 * @param {string} /:id? id of the user
 * @param {number} taskCount amount of solved tasks
 * @return stats of update
 * @memberOf /userProgress
 **/
routerInstance.post('/:id', (req, res, next) => {
    let valuePackage = {
        id : req.params.id
    };
    if(req.body.taskCount) {
        valuePackage.taskCount = req.body.taskCount;
    }

    return databaseAdapter.updateUserProgress(valuePackage).then((userProgress) => {
        res.status(200).json(userProgress);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

//endregion

module.exports = routerInstance;
