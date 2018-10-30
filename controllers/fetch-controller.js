"use strict";
const httpStatusCodes = require("http-status-codes");
const fs = require('fs');

const fetch = (req, res) => {
    const imageId = req.params.imageId;
    const filePath = '/data/filesystem/images/' + imageId;
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        let err = new Error();
        err.code = "NO_IMAGE_ID";
        err.message = "No image with the current name.";
        res.status(httpStatusCodes.NOT_FOUND).json(err);
    }
};

const fetchByBucket = (req, res) => {
    const imageId = req.params.imageId;
    const bucket = req.params.bucket;
    const filePath = '/data/filesystem/images/' + bucket +"_"+ imageId;
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        let err = new Error();
        err.code = "NO_IMAGE_ID";
        err.message = "No image with the current name.";
        res.status(httpStatusCodes.NOT_FOUND).json(err);
    }
};


module.exports = {
    fetch: fetch,
    fetchByBucket:fetchByBucket
};