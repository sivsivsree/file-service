"use strict";

let ampq = require('amqplib');
let connection = 'amqp://user:bitnami@rabbitmq:5672/';
let fs = require('fs');

let q = 'image_queue_stress';


const connectQueueServer = async () => {
    try {
        let conn = await ampq.connect(connection);
        let ch = await conn.createChannel();
        ch.assertQueue(q, {durable: true});
        ch.prefetch(1)
        console.log("Queue Server started...");
        ch.consume(q, (msg) => {
            if (msg !== null) {

                processData(JSON.parse(msg.content.toString()), ch, msg);

            }
        });
    } catch (err) {
        console.log("Rabbitmq connection Failed.. Reconnecting...");
        return setTimeout(connectQueueServer, 1000);
    }
};

const processData = (data, channel, msg) => {
    let dataBuffer = new Buffer.from(data.file);
    let filename = data.filename;  //get it from queue json
    let bucket = data.bucket + "_";
    var wstream = '/data/filesystem/images/' + bucket + filename;


    fs.open(wstream, 'w', function (err, fd) {
        if (err) {
            throw 'could not open file: ' + err;
        }
        fs.write(fd, dataBuffer, 0, dataBuffer.length, null, function (err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function () {
                channel.ack(msg);
            });
        });
    });


};

module.exports = {
    startQueueServer: connectQueueServer
};