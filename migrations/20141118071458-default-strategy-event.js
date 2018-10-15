'use strict';

exports.up = function(db, callback) {
    db.insert(
        'events',
        {
            type: 'strategy-created',
            created_by: 'migration', // eslint-disable-line
            data:
                '{"name":"default","description":"Default on or off Strategy."}',
        },
        callback
    );
};

exports.down = function(db, callback) {
    callback();
};
