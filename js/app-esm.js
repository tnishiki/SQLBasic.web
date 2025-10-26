// /js/app-esm.js
// ESM: Vue (global) + Vuetify (global) + Monaco(ESM) + SQL.js(ESM, local wasm)

import * as monaco from "../node_modules/monaco-editor/esm/vs/editor/editor.api.js";
import { loadSql } from "/js/sql-wasm-bridge.js";

// --- Vuetify (global build) ---
const { createApp } = window.Vue;
const { createVuetify } = window.Vuetify;

const vuetify = createVuetify();

const app = createApp({
  data() {
    return {
      // UI: ヘッダー/ナビ等（最小ダミーを定義しておく）
      drawer: false,
      navLinks: [
        { label: "トップ", href: "#hero" },
        { label: "機能", href: "#curriculum" },
        { label: "SQL Lab", href: "#lab" },
        { label: "FAQ", href: "#faq" }
      ],
      themeIcon: "mdi-weather-sunny",
      themeButtonLabel: "Light",
      isDark: false,

      // コンテンツ（最小ダミー）
      skillPoints: ["構文理解", "実践クエリ", "パフォーマンスの基礎"],
      features: [
        { title: "段階学習", description: "フェーズごとにSQLを段階的に学べます。" },
        { title: "即時実行", description: "Monacoエディタからワンクリック実行。" },
        { title: "ブラウザ完結", description: "WASMベースでサーバ処理不要。" }
      ],
      lessons: [
        { phase: "Phase 1", duration: "約30分", title: "基本構文", goal: "SELECT/WHERE/GROUP BY", topics: ["SELECT", "WHERE", "GROUP BY"] },
        { phase: "Phase 2", duration: "約40分", title: "結合", goal: "JOINの理解", topics: ["INNER JOIN", "LEFT JOIN"] },
        { phase: "Phase 3", duration: "約30分", title: "集計", goal: "集計と副問い合わせ", topics: ["HAVING", "サブクエリ"] }
      ],

      // SQL Lab
      queryTemplates: [],            // 既存UIのボタンを活かしたい場合に後で埋め込み
      selectedPhase: null,
      resultHighlights: [],
      queryResult: null,            // { columns: [...], values: [[...], ...] }
      resultDescription: "",        // 成功/エラー文言はこちらへ

      // 内部状態
      monacoEditor: null,
      SQL: null,
      db: null,
    };
  },

  methods: {
    toggleTheme() {
      // 今回は常に Light 指定なので UI だけ切り替え（実テーマはMonaco側で固定 vs）
      this.isDark = false;
      this.themeIcon = "mdi-weather-sunny";
      this.themeButtonLabel = "Light";
      if (this.monacoEditor) monaco.editor.setTheme("vs"); // Light
    },

    async runQuery() {
      const sqlText = this.monacoEditor ? this.monacoEditor.getValue() : "";
      if (!sqlText || !sqlText.trim()) {
        this.resultDescription = "クエリが空です。実行するSQLを入力してください。";
        this.queryResult = null;
        return;
      }
      if (!this.SQL || !this.db) {
        this.resultDescription = "SQL.js が読み込まれていません。ページを再読込してください。";
        this.queryResult = null;
        return;
      }

      try {
        // 実行（複数結果のうち 1つ目を採用）
        const results = this.db.exec(sqlText); // [{columns:[], values:[[]]}] or []
        if (!results || results.length === 0) {
          // 例えば CREATE/INSERT/UPDATE など結果セット無し
          this.resultDescription = "実行しました（結果セットはありません）";
          this.queryResult = null;
          return;
        }
        const first = results[0];
        this.queryResult = {
          columns: first.columns,
          values: first.values
        };
        this.resultDescription = `実行成功：${first.values.length} 行`;
      } catch (err) {
        console.error("SQL Exec Error", err);
        this.queryResult = null;
        // 仕様：エラーは Vue 側メッセージ表示（Monacoに下線等は出さない）
        this.resultDescription = `エラー：${String(err && err.message ? err.message : err)}`;
      }
    },

    // （任意）テンプレート適用のフックだけ残しておく
    applyQueryTemplate(tpl) {
      if (!this.monacoEditor || !tpl) return;
      this.selectedPhase = tpl.phase;
      this.monacoEditor.setValue(tpl.sql ?? "");
      this.resultDescription = `${tpl.phase}: ${tpl.label} をエディタに挿入しました`;
      this.queryResult = null;
    },
  },

  async mounted() {
    // ----- 1) SQL.js (ESM, Local WASM) 初期化 -----
    try {
      this.SQL = await loadSql();           // /sql/sql-wasm-bridge.js
      this.db = new this.SQL.Database();    // 空DB（ユーザがCREATEして使う想定）
      // 必要なら初期スキーマ/サンプル投入はここで
      // this.db.run("CREATE TABLE t(x); INSERT INTO t VALUES (1),(2);");
    } catch (e) {
      console.error("Failed to initialize SQL.js", e);
      this.resultDescription = "SQL.js の初期化に失敗しました。";
    }

    // ----- 2) Monaco Editor (ESM) 初期化 -----
    try {
      const container = this.$refs.queryEditor;
      if (!container) {
        console.warn("queryEditor container not found");
        return;
      }

      this.monacoEditor = monaco.editor.create(container, {
        value: "",                 // 初期表示は空（仕様どおり）
        language: "sql",
        automaticLayout: true,
        theme: "vs",               // Light
        minimap: { enabled: false },
        fontFamily: "'Fira Code','Consolas','Monaco','monospace'",
        fontSize: 14,
        tabSize: 2,
        insertSpaces: true
      });

      // Vuetifyレイアウト変化に追従（drawerなどで幅が変わる場合）
      const ro = new ResizeObserver(() => {
        this.monacoEditor.layout();
      });
      ro.observe(container);

    } catch (e) {
      console.error("Monaco editor failed to load", e);
      this.resultDescription = "エディタの初期化に失敗しました。";
    }
  }
});

app.use(vuetify);
app.mount("#app");
