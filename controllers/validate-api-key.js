'use strict';

const validateServiceValidateRequest = (input, cb) => {
    const token = input.token;
    const originalUrl = input.originalUrl;
    // console.log(input);


    if (originalUrl.indexOf('/file/') > -1) {
        return cb();
    }
    if (token) {
        if (token === APIKEY) {

            return cb(null, Math.random());
        } else {
            const err = new Error();
            err.success = false;
            err.status = 401;
            err.code = "UNAUTHORIZED";
            err.message = "API key not valid.";
            return cb(err);
        }

    } else {
        const err = new Error();
        err.success = false;
        err.status = 401;
        err.code = "UNAUTHORIZED";
        err.message = "API key not provided.";
        return cb(err);
    }
};

const validateRequest = function (req, res, next) {
    const input = {};
    input.token = req.body.apikey || req.query.apikey || req.headers['x-apikey'];
    input.originalUrl = req.originalUrl;

    validateServiceValidateRequest(input, (err, data) => {

        if (err) {
            next(err);
        } else {
            if (data) {
                req.decoded = data;
            }
            next();
        }
    });
};

module.exports = validateRequest;