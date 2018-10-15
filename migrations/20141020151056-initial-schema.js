'use strict';

exports.up = function(db, callback) {
    let collectionsReady = 0;

    db.createCollection('strategies', cb);
    db.createCollection('features', cb);
    db.createCollection('events', cb);

    function cb(arg) {
        collectionsReady++;
        if (collectionsReady >= 3) {
            callback(arg);
        }
    }
};

exports.down = function(db, callback) {
    let collectionsReady = 0;
    db.dropTable('events', cb);
    db.dropTable('features', cb);
    db.dropTable('strategies', cb);

    function cb(arg) {
        collectionsReady++;
        if (collectionsReady >= 3) {
            callback(arg);
        }
    }
};
