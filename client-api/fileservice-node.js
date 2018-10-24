"use strict";

const amqp = require('amqplib');
const fs = require('fs');
const util = require('util');
const crypto = require('crypto');
const path = require('path');

const QUEUE_CONNECTION = 'amqp://user:bitnami@localhost:5672/';
const QUEUE = 'image_queue_stress';

const Promise = require("bluebird");

class FileService {

    constructor(API_KEY) {
        this.API_KEY = API_KEY;
        this.readFile = util.promisify(fs.readFile);
    }

    async _prepareFile(validFile) {
        try {
            let buffer = await this._getFileBuffer(validFile);
            let msg = {
                'bucket': this.bucket || "",
                'filename': crypto.createHash('sha256').update(new Date().toString() + Math.random()).digest('hex') + path.extname(validFile),
                'apikey': this.API_KEY,
                'file': buffer
            };
            return msg;
        } catch (e) {
            console.log("err on prepare");
            throw {error: "File prepration failed.", success: false};
        }
    }

    async _validateFile(file) {
        return new Promise((resolve, reject) => {
            fs.access(file, fs.F_OK, (err) => {
                if (err) {
                    return reject({error: "No File with the name " + file, success: false});
                }
                return resolve(file);
            });
        })
    }

    async _getFileBuffer(file) {
        return await this.readFile(file);
    }

    async _sendToQueue(msg) {
        let open = null;
        try {
            this.open = await amqp.connect(QUEUE_CONNECTION);
            let channel = await this.open.createChannel();
            await channel.assertQueue(QUEUE, {durable: true});
            await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), {persistent: true});
            return msg.filename;
        } catch (e) {
            throw {error: "File upload failed.", success: false, err:e};
        }
    }

    setBucket(bucket) {
        this.bucket = bucket;
        return this;
    }

    async uploadFile(file) {
        try {
            let validFile = await this._validateFile(file);
            let payload = await this._prepareFile(validFile);
            let fileId = await this._sendToQueue(payload);
            this.close();
            return fileId;
        } catch (e) {
            console.log(e);
        }
    }

    close() {
        if (this.open) {
            this.open.close();
        }
    }
}


let service = new FileService('9adbe0b3033881f88ebd825bcf763b43').setBucket("myBucket");

setTimeout(()=>{
    service.uploadFile('hashe.kl').then((data) => {
        console.log(data);
    });
}, 100);


