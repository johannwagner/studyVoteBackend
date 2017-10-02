const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/userRoute');
const tokenRouter = require('./src/routes/tokenRoute');

const expressInstance = express();

// Parses for JSON and UrlEncoded Parameters
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({extended: false});

// Adding Parsers for Argument
expressInstance.use(jsonParser);
expressInstance.use(urlEncodedParser);

// Adding Routers to Servers
expressInstance.use('/token', tokenRouter);
expressInstance.use('/user', userRouter);

// TODO: Add Parameter for Port
expressInstance.listen(1337);