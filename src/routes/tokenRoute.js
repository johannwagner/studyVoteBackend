const express = require('express');
const jsonWebToken = require('jsonwebtoken');
const routerInstance = express.Router();
const DatabaseAdapter = require('../database/databaseAdapter');
const Constants = require('../Constants');
const databaseAdapter = new DatabaseAdapter(5);
const createSignedToken = require('../helper/tokenhelper').createSignedToken;

//region - Post -

/**
 * Defines API functions to login a user into the backend
 * defaultRoute: /tokenRoute
 * @namespace /tokenRoute
 */

/**
 * Performs a login operation and sends back the Json Web Token
 * @function POST
 * @param {string} / path
 * @param {string} userMail email of the user
 * @param {string} userPasswordHash passwordHash of the user
 * @return Json Web Token
 * @memberOf /tokenRoute
 **/
routerInstance.post('/', (req, res, next) => {
    let userMail = req.body.userMail;
    let userPasswordHash = req.body.userPasswordHash;

    databaseAdapter.getUser({userMail: userMail}).then((user) => {
        if(!user) {
            throw Error('Unknown User.', Constants.ErrorConstants.UNKNOWN_USER);
        }

        if(user.passwordHash !== userPasswordHash) {
            throw Error('Wrong Password.', Constants.ErrorConstants.WRONG_PASSWORD)
        }

        const jwtOptions = {
            expiresIn: '7d'
        };

        let jwtToken = createSignedToken({userId: user.id});

        res.status(200).json({
            token: jwtToken
        });

    }).catch((error) => {
        res.status(500).json(error);
    })
});

//endregion

//region - Not used -

routerInstance.delete('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.put('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.get('/', (req, res, next) => {
    res.status(403).send('not implemented');
});


//endregion

module.exports = routerInstance;

