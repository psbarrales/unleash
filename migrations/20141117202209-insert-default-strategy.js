'use strict';

exports.up = function(db, callback) {
    db.insert(
        'strategies',
        {
            name: 'default',
            description: 'Default on/off strategy.',
        },
        callback
    );
};

exports.down = function(db, callback) {
    callback();
};
