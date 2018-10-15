'use strict';

const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_UPDATED,
} = require('../event-type');
const logger = require('../logger')('strategy-store.js');
const NotFoundError = require('../error/notfound-error');
const STRATEGY_COLUMNS = ['name', 'description', 'parameters', 'built_in'];
const COLLECTION = 'strategies';

class StrategyStore {
    constructor(db, eventStore) {
        this.db = db.collection(COLLECTION);
        eventStore.on(STRATEGY_CREATED, event =>
            this._createStrategy(event.data)
        );
        eventStore.on(STRATEGY_UPDATED, event =>
            this._updateStrategy(event.data)
        );
        eventStore.on(STRATEGY_DELETED, event => {
            db.collection(COLLECTION).deleteMany({ name: event.data.name });
        });
    }

    getStrategies() {
        return new Promise((resolve, reject) => {
            this.db.find(
                {},
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
                                resolve(array.map(this.rowToStrategy));
                            }
                        });
                    }
                }
            );
        });
    }

    getStrategy(name) {
        return new Promise((resolve, reject) => {
            this.db
                .findOne({
                    name,
                })
                .then(row => {
                    resolve(this.rowToStrategy(row));
                })
                .catch(reject);
        });
    }

    rowToStrategy(row) {
        if (!row) {
            throw new NotFoundError('No strategy found');
        }
        return {
            name: row.name,
            editable: row.built_in !== 1,
            description: row.description,
            parameters: row.parameters,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            parameters: data.parameters,
        };
    }

    _createStrategy(data) {
        this.db.insertOne(this.eventDataToRow(data));
    }

    _updateStrategy(data) {
        this.db.updateMany(
            {
                name: data.name,
            },
            {
                $set: this.eventDataToRow(data),
            }
        );
    }
}

module.exports = StrategyStore;
