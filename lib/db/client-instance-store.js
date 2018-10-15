/* eslint camelcase: "off" */
'use strict';

const logger = require('../logger')('client-instance-store.js');
const COLUMNS = [
    'app_name',
    'instance_id',
    'sdk_version',
    'client_ip',
    'last_seen',
    'created_at',
];
const COLLECTION = 'client_instances';

const ONE_DAY = 24 * 61 * 60 * 1000;

const mapRow = row => ({
    appName: row.app_name,
    instanceId: row.instance_id,
    sdkVersion: row.sdk_version,
    clientIp: row.client_ip,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
});

class ClientInstanceStore {
    constructor(db) {
        this.db = db.collection(COLLECTION);
        const clearer = () => this._removeInstancesOlderThanTwoDays();
        setTimeout(clearer, 10).unref();
        setInterval(clearer, ONE_DAY).unref();
    }

    _removeInstancesOlderThanTwoDays() {
        const now = new Date();
        now.setDate(now.getDate() - 2);
        this.db
            .deleteMany({
                created_at: {
                    $lt: now,
                },
            })
            .then(res => {
                logger.info(`Deleted instances`, res);
            })
            .catch(console.error);
    }

    updateRow(details) {
        return this.db.updateMany(
            {
                app_name: details.appName,
                instance_id: details.instanceId,
            },
            {
                $set: {
                    last_seen: new Date(),
                    client_ip: details.clientIp,
                    sdk_version: details.sdkVersion,
                },
            }
        );
    }

    insertNewRow(details) {
        return this.db.insertOne({
            app_name: details.appName,
            instance_id: details.instanceId,
            sdk_version: details.sdkVersion,
            client_ip: details.clientIp,
        });
    }

    insert(details) {
        return new Promise((resolve, reject) => {
            this.db
                .countDocuments({
                    app_name: details.appName,
                    instance_id: details.instanceId,
                })
                .then(result => {
                    if (result > 0) {
                        return this.updateRow(details)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        return this.insertNewRow(details)
                            .then(resolve)
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.db.find(
                {},
                {
                    sort: [['last_seen', 1]], // DESC
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(array);
                            }
                        });
                    }
                }
            );
        });
    }

    getByAppName(appName) {
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    app_name: appName,
                },
                {
                    sort: [['last_seen', 1]], // DESC
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(array);
                            }
                        });
                    }
                }
            );
        });
    }

    getApplications() {
        return new Promise((resolve, reject) => {
            this.db.distinct('app_name', {}, (err, result) => {
                console.log('RESULT getApplications', result);
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = ClientInstanceStore;
