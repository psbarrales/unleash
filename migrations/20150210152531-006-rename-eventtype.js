'use strict';

exports.up = function(db, callback) {
    let tasks = 0;
    db._run(
        'updateMany',
        'events',
        {
            query: {
                type: 'feature-revived',
            },
            update: {
                type: 'feature-revive',
            },
        },
        cb
    );
    db._run(
        'updateMany',
        'events',
        {
            query: {
                type: 'feature-archived',
            },
            update: {
                type: 'feature-archive',
            },
        },
        cb
    );

    function cb() {
        tasks++;
        if (tasks >= 2) {
            callback();
        }
    }
};

exports.down = function(db, callback) {
    callback();
};
