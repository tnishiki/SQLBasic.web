const { createApp, ref, computed, onMounted, watch } = Vue;
const { createVuetify, useTheme } = Vuetify;

const navLinks = [
  { label: "カリキュラム", href: "#curriculum" },
  { label: "SQL ラボ", href: "#lab" },
  { label: "FAQ", href: "#faq" }
];

const skillPoints = [
  "基本構文の理解 (SELECT / WHERE / ORDER BY ...)",
  "データ抽出の最適化 (JOIN / GROUP BY / 集計)",
  "実務シナリオでの応用 (サブクエリ / ウィンドウ関数)"
];

const features = [
  {
    title: "ステップ学習",
    description: "学習フェーズは初級・中級・上級に分かれており、各フェーズで SQL の理解度を確認するチェックポイントを用意しています。"
  },
  {
    title: "クエリの試行",
    description: "仮想のサンプルデータベースに対してクエリを実行し、即座に結果を可視化。学習内容をそのまま手を動かして体験できます。"
  },
  {
    title: "学習ログ",
    description: "ユーザー単位で学習履歴とクエリ実行ログを保存し、復習や進捗管理をサポートします。"
  }
];

const lessons = [
  {
    phase: "初級",
    duration: "3h",
    title: "SQL の基礎構文",
    topics: ["SELECT と FROM", "WHERE 条件式", "ORDER BY による並び替え"],
    goal: "基礎的なデータ抽出を正確に記述できる"
  },
  {
    phase: "中級",
    duration: "5h",
    title: "データ加工と集計",
    topics: ["GROUP BY と HAVING", "JOIN の使い分け", "CASE 式による条件分岐"],
    goal: "業務レポートで必要な集計・結合が作成できる"
  },
  {
    phase: "上級",
    duration: "4h",
    title: "応用クエリと最適化",
    topics: ["サブクエリ", "ウィンドウ関数", "実行計画の読み解き"],
    goal: "分析業務で即戦力となる応用力を身に付ける"
  }
];

const queryTemplates = [
  {
    phase: "初級",
    label: "顧客一覧を抽出",
    sql: `SELECT id, name, city\nFROM customers\nWHERE city = 'Tokyo'\nORDER BY name;`,
    description: "WHERE 句と ORDER BY を利用して、条件に合うレコードを抽出します。",
    highlights: [
      "SELECT で取得する列を明示する",
      "WHERE 句でフィルター条件を指定する",
      "ORDER BY で並び替えを適用する"
    ]
  },
  {
    phase: "中級",
    label: "受注金額の月次集計",
    sql: `SELECT strftime('%Y-%m', ordered_at) AS month,\n       SUM(amount) AS total_amount\nFROM orders\nGROUP BY month\nHAVING SUM(amount) > 500000\nORDER BY month;`,
    description: "GROUP BY と HAVING を使って月単位の売上を集計し、閾値を超える月を抽出します。",
    highlights: [
      "strftime で日付を月単位に丸める",
      "SUM 関数で集計を行う",
      "HAVING で集計後の条件を設定する"
    ]
  },
  {
    phase: "上級",
    label: "売上上位顧客の抽出",
    sql: `WITH ranked_customers AS (\n    SELECT\n        c.id,\n        c.name,\n        SUM(o.amount) AS revenue,\n        RANK() OVER (ORDER BY revenue DESC) AS revenue_rank\n    FROM customers AS c\n    JOIN orders AS o ON o.customer_id = c.id\n    GROUP BY c.id, c.name\n)\nSELECT *\nFROM ranked_customers\nWHERE revenue_rank <= 5;`,
    description: "共通テーブル式とウィンドウ関数を活用して、売上上位 5 名の顧客を抽出します。",
    highlights: [
      "WITH 句でクエリを分割し読みやすくする",
      "RANK ウィンドウ関数で順位を計算する",
      "最終 SELECT で上位データだけを取得する"
    ]
  }
];

