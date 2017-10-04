const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;
const ensureParametersMiddleware = require('../middleware/ensureParameters').ensureParameters(['email', 'displayName', 'passwordHash']);
const DatabaseAdapter = require('../database/databaseAdapter');
const databaseAdapter = new DatabaseAdapter(5);
const createSignedToken = require('../helper/tokenhelper').createSignedToken;

//region - Put -

/**
 * Saves a user to the database, checks if a user already exists to the email and sends the jwt token back
 * Put Parameter: email, displayName, passwordHash
 */
routerInstance.put('/', ensureParametersMiddleware ,(req, res, next) => {

    // Check if User with the given email address already exists
    databaseAdapter.getUser({userMail: req.body.email}).then((user) =>  {
        if(user) {
            throw { message: 'User already registered',
                code: Constants.ErrorConstants.USER_ALREADY_REGISTERED };
        }

        let newUser = {
                email: req.body.email,
                displayName: req.body.displayName,
                passwordHash: req.body.passwordHash
            };

        // Save the new user
        return databaseAdapter.putUser(newUser);

    }).then((user) => {
        let jwtToken = createSignedToken({userId: user.id});

        res.status(200).json({
            token: jwtToken
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

routerInstance.get('/', authenticationMiddleware,  (req, res, next) => {
    res.status(403).send('not implemented');
});

routerInstance.post('/', (req, res, next) => {
    res.status(403).send('not implemented');
});

//endregion

module.exports = routerInstance;
