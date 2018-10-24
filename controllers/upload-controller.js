"use strict";

const express = require('express');
const router = express.Router();


const uploadFile = (req, res) => {
    if (req.file) {
        res.json({success: true, file: req.file.filename});
    } else {
        console.log(req);
        res.json({success: false, message: 'No files attached.'});
    }

};

const status = (req, res) => {
    res.json({status: "running fine."});
};


module.exports = {
    upload: uploadFile,
    status: status
};