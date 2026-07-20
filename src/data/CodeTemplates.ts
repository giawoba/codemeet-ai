// ============================================================
// MeetAdream AI — 框架程式碼模版
// Step 2 選定的技術棧，決定 Step 4 生成的骨架程式碼長什麼樣。
// 前端 4 框架 × 後端 4 框架，模版獨立組合（非 16 套）。
// 內文的 TODO(CM-xxx) 錨點由 expandTodoAnchors 於渲染時展開。
// ============================================================

export interface ScaffoldFile {
  name: string;
  content: string;
}

export interface ModuleScaffold {
  path: string;
  files: ScaffoldFile[];
}

// ---------- 共用合約：語言中立的 OpenAPI，前後端各自 codegen ----------

export const contractScaffold: ModuleScaffold = {
  path: "contracts",
  files: [
    {
      name: "openapi.yaml",
      content: `# 共用合約：前後端各自 codegen，變更需經 CODEOWNERS 雙簽
openapi: 3.1.0
info:
  title: 電商後台 Orders API
  version: 0.1.0
paths:
  /api/orders:
    get:
      summary: 訂單列表（分頁、狀態篩選、關鍵字搜尋）
      parameters:
        - { name: page, in: query, schema: { type: integer, default: 1 } }
        - { name: pageSize, in: query, schema: { type: integer, default: 20 } }
        - { name: status, in: query, schema: { $ref: "#/components/schemas/OrderStatus" } }
        - { name: keyword, in: query, schema: { type: string } }
components:
  schemas:
    OrderStatus:
      type: string
      enum: [pending, shipped, completed]
      # 預留 refunding（Ken 02:40：之後要加「退款中」）
    Order:
      type: object
      properties:
        orderNo: { type: string }
        buyer: { type: string }
        amount: { type: number }
        status: { $ref: "#/components/schemas/OrderStatus" }
        createdAt: { type: string, format: date-time }`,
    },
  ],
};

// ---------- CM-101 訂單列表（前端） ----------

const orderColumnsTs = `import type { Order } from "@/contracts/order";

// 欄位定義由會議逐字稿萃取（Amon 01:24）
export const orderColumns: { key: keyof Order; label: string }[] = [
  { key: "orderNo", label: "訂單編號" },
  { key: "buyer", label: "買家姓名" },
  { key: "amount", label: "訂單金額" },
  { key: "status", label: "付款狀態" },
  { key: "createdAt", label: "下單時間" },
];

// TODO(CM-101): 分頁預設每頁 20 筆（US-1 驗收標準）`;

