'use strict';

exports.up = function(db, callback) {
    /* MIGRATION NOT NEED THIS */
    // db.runSql('ALTER TABLE features ADD archived integer DEFAULT 0;', callback);
    callback();
};

exports.down = function(db, callback) {
    callback();
};
