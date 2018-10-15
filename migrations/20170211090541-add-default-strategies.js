'use strict';

const strategies = require('./default-strategies.json');

function insertStrategySQL(strategy) {
    return {
        name: strategy.name,
        description: strategy.description,
        parameters: strategy.parameters,
        built_in: 1, // eslint-disable-line
    };
}

function insertEventsSQL(strategy) {
    return {
        type: 'strategy-created',
        created_by: 'migration', // eslint-disable-line
        data: strategy,
    };
}

exports.up = function(db, callback) {
    const tasks = strategies.length * 2;
    let tasksCompleted = 0;
    strategies.map(s => {
        db.insert('events', insertEventsSQL(s), cb);
        db.insert('strategies', insertStrategySQL(s), cb);
        return s;
    });

    function cb() {
        tasksCompleted++;
        if (tasksCompleted >= tasks) {
            callback();
        }
    }
};

exports.down = function(db, callback) {
    callback();
};
