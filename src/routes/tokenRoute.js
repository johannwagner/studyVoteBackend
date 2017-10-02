const express = require('express');
const jsonWebToken = require('jsonwebtoken');
const routerInstance = express.Router();
const DatabaseAdapter = require('../database/databaseAdapter');
const Constants = require('../Constants');
const databaseAdapter = new DatabaseAdapter(5);

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

        let jwtToken = jsonWebToken.sign({userId: user.id}, Constants.SIGNING_SECRET, jwtOptions)

        res.status(200).json({
            token: jwtToken
        })

    }).catch((error) => {
        res.status(500).json(error);
    })
});

module.exports = routerInstance;