const faqItems = [
  {
    question: "実際にデータベースへ接続できますか？",
    answer: "学習用の仮想データベースを用意しており、本番環境のデータベースには接続しません。安心して学習に集中できます。"
  },
  {
    question: "学習時間の目安はどれくらいですか？",
    answer: "初級から上級までの全フェーズを通じて、およそ 12〜16 時間を想定しています。週末集中コースや平日夜間コースなどの学習プランも提供予定です。"
  },
  {
    question: "チームで学習することは可能ですか？",
    answer: "はい。チームでの学習進捗を可視化できるダッシュボード機能を提供予定です。管理者はメンバーごとの進捗状況と解答内容を確認できます。"
  }
];

const schemaSQL = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);

INSERT INTO customers (id, name, city) VALUES
  (1, '佐藤 智也', 'Tokyo'),
  (2, '鈴木 花子', 'Osaka'),
  (3, '田中 亮', 'Nagoya'),
  (4, '高橋 真帆', 'Tokyo'),
  (5, '伊藤 拓海', 'Sapporo'),
  (6, '渡辺 美咲', 'Fukuoka'),
  (7, '山本 陸', 'Kyoto'),
  (8, '中村 舞', 'Yokohama');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  ordered_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

INSERT INTO orders (id, customer_id, amount, ordered_at) VALUES
  (1, 1, 220000, '2024-01-15'),
  (2, 2, 185000, '2024-01-20'),
  (3, 5, 210000, '2024-01-28'),
  (4, 1, 320000, '2024-02-02'),
  (5, 3, 180000, '2024-02-11'),
  (6, 4, 240000, '2024-03-05'),
  (7, 2, 275000, '2024-03-18'),
  (8, 3, 325000, '2024-03-21'),
  (9, 6, 520000, '2024-04-03'),
  (10, 1, 260000, '2024-04-17'),
  (11, 7, 150000, '2024-04-22');
