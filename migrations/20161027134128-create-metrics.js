'use strict';

exports.up = function(db, callback) {
    db.createCollection('client_metrics', callback);
};

exports.down = function(db, callback) {
    callback();
};
