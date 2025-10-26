// /sql/sql-wasm-bridge.js
// Local WASM 版 SQL.js ESM Loader

const wasmPath = '/sql/sql-wasm.wasm';

export async function loadSql() {
    // ESM 版 SQL.js を node_modules から動的 import
    const initSqlJs = (await import("../node_modules/sql.js/dist/sql-wasm.js")).default;

    // local `/sql/sql-wasm.wasm` を参照
    const SQL = await initSqlJs({
        locateFile: () => wasmPath
    });

    return SQL;
}
