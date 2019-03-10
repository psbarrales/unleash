/* eslint camelcase:off */
'use strict';

const COLUMNS = [
    'app_name',
    'created_at',
    'updated_at',
    'description',
    'strategies',
    'url',
    'color',
    'icon',
];
const COLLECTION = 'client_applications';

const mapRow = row => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    strategies: row.strategies,
    url: row.url,
    color: row.color,
    icon: row.icon,
});

const remapRow = (input, old = {}) => ({
    app_name: input.appName,
    updated_at: input.updatedAt || new Date(),
    description: input.description || old.description,
    url: input.url || old.url,
    color: input.color || old.color,
    icon: input.icon || old.icon,
    strategies: input.strategies || old.strategies,
});

class ClientApplicationsDb {
    constructor(db) {
        this.db = db.collection(COLLECTION);
    }

    updateRow(details, prev) {
        details.updatedAt = new Date();
        return this.db.updateMany(
            {
                app_name: details.appName,
            },
            {
                $set: remapRow(details, prev),
            }
        );
    }

    insertNewRow(details) {
        return this.db.insertOne(remapRow(details));
    }

    upsert(data) {
        if (!data) {
            throw new Error('Missing data to add / update');
        }
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    'app_name': data.appName,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else if (array && array.length > 0) {
                                this.updateRow(data, array[0])
                                    .then(resolve)
                                    .catch(reject);
                            } else {
                                this.insertNewRow(data)
                                    .then(resolve)
                                    .catch(reject);
                            }
                        });
                    }
                }
            );
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    result.toArray((err, array) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(array.map(mapRow));
                        }
                    });
                }
            });
        });
    }

    getApplication(appName) {
        return new Promise((resolve, reject) => {
            this.db.findOne(
                {
                    'app_name': appName,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(mapRow(result))
                    }
                }
            );
        });
    }

    /**
     * Could also be done in SQL:
     * (not sure if it is faster though)
     *
     * SELECT app_name from (
     *   SELECT app_name, json_array_elements(strategies)::text as strategyName from client_strategies
     *   ) as foo
     * WHERE foo.strategyName = '"other"';
     */
    getAppsForStrategy(strategyName) {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    result.toArray((err, array) => {
                        if (err) {
                            reject(err);
                        } else {
                            const apps = array.map(mapRow);
                            resolve(
                                apps.filter(app =>
                                    app.strategies.find({ name: strategyName })
                                )
                            );
                        }
                    });
                }
            });
        });
    }

    getApplications(filter) {
        return filter && filter.strategyName
            ? this.getAppsForStrategy(filter.strategyName)
            : this.getAll();
    }
}

module.exports = ClientApplicationsDb;
