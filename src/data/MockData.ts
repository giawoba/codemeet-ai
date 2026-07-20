// ============================================================
// CodeMeet AI — V1 Demo Mock Data
// 電商後台需求會議：逐字稿 → PRD → DevOps Tickets → MVP 模版路由
// ============================================================

import { getModuleScaffold } from "./CodeTemplates";

// ---------- 型別定義 ----------

export interface TranscriptSegment {
  id: string;
  speaker: string;
  role: string;
  timestamp: string; // mm:ss
  text: string;
  /** 會被 AI 標記為關鍵需求的句子（Step 2 左欄 highlight 用） */
  isKeyPoint?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  participants: string[];
  transcript: TranscriptSegment[];
}

export interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority: "P0" | "P1" | "P2";
}

/** 痛點攔截：會議中「沒講到、但工程上必須決定」的事項 */
export interface GapAlert {
  id: string;
  topic: string;
  message: string;
  defaultDecision: string;
  severity: "info" | "warning";
}

export interface PRD {
  meetingId: string;
  summary: string[];
  userStories: UserStory[];
  gapAlerts: GapAlert[];
}

export type TicketStatus = "todo" | "in-progress" | "done";

export interface Ticket {
  id: string; // e.g. CM-101
  title: string;
  description: string;
  tags: string[];
  /** AI 依會議發言與角色推薦的負責人，實際指派由使用者在看板上確認 */
  suggestedAssignee: string;
  status: TicketStatus;
  storyPoints: number;
  linkedStoryId?: string;
}

// ---------- 團隊成員與個人 Azure DevOps 連結 ----------

export interface TeamMember {
  name: string;
  role: string;
  /** 個人綁定的 Azure DevOps 組織（Demo 用假資料） */
  azureOrg: string;
}

export const teamMembers: TeamMember[] = [
  { name: "Amon", role: "PM", azureOrg: "dev.azure.com/amon-ws" },
  { name: "Ivy", role: "前端", azureOrg: "dev.azure.com/ivy-frontend" },
  { name: "Ken", role: "後端", azureOrg: "dev.azure.com/ken-backend" },
  { name: "Zoe", role: "設計", azureOrg: "dev.azure.com/zoe-design" },
];

/** Demo 情境中目前登入的使用者（「認領」按鈕的對象） */
export const currentUser = "Amon";

/** Semantic Router：關鍵字 → MVP 模版 */
export type MvpTemplate = "AdminDashboard" | "LandingPage" | "MobileApp";

export interface RouteRule {
  template: MvpTemplate;
  keywords: string[];
  label: string;
}

// ---------- Step 1：範例會議逐字稿 ----------

