'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const fetchController = require('../controllers/fetch-controller');

router.route('/file/:imageId').get(fetchController.fetch);
router.route('/file/:bucket/:imageId').get(fetchController.fetchByBucket);

module.exports = {
    router: router
};