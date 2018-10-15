/* eslint camelcase: "off" */
'use strict';

exports.up = function(db, cb) {
    db.createCollection('client_applications', cb);
};

exports.down = function(db, cb) {
    // return db.dropTable('client_applications', cb);
    cb();
};
