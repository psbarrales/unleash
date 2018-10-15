'use strict';

const { EventEmitter } = require('events');

const EVENT_COLUMNS = ['id', 'type', 'created_by', 'created_at', 'data'];

class EventStore extends EventEmitter {
    constructor(db) {
        super();
        this.db = db.collection('events');
    }

    store(event) {
        return this.db
            .insert({
                type: event.type,
                created_by: event.createdBy, // eslint-disable-line
                data: event.data,
            })
            .then(() => this.emit(event.type, event));
    }

    getEvents() {
        return new Promise((resolve, reject) => {
            this.db.find(
                {},
                {
                    sort: [['created_at', 1]], // DESC
                    limit: 100,
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(array.map(this.rowToEvent));
                            }
                        });
                    }
                }
            );
        });
    }

    getEventsFilterByName(name) {
        return new Promise((resolve, reject) => {
            this.db.find(
                {
                    'data.name': name,
                },
                {
                    limit: 100,
                    sort: [['created_at', 1]],
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.toArray((err, array) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(array.map(this.rowToEvent));
                            }
                        });
                    }
                }
            );
        });
    }

    rowToEvent(row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: row.data,
        };
    }
}

module.exports = EventStore;
