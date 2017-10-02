const express = require('express');
const userRouter = require('./src/routes/userRoute');
const tokenRouter = require('./src/routes/tokenRoute');
const bodyParser = require('body-parser');

const expressInstance = express();


const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({extended: false});

expressInstance.use(jsonParser);
expressInstance.use(urlEncodedParser);

expressInstance.use('/token', tokenRouter);
expressInstance.use('/user', userRouter);

expressInstance.listen(1337);