'use strict';

const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const crypto = require('crypto');
const httpStatusCodes = require("http-status-codes");



const queueReg = require('./rabbitMQ/startQueueServer');
const mongoDB = require('./database/enableMongo');

const app = express();


// app monitor
require('appmetrics-dash').attach();
require('appmetrics-prometheus').attach();

// PORT definition
const PORT = process.env.PORT || 5050;


//global setups
global.APIKEY = crypto.createHash('md5').update(process.env.APIKEY).digest('hex');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Logging for development
app.use(morgan('dev'));

// KEY validations and escapes
app.all('/*', [require('./controllers/validate-api-key')]);

// model registration for mongo
require("./database/registerModels");

// route definitions
const routerReg = require('./routeReg');
routerReg(app);

// Error Handling
app.use(function (err, req, res, next) {
    //logger.log('error', err);
    res.status(err.status || httpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send(JSON.stringify(err));
});

// 404 custom errors
app.use(function (req, res) {
    let err = new Error(req.originalUrl + ' not Found');
    res.statusText = 'Please check the URL';
    res.status(httpStatusCodes.NOT_FOUND).end();
});

// PRINTING default api key for server
console.log("APIKEY:" + APIKEY);

// starting the Database and Queue
queueReg.startQueueServer().then(() => {
    mongoDB.connectMongo();
}).catch(console.log);

// Server Start
app.listen(PORT).on('error', console.log);