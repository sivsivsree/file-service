'use strict';

const uploadRouter = require('./routes/upload-route');
const fetchRouter = require('./routes/fetch-route');

const routerRegistration = (app) => {

    app.use(uploadRouter.router);

    app.use(fetchRouter.router);
};

module.exports = routerRegistration;