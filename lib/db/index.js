'use strict';

const { createDb } = require('./db-pool');
const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const StrategyStore = require('./strategy-store');
const ClientInstanceStore = require('./client-instance-store');
const ClientMetricsDb = require('./client-metrics-db');
const ClientMetricsStore = require('./client-metrics-store');
const ClientApplicationsStore = require('./client-applications-store');

module.exports.createStores = config => {
    return new Promise((resolve, reject) => {
        createDb(config)
            .then(db => {
                const eventStore = new EventStore(db);
                const clientMetricsDb = new ClientMetricsDb(db);
                resolve({
                    db,
                    eventStore,
                    featureToggleStore: new FeatureToggleStore(db, eventStore),
                    strategyStore: new StrategyStore(db, eventStore),
                    clientApplicationsStore: new ClientApplicationsStore(db),
                    clientInstanceStore: new ClientInstanceStore(db),
                    clientMetricsStore: new ClientMetricsStore(clientMetricsDb),
                });
            })
            .catch(reject);
    });
};