const orderListTemplates: Record<string, ModuleScaffold> = {
  "Next.js": {
    path: "features/order-list",
    files: [
      {
        name: "OrderTable.tsx",
        content: `import { orderColumns } from "./columns";
import type { Order } from "@/contracts/order";

export function OrderTable({ orders }: { orders: Order[] }) {
  // TODO(CM-101): 串接 GET /api/orders，目前吃 stub 假資料
  return (
    <table>
      <thead>
        <tr>
          {orderColumns.map((c) => (
            <th key={c.key}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.orderNo}>
            {/* TODO(CM-101): 付款狀態改為顏色標籤元件 */}
            <td>{o.orderNo}</td>
            <td>{o.buyer}</td>
            <td>{o.amount}</td>
            <td>{o.status}</td>
            <td>{o.createdAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
      },
      { name: "columns.ts", content: orderColumnsTs },
    ],
  },
  "Vue 3 (Nuxt)": {
    path: "components/order-list",
    files: [
      {
        name: "OrderTable.vue",
        content: `<script setup lang="ts">
import { orderColumns } from "./columns";
import type { Order } from "@/contracts/order";

defineProps<{ orders: Order[] }>();
// TODO(CM-101): 串接 GET /api/orders，目前吃 stub 假資料
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="c in orderColumns" :key="c.key">{{ c.label }}</th>
      </tr>
    </thead>
    <tbody>
      <!-- TODO(CM-101): 付款狀態改為顏色標籤元件 -->
      <tr v-for="o in orders" :key="o.orderNo">
        <td>{{ o.orderNo }}</td>
        <td>{{ o.buyer }}</td>
        <td>{{ o.amount }}</td>
        <td>{{ o.status }}</td>
        <td>{{ o.createdAt }}</td>
      </tr>
    </tbody>
  </table>
</template>`,
      },
      { name: "columns.ts", content: orderColumnsTs },
    ],
  },
  Angular: {
    path: "src/app/order-list",
    files: [
      {
        name: "order-list.component.ts",
        content: `import { Component, Input } from "@angular/core";
import { orderColumns } from "./columns";
import type { Order } from "../contracts/order";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
})
export class OrderListComponent {
  @Input() orders: Order[] = [];
  columns = orderColumns;
  // TODO(CM-101): 串接 GET /api/orders，目前吃 stub 假資料
}`,
      },
      {
        name: "order-list.component.html",
        content: `<table>
  <thead>
    <tr>
      <th *ngFor="let c of columns">{{ c.label }}</th>
    </tr>
  </thead>
  <tbody>
    <!-- TODO(CM-101): 付款狀態改為顏色標籤元件 -->
    <tr *ngFor="let o of orders">
      <td>{{ o.orderNo }}</td>
      <td>{{ o.buyer }}</td>
      <td>{{ o.amount }}</td>
      <td>{{ o.status }}</td>
      <td>{{ o.createdAt }}</td>
    </tr>
  </tbody>
</table>`,
      },
      { name: "columns.ts", content: orderColumnsTs },
    ],
  },
  Blazor: {
    path: "Pages/Orders",
    files: [
      {
        name: "OrderList.razor",
        content: `@page "/orders"
@using MeetAdream.Contracts

<table>
  <thead>
    <tr>
      @foreach (var c in _columns)
      {
        <th>@c</th>
      }
    </tr>
  </thead>
  <tbody>
    @* TODO(CM-101): 付款狀態改為顏色標籤元件 *@
    @foreach (var o in _orders)
    {
      <tr>
        <td>@o.OrderNo</td>
        <td>@o.Buyer</td>
        <td>@o.Amount</td>
        <td>@o.Status</td>
        <td>@o.CreatedAt</td>
      </tr>
    }
  </tbody>
</table>

@code {
  // 欄位定義由會議逐字稿萃取（Amon 01:24）
  private readonly string[] _columns =
    { "訂單編號", "買家姓名", "訂單金額", "付款狀態", "下單時間" };
  private List<Order> _orders = new();
  // TODO(CM-101): 串接 GET /api/orders，目前吃 stub 假資料
  // TODO(CM-101): 分頁預設每頁 20 筆（US-1 驗收標準）
}`,
      },
    ],
  },
};

// ---------- CM-104 訂單搜尋（前端） ----------

const searchTemplates: Record<string, ModuleScaffold> = {
  "Next.js": {
    path: "features/order-search",
    files: [
      {
        name: "SearchBar.tsx",
        content: `export function SearchBar({
  onSearch,
}: {
  onSearch: (keyword: string) => void;
}) {
  // TODO(CM-104): 買家姓名模糊比對、訂單編號精準命中
  // TODO(CM-104): 無結果時顯示空狀態提示（US-3 驗收標準）
  return (
    <input
      placeholder="搜尋買家姓名或訂單編號..."
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}`,
      },
    ],
  },
  "Vue 3 (Nuxt)": {
    path: "components/order-search",
    files: [
      {
        name: "SearchBar.vue",
        content: `<script setup lang="ts">
const emit = defineEmits<{ search: [keyword: string] }>();
// TODO(CM-104): 買家姓名模糊比對、訂單編號精準命中
// TODO(CM-104): 無結果時顯示空狀態提示（US-3 驗收標準）
</script>

<template>
  <input
    placeholder="搜尋買家姓名或訂單編號..."
    @input="emit('search', ($event.target as HTMLInputElement).value)"
  />
</template>`,
      },
    ],
  },
  Angular: {
    path: "src/app/order-search",
    files: [
      {
        name: "search-bar.component.ts",
        content: `import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-search-bar",
  template:
    '<input placeholder="搜尋買家姓名或訂單編號..." (input)="onInput($event)" />',
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  // TODO(CM-104): 買家姓名模糊比對、訂單編號精準命中
  // TODO(CM-104): 無結果時顯示空狀態提示（US-3 驗收標準）
  onInput(e: Event) {
    this.search.emit((e.target as HTMLInputElement).value);
  }
}`,
      },
    ],
  },
  Blazor: {
    path: "Components/Search",
    files: [
      {
        name: "SearchBar.razor",
        content: `<input placeholder="搜尋買家姓名或訂單編號..." @oninput="OnInput" />

@code {
  [Parameter] public EventCallback<string> OnSearch { get; set; }
  // TODO(CM-104): 買家姓名模糊比對、訂單編號精準命中
  // TODO(CM-104): 無結果時顯示空狀態提示（US-3 驗收標準）
  private Task OnInput(ChangeEventArgs e)
    => OnSearch.InvokeAsync(e.Value?.ToString() ?? "");
}`,
      },
    ],
  },
};

// ---------- CM-105 Dashboard 統計卡（前端） ----------

const statsTemplates: Record<string, ModuleScaffold> = {
  "Next.js": {
    path: "features/dashboard-stats",
    files: [
      {
        name: "StatCards.tsx",
        content: `import type { DashboardStats } from "@/contracts/order";

// 四張統計卡由會議逐字稿萃取（Amon 06:30）
export function StatCards({ stats }: { stats: DashboardStats }) {
  // TODO(CM-105): 串接統計 API，數字每次進入頁面時更新
  const cards = [
    { label: "今日訂單", value: stats.todayOrders },
    { label: "本月營收", value: stats.monthlyRevenue },
    { label: "待出貨數量", value: stats.pendingShipments },
    { label: "退貨率", value: stats.returnRate },
  ];
  return cards.map((c) => (
    <div key={c.label}>
      {c.label}: {c.value}
    </div>
  ));
}`,
      },
    ],
  },
  "Vue 3 (Nuxt)": {
    path: "components/dashboard-stats",
    files: [
      {
        name: "StatCards.vue",
        content: `<script setup lang="ts">
import type { DashboardStats } from "@/contracts/order";

const props = defineProps<{ stats: DashboardStats }>();
// 四張統計卡由會議逐字稿萃取（Amon 06:30）
// TODO(CM-105): 串接統計 API，數字每次進入頁面時更新
const cards = [
  { label: "今日訂單", value: props.stats.todayOrders },
  { label: "本月營收", value: props.stats.monthlyRevenue },
  { label: "待出貨數量", value: props.stats.pendingShipments },
  { label: "退貨率", value: props.stats.returnRate },
];
</script>

<template>
  <div v-for="c in cards" :key="c.label">{{ c.label }}: {{ c.value }}</div>
</template>`,
      },
    ],
  },
  Angular: {
    path: "src/app/dashboard-stats",
    files: [
      {
        name: "stat-cards.component.ts",
        content: `import { Component, Input } from "@angular/core";
import type { DashboardStats } from "../contracts/order";

@Component({
  selector: "app-stat-cards",
  template: '<div *ngFor="let c of cards">{{ c.label }}: {{ c.value }}</div>',
})
export class StatCardsComponent {
  @Input() stats!: DashboardStats;
  // 四張統計卡由會議逐字稿萃取（Amon 06:30）
  // TODO(CM-105): 串接統計 API，數字每次進入頁面時更新
  get cards() {
    return [
      { label: "今日訂單", value: this.stats.todayOrders },
      { label: "本月營收", value: this.stats.monthlyRevenue },
      { label: "待出貨數量", value: this.stats.pendingShipments },
      { label: "退貨率", value: this.stats.returnRate },
    ];
  }
}`,
      },
    ],
  },
  Blazor: {
    path: "Components/Stats",
    files: [
      {
        name: "StatCards.razor",
        content: `@using MeetAdream.Contracts

@* 四張統計卡由會議逐字稿萃取（Amon 06:30） *@
@foreach (var c in Cards)
{
  <div>@c.Label: @c.Value</div>
}

@code {
  [Parameter] public DashboardStats Stats { get; set; } = new();
  // TODO(CM-105): 串接統計 API，數字每次進入頁面時更新
  private (string Label, object Value)[] Cards => new[]
  {
    ("今日訂單", (object)Stats.TodayOrders),
    ("本月營收", (object)Stats.MonthlyRevenue),
    ("待出貨數量", (object)Stats.PendingShipments),
    ("退貨率", (object)Stats.ReturnRate),
  };
}`,
      },
    ],
  },
};

// ---------- CM-106 RWD（前端，框架中立的樣式檔） ----------

const rwdScaffold: ModuleScaffold = {
  path: "styles",
  files: [
    {
      name: "breakpoints.css",
      content: `/* RWD 斷點：依 GAP-1 攔截決策（會議未提及，預設響應式） */
/* TODO(CM-106): 平板以上完整功能、手機優先支援瀏覽 */

@media (max-width: 768px) {
  .order-table {
    overflow-x: auto;
  }
}`,
    },
  ],
};

// ---------- CM-102 Orders API（後端，依框架 + 資料庫） ----------

const ormByBackend: Record<string, string> = {
  "ASP.NET Core": "EF Core",
  "Spring Boot": "Spring Data JPA",
  NestJS: "Prisma",
  FastAPI: "SQLAlchemy",
};

const ordersApiTemplates: Record<string, (db: string) => ModuleScaffold> = {
  "ASP.NET Core": (db) => ({
    path: "Api/Orders",
    files: [
      {
        name: "OrdersController.cs",
        content: `using Microsoft.AspNetCore.Mvc;
using MeetAdream.Contracts;

namespace MeetAdream.Api.Orders;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    // Stub API：先回假資料，讓前端第一天就能開工
    [HttpGet]
    public ActionResult<PagedResult<Order>> List([FromQuery] OrderQuery query)
    {
        // TODO(CM-102): 以 EF Core 連接 ${db}，實作分頁查詢
        // TODO(CM-102): status 篩選改為 enum 驗證，預留「退款中」
        return Ok(MockOrders.Page(query));
    }
}`,
      },
    ],
  }),
  "Spring Boot": (db) => ({
    path: "src/main/java/com/meetadream/orders",
    files: [
      {
        name: "OrderController.java",
        content: `package com.meetadream.orders;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // Stub API：先回假資料，讓前端第一天就能開工
    @GetMapping
    public PagedResult<Order> list(OrderQuery query) {
        // TODO(CM-102): 以 Spring Data JPA 連接 ${db}，實作分頁查詢
        // TODO(CM-102): status 篩選改為 enum 驗證，預留「退款中」
        return MockOrders.page(query);
    }
}`,
      },
    ],
  }),
  NestJS: (db) => ({
    path: "src/orders",
    files: [
      {
        name: "orders.controller.ts",
        content: `import { Controller, Get, Query } from "@nestjs/common";
