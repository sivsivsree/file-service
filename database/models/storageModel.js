'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storageSchema = new Schema({
    filename: String,
    timeStamp: {type: Date, default: Date.now},
    url: String,
    bucket: {type: String, default: "file"}
});
const model = mongoose.model('storage', storageSchema);
module.exports = model;