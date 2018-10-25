"use strict";

const amqp = require('amqplib');
const crypto = require('crypto');
const path = require('path');
const fsx = require('fs-extra');
const splitFile = require('./file-splitter');

const QUEUE_CONNECTION = 'amqp://user:bitnami@localhost:5672/';
const QUEUE = 'image_queue_stress';

const Promise = require("bluebird");
const CHUNK_BUFFER = 2e+6;


class FileService {

    constructor(API_KEY) {
        this.API_KEY = API_KEY;
    }

    async _prepareFile(file) {
        if (file.chunks.length == 1) {
            try {
                let buffer = await this._getFileBuffer(this._getFile(file));
                let msg = {
                    'bucket': this.bucket || "",
                    'chunks': false,
                    'filename': crypto.createHash('sha256').update(new Date().toString() + Math.random()).digest('hex') + path.extname(file.filename),
                    'apikey': this.API_KEY,
                    'file': buffer
                };
                await this._deleteDirIfExist(this._getFileDir(file.filename));
                return msg;
            } catch (e) {
                console.log(e);
                throw { error: "File prepration failed.", success: false };
            }
        } else if (file.chunks.length > 1) {
            const chunks = file.chunks;
            for (let i = 0; i < chunks.length; i++) {

                let buffer = await this._getFileBuffer(this._getFile(file), i);
                let msg = {
                    'bucket': this.bucket || "",
                    'chunks': true,
                    'total': file.chunks.length,
                    'filename': crypto.createHash('sha256').update(new Date().toString() + Math.random()).digest('hex') + path.extname(file.filename),
                    'apikey': this.API_KEY,
                    'file': buffer
                };

                await this._sendStream(msg);

                return msg;
            }
        }
    }

    async _deleteDirIfExist(directory) {
        return await fsx.remove(directory);
    }

    async _getFileBuffer(file) {
        return await fsx.readFile(file);
    }

    _getFile(fileObject, fileIndex = 0) {
        console.log(fileObject);
        return __dirname + "/" + this._getFileDir(fileObject.filename) + fileObject.chunks[fileIndex];
    }

    _getFileDir(file) {
        return "." + crypto.createHash('md5').update(file).digest('hex') + "/";
    }

    async _validateFile(file) {
        try {
            let deleted = await this._deleteDirIfExist(this._getFileDir(file))
            let names = await splitFile.splitFileBySize(file, CHUNK_BUFFER);
            let move = 0;
            for (let i = 0; i < names.length; i++) {
                await fsx.move(names[i], this._getFileDir(file) + names[i]);
                move++;
                console.log("moved to " + __dirname + " -- " + this._getFileDir(file));
            }
            console.log(names.length, move, move === names.length);
            return ({ filename: file, chunks: names });
        } catch (e) {
            return ({ error: e, success: false });
        }

    }

    async _openChannel() {
        try {
            this.open = await amqp.connect(QUEUE_CONNECTION);
            this.channel = await this.open.createChannel();

        } catch (e) {
            throw { error: "File upload failed.", success: false, err: e };
        }
    }

    async _sendStream(msg){
        console.log(msg);
        if(this.channel){
            await this.channel.assertQueue(QUEUE, { durable: true });
            await this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
        }
        return -1;
    }

    setBucket(bucket) {
        this.bucket = (bucket.split(" ").join("_")).split("/").join("_");
        return this;
    }

    async uploadFile(file) {
        let fileId;
        try {
            this._openChannel();
            let fileChunks = await this._validateFile(file);
            let payload = await this._prepareFile(fileChunks);
            if (payload && payload.chunks !== true) {
                this._sendStream(payload); // direct upload single file
                fileId = payload.filename;
            }

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


let service = new FileService('9adbe0b3033881f88ebd825bcf763b43').setBucket("fastlane/upload/test");


// setInterval(()=>{


service.uploadFile('fastlane.zip').then((data) => {
    console.log('key', data);
});
// }, 10);



