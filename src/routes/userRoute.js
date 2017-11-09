const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['userMail', 'displayName', 'userPasswordHash']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);
const createSignedToken = require('../helper/tokenhelper').createSignedToken;


//region - Get -

/**
 * Defines API functions to get/create a user
 * defaultRoute: /user
 * @namespace /user
 */

/**
 * Gets the user matching the passed json web token without passwordHash
 * @function GET
 * @param {string} / path
 * @return user without passwordHash
 * @memberOf /user
 **/
routerInstance.get('/', authenticationMiddleware, (req, res, next) => {
    databaseAdapter.getUser({userId: req.tokenContext.userId}).then((user) => {
        user.passwordHash = null;
        res.status(200).json(user);
    }).catch((error) => {
        res.status(500).json(error);
    })
});

//endregion

//region - Put -

/**
 * Saves a user to the database,
 * Put Parameter: email, displayName, passwordHash

 /**
 * Saves a user to the database, checks if a user already exists to the email and sends the Json Web Token back
 * @function PUT
 * @param {string} / path
 * @param {string} userMail email of the user
 * @param {string} userPasswordHash passwordHash of the user
 * @param {string} displayName displayName of the user
 * @return Json Web Token
 * @memberOf /user
 **/
routerInstance.put('/', ensureParametersMiddleware ,(req, res, next) => {

    // Check if User with the given email address already exists
    databaseAdapter.getUser({userMail: req.body.userMail}).then((user) =>  {
        if(user) {
            throw { message: 'User already registered',
                code: Constants.ErrorConstants.USER_ALREADY_REGISTERED };
        }

        let newUser = {
                email: req.body.userMail,
                displayName: req.body.displayName,
                passwordHash: req.body.userPasswordHash
            };

        // Save the new user
        return databaseAdapter.putUser(newUser);

    }).then((user) => {
        let jwtToken = createSignedToken({userId: user.id});

        databaseAdapter.getSemester({}, new Date().toISOString().slice(0, 19).replace('T', ' ')).then((semester) => {
            if(!semester || semester.length < 1)
            {
                res.status(200).json({
                    token: jwtToken
                });
            }
            else
            {
                res.status(200).json({
                    token: jwtToken,
                    semester: semester[0]
                });
            }

        }).catch((error) =>
        {
            res.status(500).json({ message: 'Can not get current Semester',
                code: Constants.ErrorConstants.UNKNOWN_ERROR });
        });

    }).catch((error) => {
        res.status(500).json({
            error: error.message,
            errorCode: error.code
        });
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
