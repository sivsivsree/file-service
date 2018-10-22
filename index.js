const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const multer = require('multer');

const app = express();

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
});
let upload = multer({storage: storage});





router.post('/upload', upload.single('image'), (req, res, next) => {
    res.json({success:true,message: 'File uploaded successfully'});
});

app.router(router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.listen(5050);