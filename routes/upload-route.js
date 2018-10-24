'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');


const uploadController = require('../controllers/upload-controller');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //todo: store the metadata
        cb(null, '/data/filesystem/images')
    },
    filename: (req, file, cb) => {
        //image validation
        var hash = crypto.createHash('sha256').update(new Date().toString()).digest('hex');
        return cb(null, hash + path.extname(file.originalname));
    },
    onError: function (error, next) {
        const err = new Error();
        err.success = false;
        err.code = error.code;
        err.message = error.message;
        return next(err);
    }
});
let upload = multer({storage: storage});


router.post('/upload', upload.single('filename'), uploadController.upload);

module.exports = {
    router: router
};