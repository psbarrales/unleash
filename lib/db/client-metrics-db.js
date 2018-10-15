'use strict';

const logger = require('../logger')('client-metrics-db.js');

const METRICS_COLUMNS = ['id', 'created_at', 'metrics'];
const COLLECTION = 'client_metrics';

const ONE_MINUTE = 60 * 1000;

const mapRow = row => ({
    id: row.id,
    createdAt: row.created_at,
    metrics: row.metrics,
});

class ClientMetricsDb {
    constructor(db) {
        this.db = db.collection(COLLECTION);
        // Clear old metrics regulary
        const clearer = () => this.removeMetricsOlderThanOneHour();
        setTimeout(clearer, 10).unref();
        setInterval(clearer, ONE_MINUTE).unref();
    }

    removeMetricsOlderThanOneHour() {
        const now = new Date();
        now.setHours(now.getHours() - 1);
        this.db
            .deleteMany({
                created_at: {
                    $lt: now,
                },
            })
            .then(res => {
                logger.info(`Deleted metrics`, res);
            })
            .catch(console.error);
    }

    // Insert new client metrics
    insert(metrics) {
        return this.db.insertOne(metrics);
    }

    // Used at startup to load all metrics last week into memory!
    getMetricsLastHour() {
        const now = new Date();
        now.setHours(now.getHours() - 1);
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    created_at: {
                        $gte: now,
                    },
                },
                {
                    limit: 2000,
                    sort: [['created_at', -1]],
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

    // Used to poll for new metrics
    getNewMetrics(lastKnownId) {
        const now = new Date();
        now.setHours(now.getHours() - 1);
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    _id: {
                        $gt: lastKnownId,
                    },
                },
                {
                    limit: 1000,
                    sort: [['created_at', -1]],
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
}

module.exports = ClientMetricsDb;