export const sampleMeeting: Meeting = {
  id: "meeting-001",
  title: "電商後台系統需求討論會議",
  date: "2026-07-15",
  durationMinutes: 32,
  participants: ["Amon（PM）", "Ivy（前端）", "Ken（後端）", "Zoe（設計）"],
  transcript: [
    {
      id: "t-01",
      speaker: "Amon",
      role: "PM",
      timestamp: "00:12",
      text: "今天主要討論新的電商後台，客戶希望月底前看到第一版。核心就是訂單管理，其他功能都可以往後排。",
      isKeyPoint: true,
    },
    {
      id: "t-02",
      speaker: "Ivy",
      role: "前端",
      timestamp: "01:05",
      text: "訂單列表需要哪些欄位？我先確認一下才好開表格元件。前端我打算用我們熟的 Next.js 來開。",
      isKeyPoint: true,
    },
    {
      id: "t-03",
      speaker: "Amon",
      role: "PM",
      timestamp: "01:24",
      text: "欄位至少要有訂單編號、買家姓名、訂單金額、付款狀態，還有下單時間。狀態要能一眼看出來是「待付款、已出貨、已完成」。",
      isKeyPoint: true,
    },
    {
      id: "t-04",
      speaker: "Ken",
      role: "後端",
      timestamp: "02:40",
      text: "狀態我建議用 enum 管理，之後要加「退款中」也比較好擴充。API 我會開一支 GET /orders 支援分頁跟狀態篩選。",
      isKeyPoint: true,
    },
    {
      id: "t-05",
      speaker: "Amon",
      role: "PM",
      timestamp: "04:18",
      text: "對了，客戶財務部門每個月要對帳，所以列表一定要能匯出 CSV，這是硬需求。",
      isKeyPoint: true,
    },
    {
      id: "t-06",
      speaker: "Zoe",
      role: "設計",
      timestamp: "05:52",
      text: "後台首頁要不要放一個總覽區？像是今日訂單數、營收這種數字卡片，老闆最愛看這個。",
      isKeyPoint: true,
    },
    {
      id: "t-07",
      speaker: "Amon",
      role: "PM",
      timestamp: "06:30",
      text: "好主意，Dashboard 放四張統計卡：今日訂單、本月營收、待出貨數量、退貨率。",
      isKeyPoint: true,
    },
    {
      id: "t-08",
      speaker: "Ivy",
      role: "前端",
      timestamp: "08:15",
      text: "搜尋功能呢？客服常常要用買家姓名找訂單。",
    },
    {
      id: "t-09",
      speaker: "Amon",
      role: "PM",
      timestamp: "08:42",
      text: "要，支援買家姓名和訂單編號搜尋就夠了，第一版不用做進階篩選。",
      isKeyPoint: true,
    },
    {
      id: "t-10",
      speaker: "Ken",
      role: "後端",
      timestamp: "10:03",
      text: "權限的部分先做單一管理員角色，SSO 之類的等第二期再說。",
    },
  ],
};

// ---------- Step 1：會議紀錄列表（每場會議結束後自動留存錄音與逐字稿） ----------

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  participantCount: number;
  /** new：剛結束、尚未跑分析；analyzed：已完成 AI 分析 */
  status: "new" | "analyzed";
}

export const meetingHistory: MeetingRecord[] = [
  {
    id: "meeting-001",
    title: "電商後台系統需求討論會議",
    date: "2026-07-15",
    durationMinutes: 32,
    participantCount: 4,
    status: "new",
  },
  {
    id: "meeting-000c",
    title: "客服工單流程檢討",
    date: "2026-07-11",
    durationMinutes: 21,
    participantCount: 3,
    status: "analyzed",
  },
  {
    id: "meeting-000b",
    title: "會員點數系統需求訪談",
    date: "2026-07-08",
    durationMinutes: 45,
    participantCount: 5,
    status: "analyzed",
  },
  {
    id: "meeting-000a",
    title: "第一季產品路線圖對齊",
    date: "2026-06-30",
    durationMinutes: 58,
    participantCount: 6,
    status: "analyzed",
  },
];

// ---------- Step 2：AI 生成的 PRD ----------