import type { OrderQuery } from "../contracts/order";
import { mockOrders } from "./mock";

@Controller("api/orders")
export class OrdersController {
  // Stub API：先回假資料，讓前端第一天就能開工
  @Get()
  list(@Query() query: OrderQuery) {
    // TODO(CM-102): 以 Prisma 連接 ${db}，實作分頁查詢
    // TODO(CM-102): status 篩選改為 enum 驗證，預留「退款中」
    return { items: mockOrders, total: mockOrders.length };
  }
}`,
      },
    ],
  }),
  FastAPI: (db) => ({
    path: "app/routers",
    files: [
      {
        name: "orders.py",
        content: `from fastapi import APIRouter

from app.mock import MOCK_ORDERS

router = APIRouter(prefix="/api/orders")

# Stub API：先回假資料，讓前端第一天就能開工
@router.get("")
def list_orders(page: int = 1, page_size: int = 20, status: str | None = None):
    # TODO(CM-102): 以 SQLAlchemy 連接 ${db}，實作分頁查詢
    # TODO(CM-102): status 篩選改為 enum 驗證，預留「退款中」
    return {"items": MOCK_ORDERS, "total": len(MOCK_ORDERS)}`,
      },
    ],
  }),
};

// ---------- CM-103 CSV 匯出（後端） ----------

const csvTemplates: Record<string, (db: string) => ModuleScaffold> = {
  "ASP.NET Core": () => ({
    path: "Api/Export",
    files: [
      {
        name: "OrderCsvExporter.cs",
        content: `using MeetAdream.Contracts;

