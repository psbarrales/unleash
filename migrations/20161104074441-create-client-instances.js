'use strict';

exports.up = function(db, callback) {
    db.createCollection('client_instances', callback);
};

exports.down = function(db, callback) {
    callback();
};
