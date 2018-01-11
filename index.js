const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./src/routes/userRoute');
const tokenRouter = require('./src/routes/tokenRoute');
const userProgressRouter = require('./src/routes/userProgressRoute');
const courseInstanceRouter = require('./src/routes/courseInstanceRoute');
const userCourseInstanceRouter = require('./src/routes/userCourseInstanceRoute');
const semesterRouter = require('./src/routes/semesterRoute');
const admissionRequirementRouter = require('./src/routes/admissionRequirementRoute');

const debugRouter = require('./src/routes/debugRoute');
const expressInstance = express();
const http = require('http');

const cors = require('cors');


// Parses for JSON and UrlEncoded Parameters
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({extended: false});

// Adding CORS
expressInstance.use(cors())

// Adding Parsers for Argument
expressInstance.use(jsonParser);
expressInstance.use(urlEncodedParser);

// Adding Routers to Servers
expressInstance.use('/token', tokenRouter);
expressInstance.use('/user', userRouter);
expressInstance.use('/userProgress', userProgressRouter);
expressInstance.use('/courseInstance', courseInstanceRouter);
expressInstance.use('/userCourseInstance', userCourseInstanceRouter);
expressInstance.use('/semester', semesterRouter);
expressInstance.use('/admissionRequirement', admissionRequirementRouter);
expressInstance.use('/debug', debugRouter);

// TODO: Add Parameter for Port
const serverPort = process.env.SERVER_PORT || 1337;

const server = expressInstance.listen(serverPort);

expressInstance.closeServer = (cb) => {
    console.log('Close Server');
    server.close(cb);
};

module.exports = expressInstance;