export const samplePRD: PRD = {
  meetingId: "meeting-001",
  summary: [
    "建立電商後台管理系統第一版，核心為「訂單管理」，目標月底交付。",
    "訂單列表欄位：訂單編號、買家姓名、訂單金額、付款狀態、下單時間。",
    "訂單狀態採 enum 設計（待付款／已出貨／已完成），預留「退款中」擴充。",
    "必須支援 CSV 匯出（財務對帳硬需求）與買家姓名／訂單編號搜尋。",
    "首頁 Dashboard 提供四張統計卡：今日訂單、本月營收、待出貨數量、退貨率。",
  ],
  userStories: [
    {
      id: "US-1",
      asA: "電商營運人員",
      iWant: "在後台查看訂單列表",
      soThat: "我能即時掌握所有訂單的處理進度",
      acceptanceCriteria: [
        "列表顯示訂單編號、買家姓名、金額、付款狀態、下單時間五個欄位",
        "狀態以顏色標籤呈現（待付款／已出貨／已完成）",
        "支援分頁，每頁預設 20 筆",
      ],
      priority: "P0",
    },
    {
      id: "US-2",
      asA: "財務人員",
      iWant: "將訂單列表匯出成 CSV 檔",
      soThat: "我能在月底進行對帳作業",
      acceptanceCriteria: [
        "匯出內容包含當前篩選條件下的所有訂單",
        "CSV 欄位順序與畫面列表一致",
        "檔名格式為 orders_YYYYMMDD.csv",
      ],
      priority: "P0",
    },
    {
      id: "US-3",
      asA: "客服人員",
      iWant: "以買家姓名或訂單編號搜尋訂單",
      soThat: "我能快速定位客戶詢問的訂單",
      acceptanceCriteria: [
        "搜尋框支援買家姓名模糊比對",
        "輸入完整訂單編號可精準命中",
        "無結果時顯示空狀態提示",
      ],
      priority: "P1",
    },
    {
      id: "US-4",
      asA: "營運主管",
      iWant: "在後台首頁看到營運總覽",
      soThat: "我能快速掌握今日營運狀況",
      acceptanceCriteria: [
        "顯示四張統計卡：今日訂單、本月營收、待出貨數量、退貨率",
        "數字每次進入頁面時更新",
      ],
      priority: "P1",
    },
  ],
  gapAlerts: [
    {
      id: "GAP-1",
      topic: "行動版設計",
      message: "會議中未提及行動裝置支援。",
      defaultDecision: "預設採用響應式設計（RWD），平板以上完整功能、手機優先支援瀏覽。",
      severity: "warning",
    },
    {
      id: "GAP-2",
      topic: "訂單資料量級",
      message: "未討論訂單數量規模，影響分頁與匯出效能設計。",
      defaultDecision: "預設以 10 萬筆訂單為設計基準，CSV 匯出採背景任務處理。",
      severity: "warning",
    },
    {
      id: "GAP-3",
      topic: "時區與幣別",
      message: "未指定金額幣別與時間時區。",
      defaultDecision: "預設使用 TWD 與 Asia/Taipei (UTC+8)。",
      severity: "info",
    },
  ],
};

// ---------- Step 2：技術棧決策（自動偵測 + 人工拍板） ----------

export interface TechRule {
  id: string;
  category: string; // e.g. "前端框架"
  options: string[];
  /** option → 偵測關鍵字（比對逐字稿全文，不分大小寫） */
  keywords: Record<string, string[]>;
  defaultOption: string;
}

export interface TechDetection {
  value: string;
  speaker: string;
  quote: string;
  segmentId: string;
}

export interface TechDecision {
  id: string;
  category: string;
  options: string[];
  defaultOption: string;
  /** 有值代表逐字稿中有提及，AI 自動帶入；undefined 則需人工拍板 */
  detected?: TechDetection;
}

export const techRules: TechRule[] = [
  {
    id: "tech-frontend",
    category: "前端框架",
    options: ["Next.js", "Vue 3 (Nuxt)", "Angular", "Blazor"],
    keywords: {
      "Next.js": ["next.js", "nextjs", "react"],
      "Vue 3 (Nuxt)": ["vue", "nuxt"],
      Angular: ["angular"],
      Blazor: ["blazor", "razor"],
    },
    defaultOption: "Next.js",
  },
  {
    id: "tech-backend",
    category: "後端框架",
    options: ["ASP.NET Core", "Spring Boot", "NestJS", "FastAPI"],
    keywords: {
      "ASP.NET Core": ["asp.net", ".net", "c#", "dotnet"],
      "Spring Boot": ["spring", "java"],
      NestJS: ["nestjs", "nest"],
      FastAPI: ["fastapi"],
    },
    defaultOption: "ASP.NET Core",
  },
  {
    id: "tech-db",
    category: "資料庫",
    options: ["PostgreSQL", "MySQL", "MongoDB"],
    keywords: {
      PostgreSQL: ["postgres", "postgresql"],
      MySQL: ["mysql"],
      MongoDB: ["mongo", "mongodb"],
    },
    defaultOption: "PostgreSQL",
  },
];

/**
 * 掃描逐字稿，逐條規則比對關鍵字：
 * 命中 → 回傳偵測結果（含出處句與發言人，供 UI 標註「誰說的」）；
 * 未命中 → detected 為 undefined，UI 應出現選擇提示讓人拍板。
 */