namespace MeetAdream.Api.Export;

public static class OrderCsvExporter
{
    public static string Export(IEnumerable<Order> orders)
    {
        // TODO(CM-103): 大量資料改走背景任務（GAP-2 攔截決策）
        // TODO(CM-103): 檔名格式 orders_YYYYMMDD.csv（US-2 驗收標準）
        var header = "訂單編號,買家姓名,金額,狀態,下單時間";
        var rows = orders.Select(o =>
            string.Join(",", o.OrderNo, o.Buyer, o.Amount, o.Status, o.CreatedAt));
        return string.Join("\\n", new[] { header }.Concat(rows));
    }
}`,
      },
    ],
  }),
  "Spring Boot": () => ({
    path: "src/main/java/com/meetadream/export",
    files: [
      {
        name: "OrderCsvExporter.java",
        content: `package com.meetadream.export;

import com.meetadream.orders.Order;
import java.util.List;
import java.util.stream.Collectors;

public class OrderCsvExporter {

    public static String export(List<Order> orders) {
        // TODO(CM-103): 大量資料改走背景任務（GAP-2 攔截決策）
        // TODO(CM-103): 檔名格式 orders_YYYYMMDD.csv（US-2 驗收標準）
        String header = "訂單編號,買家姓名,金額,狀態,下單時間";
        String rows = orders.stream()
            .map(o -> String.join(",", o.orderNo(), o.buyer(),
                String.valueOf(o.amount()), o.status(), o.createdAt()))
            .collect(Collectors.joining("\\n"));
        return header + "\\n" + rows;
    }
}`,
      },
    ],
  }),
  NestJS: () => ({
    path: "src/orders-export",
    files: [
      {
        name: "export-csv.service.ts",
        content: `import type { Order } from "../contracts/order";

