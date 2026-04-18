"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const index_js_1 = require("./index.js");
exports.pool = new pg_1.Pool({
    connectionString: index_js_1.config.databaseUrl,
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const query = async (text, params) => {
    const start = Date.now();
    const res = await exports.pool.query(text, params);
    const duration = Date.now() - start;
    if (index_js_1.config.nodeEnv === 'development') {
        console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    }
    return res;
};
exports.query = query;
const getClient = async () => {
    const client = await exports.pool.connect();
    return client;
};
exports.getClient = getClient;
//# sourceMappingURL=database.js.map