`;

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          background: "#f6f8fb",
          surface: "#ffffff",
          primary: "#2563eb",
          secondary: "#64748b"
        }
      },
      dark: {
        colors: {
          background: "#0f172a",
          surface: "#111827",
          primary: "#60a5fa",
          secondary: "#94a3b8"
        }
      }
    }
  }
});

createApp({
  setup() {
    const drawer = ref(false);
    const queryEditor = ref(null);
    const resultDescription = ref("テンプレートを選択して SQL を編集し、「クエリを実行」で結果を確認できます。");
    const resultHighlights = ref([]);
    const queryResult = ref(null);
    const selectedPhase = ref(null);

    const theme = useTheme();
    const isDark = computed(() => theme.global.name.value === "dark");
    const themeButtonLabel = computed(() => (isDark.value ? "ライトモード" : "ダークモード"));
    const themeIcon = computed(() => (isDark.value ? "mdi-weather-sunny" : "mdi-weather-night"));

    let monacoEditorInstance = null;
    let pendingEditorValue = "";
    let sqlModule = null;
    let databaseSeed = null;
    let databaseInitializationError = null;

    const databaseReady = (async () => {
      if (typeof window.initSqlJs !== "function") {
        throw new Error("SQL.js が読み込まれていません。");
      }
      const SQL = await window.initSqlJs({
        locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.9.0/${file}`
      });
      sqlModule = SQL;
      const db = new SQL.Database();
      db.exec(schemaSQL);
      databaseSeed = db.export();
      db.close();
    })();

    databaseReady.catch((error) => {
      databaseInitializationError = error;
      console.error("Failed to initialize SQL.js", error);
    });

    function setEditorValue(value) {
      if (monacoEditorInstance) {
        monacoEditorInstance.setValue(value);
      } else {
        pendingEditorValue = value;
      }
    }

    function getEditorValue() {
      if (monacoEditorInstance) {
        return monacoEditorInstance.getValue();
      }
      return pendingEditorValue;
    }

    function focusEditor() {
      monacoEditorInstance?.focus();
    }

    function createDatabaseFromSeed() {
      if (!sqlModule || !databaseSeed) {
        return null;
      }
      return new sqlModule.Database(databaseSeed.slice());
    }

    function clearQueryResult() {
      queryResult.value = null;
    }

    function updateEditorTheme() {
      if (!window.monaco || !monacoEditorInstance) {
        return;
      }
      window.monaco.editor.setTheme(isDark.value ? "vs-dark" : "vs");
    }

    function initializeMonacoEditor() {
      if (!queryEditor.value || !window.monaco) {
        return;
      }
      monacoEditorInstance = window.monaco.editor.create(queryEditor.value, {
        value: pendingEditorValue,
        language: "sql",
        automaticLayout: true,
        minimap: { enabled: false },
        theme: isDark.value ? "vs-dark" : "vs",
        fontSize: 14,
        fontFamily: "'Fira Code', 'Noto Sans JP', monospace",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: { top: 14, bottom: 14 }
      });
      pendingEditorValue = "";
    }

    function applyQueryTemplate(template) {
      selectedPhase.value = template.phase;
      setEditorValue(template.sql);
      focusEditor();
      resultDescription.value = template.description;
      resultHighlights.value = [...template.highlights];
      clearQueryResult();
    }

    async function runQuery() {
      const sql = getEditorValue().trim();
      if (!sql) {
        resultDescription.value = "クエリが入力されていません。テンプレートを選ぶか、SQL を記述してください。";
        resultHighlights.value = [];
        clearQueryResult();
        return;
      }

      try {
        await databaseReady;
      } catch (error) {
        const message = databaseInitializationError?.message || (error instanceof Error ? error.message : String(error));
        resultDescription.value = "データベースの初期化に失敗しました。ページを再読み込みしてください。";
        resultHighlights.value = [message];
        clearQueryResult();
        return;
      }

      const db = createDatabaseFromSeed();
      if (!db) {
        resultDescription.value = "データベースの初期化に失敗しました。";
        resultHighlights.value = [
          databaseInitializationError?.message || "初期化処理を再度お試しください。"
        ];
        clearQueryResult();
        return;
      }

      try {
        const resultSets = db.exec(sql);

        if (!resultSets.length) {
          resultDescription.value = "クエリは結果を返しませんでした。";
          resultHighlights.value = [];
          clearQueryResult();
          return;
        }

        const [resultSet] = resultSets;
        const rowCount = resultSet.values.length;
        const columnCount = resultSet.columns.length;
        resultDescription.value = `結果: ${rowCount} 行 / ${columnCount} 列`;
        resultHighlights.value = [
          `列: ${resultSet.columns.join(", ")}`,
          rowCount > 0 ? "先頭行の確認で構造を把握しましょう。" : "行は返されませんでした。"
        ];
        queryResult.value = {
          columns: resultSet.columns,
          values: resultSet.values
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        resultDescription.value = "クエリの実行中にエラーが発生しました。";
        resultHighlights.value = [message];
        clearQueryResult();
      } finally {
        db.close();
      }
    }

    function toggleTheme() {
      theme.global.name.value = isDark.value ? "light" : "dark";
    }

    watch(
      () => theme.global.name.value,
      (value) => {
        if (value === "dark") {
          document.body.setAttribute("data-theme", "dark");
        } else {
          document.body.removeAttribute("data-theme");
        }
        updateEditorTheme();
      },
      { immediate: true }
    );

    onMounted(() => {
      if (window.monacoLoader?.then) {
        window.monacoLoader
          .then(() => {
            initializeMonacoEditor();
          })
          .catch((error) => {
            console.error("Monaco editor failed to load", error);
          });
      }
    });

    return {
      drawer,
      navLinks,
      skillPoints,
      features,
      lessons,
      queryTemplates,
      faqItems,
      queryEditor,
      resultDescription,
      resultHighlights,
      queryResult,
      selectedPhase,
      applyQueryTemplate,
      runQuery,
      toggleTheme,
      themeButtonLabel,
      themeIcon,
      isDark
    };
  }
})
  .use(vuetify)
  .mount("#app");
