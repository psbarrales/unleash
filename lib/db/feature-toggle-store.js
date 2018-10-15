'use strict';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('../event-type');
const logger = require('../logger')('client-toggle-store.js');
const NotFoundError = require('../error/notfound-error');
const FEATURE_COLUMNS = [
    'name',
    'description',
    'enabled',
    'strategies',
    'created_at',
];
const TABLE = 'features';

class FeatureToggleStore {
    constructor(db, eventStore) {
        this.db = db.collection(TABLE);
        eventStore.on(FEATURE_CREATED, event =>
            this._createFeature(event.data)
        );
        eventStore.on(FEATURE_UPDATED, event =>
            this._updateFeature(event.data)
        );
        eventStore.on(FEATURE_ARCHIVED, event =>
            this._archiveFeature(event.data)
        );
        eventStore.on(FEATURE_REVIVED, event =>
            this._reviveFeature(event.data)
        );
    }

    getFeatures() {
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    archived: 0,
                },
                {
                    sort: [['name', -1]], // ASC
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(array.map(this.rowToFeature));
                            }
                        });
                    }
                }
            );
        });
    }

    getFeature(name) {
        return new Promise((resolve, reject) => {
            this.db
                .findOne({ name, archived: 0 })
                .then(row => {
                    resolve(this.rowToFeature(row));
                })
                .catch(reject);
        });
    }

    hasFeature(name) {
        return new Promise((resolve, reject) => {
            this.db
                .findOne({ name })
                .then(row => {
                    if (row) {
                        resolve({
                            name: row.name,
                            archived: row.archived === 1,
                        });
                    } else {
                        const error = new NotFoundError(
                            'No feature toggle found'
                        );
                        reject(error);
                        throw error;
                    }
                })
                .catch(reject);
        });
    }

    getArchivedFeatures() {
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    archived: 1,
                },
                {
                    sort: [['name', -1]], // ASC
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(array.map(this.rowToFeature));
                            }
                        });
                    }
                }
            );
        });
    }

    rowToFeature(row) {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        return {
            name: row.name,
            description: row.description,
            enabled: row.enabled > 0,
            strategies: row.strategies,
            createdAt: row.created_at,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            enabled: data.enabled ? 1 : 0,
            archived: data.archived ? 1 : 0,
            strategies: data.strategies,
            created_at: data.createdAt, // eslint-disable-line
        };
    }

    _createFeature(data) {
        return this.db.insertOne(this.eventDataToRow(data));
    }

    _updateFeature(data) {
        return this.db.updateMany(
            { name: data.name },
            {
                $set: this.eventDataToRow(data),
            }
        );
    }

    _archiveFeature({ name }) {
        return this.db.updateMany(
            {
                name,
            },
            {
                $set: {
                    archived: 1,
                    enabled: 0,
                },
            }
        );
    }

    _reviveFeature({ name }) {
        return this.db.updateMany(
            {
                name,
            },
            {
                $set: {
                    archived: 0,
                    enabled: 0,
                },
            }
        );
    }
}

module.exports = FeatureToggleStore;
