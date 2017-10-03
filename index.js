const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/userRoute');
const tokenRouter = require('./src/routes/tokenRoute');
const userProgressRouter = require('./src/routes/userProgressRoute');
const debugRouter = require('./src/routes/debugRoute');
const expressInstance = express();
const http = require('http');

// Parses for JSON and UrlEncoded Parameters
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({extended: false});

// Adding Parsers for Argument
expressInstance.use(jsonParser);
expressInstance.use(urlEncodedParser);

// Adding Routers to Servers
expressInstance.use('/token', tokenRouter);
expressInstance.use('/user', userRouter);
expressInstance.use('/userProgress', userProgressRouter);
expressInstance.use('/debug', debugRouter);

// TODO: Add Parameter for Port
const server = expressInstance.listen(1337);

expressInstance.closeServer = (cb) => {
    console.log('Close Server');
    server.close(cb);
};

module.exports = expressInstance;