export function detectTechDecisions(meeting: Meeting): TechDecision[] {
  return techRules.map((rule) => {
    let detected: TechDetection | undefined;

    outer: for (const seg of meeting.transcript) {
      const text = seg.text.toLowerCase();
      for (const option of rule.options) {
        const hit = (rule.keywords[option] ?? []).some((kw) =>
          text.includes(kw.toLowerCase())
        );
        if (hit) {
          detected = {
            value: option,
            speaker: seg.speaker,
            quote: seg.text,
            segmentId: seg.id,
          };
          break outer;
        }
      }
    }

    return {
      id: rule.id,
      category: rule.category,
      options: rule.options,
      defaultOption: rule.defaultOption,
      detected,
    };
  });
}

/** Ticket 標籤 → 技術決策類別的對應（決定哪類任務要掛上哪個技術棧標籤） */
export const techTagMapping: Record<string, string> = {
  Frontend: "前端框架",
  API: "後端框架",
  Backend: "資料庫",
};

/** 依 ticket 標籤與目前的技術決策，回傳要附加的技術棧標籤 */
export function getTechTagsForTicket(
  tags: string[],
  techChoices: Record<string, string>
): string[] {
  const result = new Set<string>();
  for (const tag of tags) {
    const category = techTagMapping[tag];
    const choice = category && techChoices[category];
    if (choice) result.add(choice);
  }
  return [...result];
}

// ---------- Step 3：自動開立的 DevOps Tickets ----------

export const sampleTickets: Ticket[] = [
  {
    id: "CM-101",
    title: "建立訂單列表頁面（表格 + 狀態標籤 + 分頁）",
    description: "依 US-1 實作訂單列表，含五欄位表格、狀態顏色標籤與分頁。",
    tags: ["Frontend", "P0"],
    suggestedAssignee: "Ivy",
    status: "todo",
    storyPoints: 5,
    linkedStoryId: "US-1",
  },
  {
    id: "CM-102",
    title: "開發 GET /orders API（分頁 + 狀態篩選）",
    description: "訂單查詢 API，支援 page/pageSize 與 status 參數，狀態採 enum 設計。",
    tags: ["Backend", "API", "P0"],
    suggestedAssignee: "Ken",
    status: "todo",
    storyPoints: 5,
    linkedStoryId: "US-1",
  },
  {
    id: "CM-103",
    title: "實作 CSV 匯出功能（背景任務）",
    description: "依 US-2 實作訂單 CSV 匯出，檔名 orders_YYYYMMDD.csv，大量資料走背景任務。",
    tags: ["Backend", "P0"],
    suggestedAssignee: "Ken",
    status: "todo",
    storyPoints: 3,
    linkedStoryId: "US-2",
  },
  {
    id: "CM-104",
    title: "訂單搜尋（買家姓名模糊 / 訂單編號精準）",
    description: "依 US-3 實作搜尋框與查詢邏輯，含空狀態提示。",
    tags: ["Frontend", "Backend", "P1"],
    suggestedAssignee: "Ivy",
    status: "todo",
    storyPoints: 3,
    linkedStoryId: "US-3",
  },
  {
    id: "CM-105",
    title: "Dashboard 統計卡（今日訂單/本月營收/待出貨/退貨率）",
    description: "依 US-4 實作四張統計卡與對應統計 API。",
    tags: ["Frontend", "API", "P1"],
    suggestedAssignee: "Zoe",
    status: "todo",
    storyPoints: 3,
    linkedStoryId: "US-4",
  },
  {
    id: "CM-106",
    title: "RWD 響應式版面調整",
    description: "依 GAP-1 攔截決策，補上平板／手機斷點樣式。",
    tags: ["Frontend", "Design", "P2"],
    suggestedAssignee: "Zoe",
    status: "todo",
    storyPoints: 2,
  },
];

// ---------- Step 4：程式碼模組與分工產物（一次性腳手架） ----------
// 模組只留 metadata；實際骨架程式碼由 CodeTemplates.getModuleScaffold
// 依 Step 2 選定的技術棧（前端框架／後端框架／資料庫）決定。

export interface CodeModule {
  ticketId: string;
  /** frontend 模組吃「前端框架」模版，backend 模組吃「後端框架」模版 */
  side: "frontend" | "backend";
  branch: string;
}

