const mongoose = require('mongoose')
const Promise = require('bluebird');


const loggerName = '[mongodbConnection]:';

const mongoConnection = 'mongodb://mongo:27017/file-service'


exports.connectMongo = function (cb = null) {
    mongoose.Promise = Promise;
    mongoose.connection.openUri(mongoConnection);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', function () {
        console.log(loggerName, 'Connection with MongoDB installed');
        if (cb != null) {
            cb();
        }
    });
};