const express = require('express');
const routerInstance = express.Router();
const Constants = require('../Constants');
const jsonWebToken = require('jsonwebtoken');
const authenticationMiddleware = require('../middleware/authenticationMiddleware').authenticationMiddleware;


routerInstance.get('/', authenticationMiddleware,  (req, res, next) => {
    res.send({message: 'Hallo Fred.', tokenContext: req.tokenContext})
});

routerInstance.post('/', (req, res, next) => {

});

routerInstance.put('/', (req, res, next) => {

});

routerInstance.delete('/', (req, res, next) => {

});

module.exports = routerInstance;
