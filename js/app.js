const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const body = document.body;

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

const queries = {
  初級: {
    label: "顧客一覧を抽出",
    sql: `SELECT id, name, city\nFROM customers\nWHERE city = 'Tokyo'\nORDER BY name;`,
    description:
      "WHERE 句と ORDER BY を利用して、条件に合うレコードを抽出します。",
    highlights: [
      "SELECT で取得する列を明示する",
      "WHERE 句でフィルター条件を指定する",
      "ORDER BY で並び替えを適用する"
    ]
  },
  中級: {
    label: "受注金額の月次集計",
    sql: `SELECT DATE_TRUNC('month', ordered_at) AS month,\n       SUM(amount) AS total_amount\nFROM orders\nGROUP BY month\nHAVING SUM(amount) > 500000\nORDER BY month;`,
    description:
      "GROUP BY と HAVING を使って月単位の売上を集計し、閾値を超える月を抽出します。",
    highlights: [
      "DATE_TRUNC で日付を月単位に丸める",
      "SUM 関数で集計を行う",
      "HAVING で集計後の条件を設定する"
    ]
  },
  上級: {
    label: "売上上位顧客の抽出",
    sql: `WITH ranked_customers AS (\n    SELECT\n        c.id,\n        c.name,\n        SUM(o.amount) AS revenue,\n        RANK() OVER (ORDER BY SUM(o.amount) DESC) AS revenue_rank\n    FROM customers AS c\n    JOIN orders AS o ON o.customer_id = c.id\n    GROUP BY c.id, c.name\n)\nSELECT *\nFROM ranked_customers\nWHERE revenue_rank <= 5;`,
    description:
      "共通テーブル式とウィンドウ関数を活用して、売上上位 5 名の顧客を抽出します。",
    highlights: [
      "WITH 句でクエリを分割し読みやすくする",
      "RANK ウィンドウ関数で順位を計算する",
      "最終 SELECT で上位データだけを取得する"
    ]
  }
};

const timelineContainer = document.getElementById("timeline");
const queryButtonsContainer = document.getElementById("queryButtons");
const queryEditorContainer = document.getElementById("queryEditor");
const resultDescription = document.getElementById("resultDescription");
const resultHighlights = document.getElementById("resultHighlights");
const runQueryButton = document.getElementById("runQuery");
const navLinks = document.getElementById("primaryNavigation");

let monacoEditorInstance = null;
let pendingEditorValue = "";

function renderTimeline() {
  const fragment = document.createDocumentFragment();
  lessons.forEach((lesson) => {
    const wrapper = document.createElement("article");
    wrapper.className = "timeline-item";
    wrapper.innerHTML = `
      <header>
        <h3>${lesson.title}</h3>
        <span class="badge">${lesson.phase}・${lesson.duration}</span>
      </header>
      <p>${lesson.goal}</p>
      <ul>${lesson.topics.map((topic) => `<li>${topic}</li>`).join("")}</ul>
    `;
    fragment.appendChild(wrapper);
  });
  timelineContainer.appendChild(fragment);
}

function renderQueryButtons() {
  const fragment = document.createDocumentFragment();
  Object.entries(queries).forEach(([phase, detail]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.phase = phase;
    button.textContent = `${phase}: ${detail.label}`;
    button.addEventListener("click", () => applyQueryTemplate(phase));
    fragment.appendChild(button);
  });
  queryButtonsContainer.appendChild(fragment);
}

function applyQueryTemplate(phase) {
  const template = queries[phase];
  setEditorValue(template.sql);
  focusEditor();
  resultDescription.textContent = template.description;
  renderHighlights(template.highlights);
  runQueryButton.focus();
}

function renderHighlights(highlights) {
  resultHighlights.innerHTML = "";
  highlights.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    resultHighlights.appendChild(li);
  });
}

function simulateQueryRun() {
  const sql = getEditorValue().trim();
  if (!sql) {
    resultDescription.textContent = "クエリが入力されていません。テンプレートを選ぶか、SQL を記述してください。";
    resultHighlights.innerHTML = "";
    return;
  }

  const sampleResult = {
    columns: ["id", "name", "metric"],
    rows: 5
  };

  const description = [
    "入力されたクエリを解析し、想定される出力形式を推定しました。",
    `予想されるカラム: ${sampleResult.columns.join(", ")}`,
    `想定される行数: およそ ${sampleResult.rows} 行`
  ];

  resultDescription.innerHTML = description.map((line) => `<p>${line}</p>`).join("");
  renderHighlights([
    "結果の正確性は実際のデータベースで検証してください。",
    "クエリの読みやすさを保つためにインデントを活用しましょう。"
  ]);
}

function toggleTheme() {
  const currentTheme = body.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  if (nextTheme === "light") {
    body.removeAttribute("data-theme");
  } else {
    body.setAttribute("data-theme", "dark");
  }
  if (themeToggle) {
    const isDark = nextTheme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.textContent = isDark ? "ライトモード" : "ダークモード";
  }
  updateEditorTheme();
}

themeToggle?.addEventListener("click", toggleTheme);
runQueryButton?.addEventListener("click", simulateQueryRun);

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  navLinks?.classList.toggle("is-open", !expanded);
});

renderTimeline();
renderQueryButtons();

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

function updateEditorTheme() {
  if (!window.monaco || !monacoEditorInstance) {
    return;
  }
  const isDark = body.getAttribute("data-theme") === "dark";
  monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
}

function initializeMonacoEditor() {
  if (!queryEditorContainer || !window.monaco) {
    return;
  }
  monacoEditorInstance = monaco.editor.create(queryEditorContainer, {
    value: pendingEditorValue,
    language: "sql",
    automaticLayout: true,
    minimap: { enabled: false },
    theme: body.getAttribute("data-theme") === "dark" ? "vs-dark" : "vs",
    fontSize: 14,
    fontFamily: "'Fira Code', 'Noto Sans JP', monospace",
    scrollBeyondLastLine: false,
    wordWrap: "on",
    padding: { top: 14, bottom: 14 }
  });
  pendingEditorValue = "";

  const observer = new MutationObserver(() => {
    updateEditorTheme();
  });
  observer.observe(body, { attributes: true, attributeFilter: ["data-theme"] });
}

if (window.monacoLoader?.then) {
  window.monacoLoader
    .then(() => {
      initializeMonacoEditor();
    })
    .catch((error) => {
      console.error("Monaco editor failed to load", error);
    });
}