export const codeModules: CodeModule[] = [
  { ticketId: "CM-101", side: "frontend", branch: "feature/cm-101-order-list" },
  { ticketId: "CM-102", side: "backend", branch: "feature/cm-102-orders-api" },
  { ticketId: "CM-103", side: "backend", branch: "feature/cm-103-csv-export" },
  { ticketId: "CM-104", side: "frontend", branch: "feature/cm-104-order-search" },
  { ticketId: "CM-105", side: "frontend", branch: "feature/cm-105-dashboard-stats" },
  { ticketId: "CM-106", side: "frontend", branch: "feature/cm-106-rwd-layout" },
];

/**
 * 展開 TODO 錨點：TODO(CM-101) → TODO(CM-101 AB#2841 @Ivy)
 * 開發者在 IDE 全域搜尋自己的名字或任務編號即可列出所有待辦點。
 */
export function expandTodoAnchors(
  content: string,
  assignments: Record<string, string>,
  workItemIds: Record<string, number>
): string {
  return content.replace(/TODO\((CM-\d+)\)/g, (_, ticketId: string) => {
    const ab = workItemIds[ticketId];
    const assignee = assignments[ticketId];
    return `TODO(${ticketId}${ab ? ` AB#${ab}` : ""}${assignee ? ` @${assignee}` : ""})`;
  });
}

/** 計算一組骨架檔內的 TODO 錨點數 */
export function countTodoAnchors(files: { content: string }[]): number {
  return files.reduce(
    (sum, f) => sum + (f.content.match(/TODO\(CM-\d+\)/g)?.length ?? 0),
    0
  );
}

/** 依目前指派結果與技術棧選擇，動態產生 CODEOWNERS */
export function generateCodeowners(
  assignments: Record<string, string>,
  techChoices: Record<string, string>
): string {
  const lines = [
    "# 由 CodeMeet AI 產生 — 任務改派時同步更新此檔",
    "# 一個任務一個模組一位負責人；動到誰的地盤，PR 自動找誰 review",
    "",
  ];
  for (const module of codeModules) {
    const owner = assignments[module.ticketId];
    const scaffold = getModuleScaffold(module.ticketId, techChoices);
    if (owner) lines.push(`/${scaffold.path}/ @${owner.toLowerCase()}`);
  }
  lines.push("");
  lines.push("# 共用合約：變更需雙簽");
  lines.push(`/contracts/ @${currentUser.toLowerCase()}`);
  return lines.join("\n");
}

/** 依目前指派結果動態產生每人的交接檔（.codemeet/handoff/NAME.md） */
export function generateHandoffMd(
  memberName: string,
  assignments: Record<string, string>,
  workItemIds: Record<string, number>,
  techChoices: Record<string, string>
): string {
  const member = teamMembers.find((m) => m.name === memberName);
  const myModules = codeModules.filter(
    (m) => assignments[m.ticketId] === memberName
  );

  const lines = [
    `# ${memberName} 的開發交接檔`,
    ``,
    `> 由 CodeMeet AI 產生 · 會議：${sampleMeeting.title}（${sampleMeeting.date}）`,
    `> Azure DevOps：${member?.azureOrg ?? "-"}`,
    ``,
    `## 你的任務（${myModules.length} 個）`,
    ``,
  ];

  for (const module of myModules) {
    const ticket = sampleTickets.find((t) => t.id === module.ticketId);
    if (!ticket) continue;
    const ab = workItemIds[ticket.id];
    const story = samplePRD.userStories.find(
      (s) => s.id === ticket.linkedStoryId
    );
    const scaffold = getModuleScaffold(module.ticketId, techChoices);

    lines.push(
      `### ${ticket.id}${ab ? ` · AB#${ab}` : ""} — ${ticket.title}`,
      ``,
      `- 分支：\`${module.branch}\``,
      `- 模組：\`${scaffold.path}/\`（${scaffold.files.map((f) => f.name).join("、")}）`,
      `- 待辦錨點：${countTodoAnchors(scaffold.files)} 個（全域搜尋 \`@${memberName}\` 或 \`${ticket.id}\`）`
    );
    if (story) {
      lines.push(`- 驗收標準（${story.id}）：`);
      for (const ac of story.acceptanceCriteria) lines.push(`  - [ ] ${ac}`);
    }
    lines.push(``);
  }

  lines.push(
    `## 開工方式`,
    ``,
    `1. \`git checkout <你的分支>\``,
    `2. IDE 全域搜尋 \`@${memberName}\`，列出所有 TODO 錨點`,
    `3. \`contracts/openapi.yaml\` 為共用合約，異動請開 PR 走雙簽`,
    `4. Commit message 帶 \`AB#編號\` 會自動連結 Work Item`
  );

  return lines.join("\n");
}

