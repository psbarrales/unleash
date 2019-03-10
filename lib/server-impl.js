'use strict';

const { EventEmitter } = require('events');

const logger = require('./logger')('server-impl.js');
const migrator = require('../migrator');
const getApp = require('./app');

const { startMonitoring } = require('./metrics');
const { createStores } = require('./db');
const { createOptions } = require('./options');
const User = require('./user');
const AuthenticationRequired = require('./authentication-required');

function createApp(options) {
    return new Promise((resolve, reject) => {
        // Database dependecies (statefull)
        createStores(options)
            .then(stores => {
                const eventBus = new EventEmitter();

                const config = Object.assign(
                    {
                        stores,
                        eventBus,
                    },
                    options
                );

                const app = getApp(config);
                startMonitoring(
                    options.serverMetrics,
                    eventBus,
                    stores.eventStore
                );

                const server = app.listen(
                    {
                        port: options.port,
                        host: options.host,
                    },
                    () =>
                        logger.info(
                            `Unleash started on port ${server.address().port}`
                        )
                );
                server.on('listening', () =>
                    resolve({ app, server, eventBus }));
                server.on('error', reject);
            })
            .catch(reject);
    });
}

async function start(opts) {
    const options = createOptions(opts);

    try {
        await migrator({ databaseUrl: options.databaseUrl });
    } catch (err) {
        logger.error('Failed to migrate db', err);
        throw err;
    }

    return createApp(options);
}

module.exports = {
    start,
    User,
    AuthenticationRequired,
};
