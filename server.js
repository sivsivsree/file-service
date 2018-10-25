'use strict';
const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const httpStatusCodes = require("http-status-codes");
const app = express();
const routes = require('./controllers/upload-controller');
require('appmetrics-dash').attach();
require('appmetrics-prometheus').attach();

const PORT = process.env.PORT || 5050;


//global setups
global.APIKEY = crypto.createHash('md5').update(process.env.APIKEY).digest('hex');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//app.use(morgan('dev'));

app.all('/*', [require('./controllers/validate-api-key')]);

const routerReg = require('./routeReg');
routerReg(app);

const queueReg = require('./rabbitMQ/startQueueServer')
const mongoDB = require('./database/enableMongo');


app.use(function (err, req, res, next) {
    //logger.log('error', err);
    res.status(err.status || httpStatusCodes.INTERNAL_SERVER_ERROR);
    res.send(JSON.stringify(err));
});

// 404 customization
app.use(function (req, res) {
    let err = new Error(req.originalUrl + ' not Found');
    res.statusText = 'Please check the URL';
    res.status(httpStatusCodes.NOT_FOUND).end();
});

console.log("APIKEY:" + APIKEY);

queueReg.startQueueServer().then(()=>{
    mongoDB.connectMongo();
}).catch(console.log);

app.listen(PORT).on('error', console.log);