// ---------- Step 4：Semantic Router 規則 ----------

export const routeRules: RouteRule[] = [
  {
    template: "AdminDashboard",
    label: "管理後台模版",
    keywords: ["後台", "訂單", "列表", "匯出", "報表", "管理", "dashboard"],
  },
  {
    template: "LandingPage",
    label: "產品官網模版",
    keywords: ["官網", "landing", "行銷", "品牌", "宣傳", "SEO"],
  },
  {
    template: "MobileApp",
    label: "行動 App 模版",
    keywords: ["app", "行動", "手機", "推播", "iOS", "Android"],
  },
];

/**
 * Semantic Router：掃描逐字稿全文，統計各模版關鍵字命中數，
 * 回傳得分最高的模版與命中的關鍵字（供 Terminal 進度條展示「思考過程」）。
 */
export function routeMeetingToTemplate(meeting: Meeting): {
  template: MvpTemplate;
  label: string;
  matchedKeywords: string[];
  score: number;
} {
  const fullText = meeting.transcript.map((s) => s.text).join(" ").toLowerCase();

  let best = { rule: routeRules[0], matched: [] as string[] };
  for (const rule of routeRules) {
    const matched = rule.keywords.filter((kw) =>
      fullText.includes(kw.toLowerCase())
    );
    if (matched.length > best.matched.length) {
      best = { rule, matched };
    }
  }

  return {
    template: best.rule.template,
    label: best.rule.label,
    matchedKeywords: best.matched,
    score: best.matched.length,
  };
}

// ---------- Step 4：MVP 預覽用的動態資料（由會議內容「萃取」） ----------

export interface MvpPreviewData {
  appTitle: string;
  statCards: { label: string; value: string; delta: string }[];
  orderColumns: string[];
  orders: {
    orderNo: string;
    buyer: string;
    amount: string;
    status: "待付款" | "已出貨" | "已完成";
    createdAt: string;
  }[];
}

export const mvpPreviewData: MvpPreviewData = {
  appTitle: "電商後台管理系統",
  statCards: [
    { label: "今日訂單", value: "128", delta: "+12.5%" },
    { label: "本月營收", value: "NT$ 842,300", delta: "+8.2%" },
    { label: "待出貨數量", value: "36", delta: "-4.1%" },
    { label: "退貨率", value: "1.8%", delta: "-0.3%" },
  ],
  orderColumns: ["訂單編號", "買家姓名", "訂單金額", "付款狀態", "下單時間"],
  orders: [
    { orderNo: "ORD-20260717-001", buyer: "林小美", amount: "NT$ 2,480", status: "待付款", createdAt: "2026-07-17 09:12" },
    { orderNo: "ORD-20260717-002", buyer: "陳大文", amount: "NT$ 6,150", status: "已出貨", createdAt: "2026-07-17 08:47" },
    { orderNo: "ORD-20260716-098", buyer: "張雅婷", amount: "NT$ 1,290", status: "已完成", createdAt: "2026-07-16 21:33" },
    { orderNo: "ORD-20260716-097", buyer: "王志明", amount: "NT$ 15,800", status: "已出貨", createdAt: "2026-07-16 20:05" },
    { orderNo: "ORD-20260716-096", buyer: "李佳穎", amount: "NT$ 3,420", status: "已完成", createdAt: "2026-07-16 18:59" },
  ],
};
