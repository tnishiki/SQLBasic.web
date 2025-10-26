// /sql/sql-wasm-bridge.js
// Local WASM 版 SQL.js ESM Loader

const wasmPath = '/sql/sql-wasm.wasm';

export async function loadSql() {
    // ESM 版 SQL.js CDN を動的 import
    const initSqlJs = (await import("https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.9.0/sql-wasm.min.js")).default;

    // local `/sql/sql-wasm.wasm` を参照
    const SQL = await initSqlJs({
        locateFile: () => wasmPath
    });

    return SQL;
}
