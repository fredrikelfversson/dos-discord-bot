// db.js

module.exports = {
    setup: function (sql, client) {
        const table_emoji = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'emojis';").get();
        const table_uid = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'uidtable';").get();
        
        if (!table_emoji['count(*)']) {
            // If no table, create a table
            sql.prepare("CREATE TABLE emojis (id TEXT PRIMARY KEY, amount INTEGER);").run();
            // ID unique and indexed
            sql.prepare("CREATE UNIQUE INDEX idx_emojis_id ON emojis (id);").run();
            sql.pragma("synchronous = 1");
            sql.pragma("journal_mode = wal");
        }
        if (!table_uid['count(*)']) {
            sql.prepare("CREATE TABLE uidtable (id TEXT PRIMARY KEY, uid TEXT);").run();
            sql.prepare("CREATE UNIQUE INDEX idx_uid_id ON uidtable (id);").run();
            sql.pragma("synchronous = 1");
            sql.pragma("journal_mode = wal");
        }
    }
}