export function exportOrdersCsv(orders: Order[]): string {
  // TODO(CM-103): 大量資料改走背景任務（GAP-2 攔截決策）
  // TODO(CM-103): 檔名格式 orders_YYYYMMDD.csv（US-2 驗收標準）
  const header = "訂單編號,買家姓名,金額,狀態,下單時間";
  const rows = orders.map((o) =>
    [o.orderNo, o.buyer, o.amount, o.status, o.createdAt].join(",")
  );
  return [header, ...rows].join("\\n");
}`,
      },
    ],
  }),
  FastAPI: () => ({
    path: "app/services",
    files: [
      {
        name: "export_csv.py",
        content: `from app.models import Order

def export_orders_csv(orders: list[Order]) -> str:
    # TODO(CM-103): 大量資料改走背景任務（GAP-2 攔截決策）
    # TODO(CM-103): 檔名格式 orders_YYYYMMDD.csv（US-2 驗收標準）
    header = "訂單編號,買家姓名,金額,狀態,下單時間"
    rows = [
        ",".join(map(str, (o.order_no, o.buyer, o.amount, o.status, o.created_at)))
        for o in orders
    ]
    return "\\n".join([header, *rows])`,
      },
    ],
  }),
};

// ---------- 通用 fallback：「其他」自訂框架 ----------

function genericScaffold(
  ticketId: string,
  framework: string,
  side: "frontend" | "backend"
): ModuleScaffold {
  return {
    path: side === "frontend" ? "src/custom-frontend" : "src/custom-backend",
    files: [
      {
        name: "SCAFFOLD.md",
        content: `# ${framework} — 通用骨架示意

V1 內建模版未涵蓋「${framework}」，此為通用骨架佔位。
正式版將由 LLM 依會議規格即時生成對應框架的程式碼。

## 本模組待辦

- TODO(${ticketId}): 依 contracts/openapi.yaml 合約實作本模組
- TODO(${ticketId}): 完成後移除本佔位檔`,
      },
    ],
  };
}

// ---------- 對外入口：任務編號 + 技術棧選擇 → 模組骨架 ----------

const FRONTEND_TICKETS: Record<string, Record<string, ModuleScaffold>> = {
  "CM-101": orderListTemplates,
  "CM-104": searchTemplates,
  "CM-105": statsTemplates,
};

const BACKEND_TICKETS: Record<
  string,
  Record<string, (db: string) => ModuleScaffold>
> = {
  "CM-102": ordersApiTemplates,
  "CM-103": csvTemplates,
};

export function getModuleScaffold(
  ticketId: string,
  techChoices: Record<string, string>
): ModuleScaffold {
  const frontend = techChoices["前端框架"] ?? "Next.js";
  const backend = techChoices["後端框架"] ?? "ASP.NET Core";
  const db = techChoices["資料庫"] ?? "PostgreSQL";

  if (ticketId === "CM-106") return rwdScaffold;

  const frontendTmpl = FRONTEND_TICKETS[ticketId];
  if (frontendTmpl) {
    return frontendTmpl[frontend] ?? genericScaffold(ticketId, frontend, "frontend");
  }

  const backendTmpl = BACKEND_TICKETS[ticketId];
  if (backendTmpl) {
    return backendTmpl[backend]?.(db) ?? genericScaffold(ticketId, backend, "backend");
  }

  return genericScaffold(ticketId, frontend, "frontend");
}

export { ormByBackend };
