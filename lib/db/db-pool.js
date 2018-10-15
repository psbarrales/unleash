'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports.createDb = function({
    databaseUrl,
    poolMin = 2,
    poolMax = 20,
    databaseSchema = 'public',
}) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(
            databaseUrl,
            {
                useNewUrlParser: true,
                poolSize: poolMax,
            },
            (err, client) => {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve(client.db());
            }
        );
    });
};
