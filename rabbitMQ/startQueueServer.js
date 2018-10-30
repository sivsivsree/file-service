"use strict";

const ampq = require('amqplib');
const fs = require('fs');

const connection = 'amqp://user:bitnami@rabbitmq:5672/';
const q = 'fileservice.queue.presistent';

let conn = null;

const connectQueueServer = async () => {
    try {
        conn = await ampq.connect(connection);
        let ch = await conn.createChannel();
        ch.assertQueue(q, {durable: true});
        ch.prefetch(1);
        console.log("Queue Server started...");
        ch.consume(q, (msg) => {
            if (msg !== null) {
                let data = JSON.parse(msg.content.toString());
                if (!data.chunks) {
                    processSingleFile(data, ch, msg);
                } else {
                    processStream(data, ch, msg);
                }
            }
        });
    } catch (err) {
        console.log("Rabbitmq connection Failed.. Reconnecting...");
        return setTimeout(connectQueueServer, 1000);
    }
};

const processSingleFile = (data, channel, msg) => {
    let dataBuffer = Buffer.from(data.file);
    let filename = data.filename;  //get it from queue json
    let bucket = data.bucket + "_";
    var outputFile = '/data/filesystem/images/' + bucket + filename;

    fs.open(outputFile, 'w', function (err, fd) {
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

const processStream = (data, channel, msg) => {
    let dataBuffer = Buffer.from(data.file, 'utf8');
    let filename = data.filename;  //get it from queue json
    let bucket = data.bucket + "_";
    let outputFile = '/data/filesystem/images/' + bucket + filename;

    fs.open(outputFile, 'a+', function (err, fd) {
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