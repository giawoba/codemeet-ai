"use client";

import { useEffect, useRef, useState } from "react";
import {
  Rocket,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Users,
  Download,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  sampleMeeting,
  mvpPreviewData,
  routeMeetingToTemplate,
  codeModules,
  teamMembers,
  type TechDecision,
} from "@/data/MockData";
import { Step4Handoff } from "./Step4Handoff";
import { cn } from "@/lib/utils";

type Phase = "idle" | "generating" | "done";

/** 預覽換膚：同一份 PRD 資料，三種截然不同的版面配置——畫面是可談判的 */
type PreviewTheme = "classic" | "workbench" | "dark";

const previewThemes: { key: PreviewTheme; label: string }[] = [
  { key: "classic", label: "經典儀表板" },
  { key: "workbench", label: "側欄工作台" },
  { key: "dark", label: "深色戰情室" },
];

interface Step4Props {
  techDecisions: TechDecision[];
  techChoices: Record<string, string>;
  assignments: Record<string, string>;
  workItemIds: Record<string, number>;
}

/** 分工檢視：把預覽畫面的一塊 UI 標註回「哪個任務、誰負責、哪個 Work Item」 */
function OwnershipZone({
  active,
  ticketIds,
  assignments,
  workItemIds,
  className,
  children,
}: {
  active: boolean;
  ticketIds: string[];
  assignments: Record<string, string>;
  workItemIds: Record<string, number>;
  className?: string;
  children: React.ReactNode;
}) {
  if (!active) return <div className={className}>{children}</div>;
  return (
    <div
      className={cn(
        "relative rounded-lg outline-2 outline-dashed outline-primary/60 outline-offset-4",
        className
      )}
    >
      <div className="absolute -top-3 left-1 z-10 flex flex-wrap gap-1">
        {ticketIds.map((id) => (
          <Badge key={id} className="gap-1 font-mono text-[10px]">
            {id} · {assignments[id] ?? "未指派"}
            {workItemIds[id] ? ` · AB#${workItemIds[id]}` : ""}
          </Badge>
        ))}
      </div>
      {children}
    </div>
  );
}

export function Step4MvpPreview({
  techDecisions,
  techChoices,
  assignments,
  workItemIds,
}: Step4Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [showOwnership, setShowOwnership] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("classic");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const techStack = techDecisions
    .map((d) => techChoices[d.category])
    .filter(Boolean);
  const manualCount = techDecisions.filter(
    (d) => !d.detected && techChoices[d.category]
  ).length;

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const startGeneration = () => {
    const route = routeMeetingToTemplate(sampleMeeting);
    const script: string[] = [
      "$ meetadream generate --mode greenfield",
      "▸ 解析會議語意向量...",
      `▸ Semantic Router 命中關鍵字：${route.matchedKeywords.map((k) => `"${k}"`).join(", ")}`,
      `▸ 場景判定：${route.label}（${route.template}）· 信心分數 ${route.score}/${route.matchedKeywords.length + 2}`,
      `▸ 套用技術棧決策：${techStack.join(" · ")}${manualCount > 0 ? `（${manualCount} 項由人工拍板）` : ""}`,
      `▸ 生成 contracts/openapi.yaml 合約 + ${techChoices["前端框架"] ?? "通用"} 前端模組 x4 + ${techChoices["後端框架"] ?? "通用"} 後端模組 x2`,
      `▸ 產出 CODEOWNERS、${teamMembers.length} 份交接檔、${codeModules.length} 條 feature 分支`,
      "▸ 動態填入會議萃取資料：欄位 x5、統計卡 x4...",
      "✔ MVP 組譯完成，正在渲染預覽",
    ];

    setPhase("generating");
    setLogs([]);
    script.forEach((line, i) => {
      timersRef.current.push(
        setTimeout(() => setLogs((prev) => [...prev, line]), 600 * (i + 1))
      );
    });
    timersRef.current.push(
      setTimeout(() => setPhase("done"), 600 * (script.length + 1) + 400)
    );
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("idle");
    setLogs([]);
    setShowOwnership(false);
    setPreviewTheme("classic");
  };

  // ----- 版面積木：三種佈局共用，各自排列 -----

  const searchZone = (className?: string) => (
    <OwnershipZone
      active={showOwnership}
      ticketIds={["CM-104"]}
      assignments={assignments}
      workItemIds={workItemIds}
      className={className}
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          readOnly
          placeholder="搜尋買家姓名或訂單編號..."
          className="bg-background pl-8"
        />
      </div>
    </OwnershipZone>
  );

  const exportZone = (
    <OwnershipZone
      active={showOwnership}
      ticketIds={["CM-103"]}
      assignments={assignments}
      workItemIds={workItemIds}
    >
      <Button variant="outline" className="gap-2 bg-background">
        <Download className="size-4" />
        匯出 CSV
      </Button>
    </OwnershipZone>
  );

  const tableZone = (dense: boolean) => (
    <OwnershipZone
      active={showOwnership}
      ticketIds={["CM-101", "CM-102"]}
      assignments={assignments}
      workItemIds={workItemIds}
    >
      <Card
        className={cn("shadow-sm", dense && "[&_td]:py-1.5 [&_th]:h-8")}
      >
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {mvpPreviewData.orderColumns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mvpPreviewData.orders.map((order) => (
                <TableRow key={order.orderNo}>
                  <TableCell className="font-mono text-xs">
                    {order.orderNo}
                  </TableCell>
                  <TableCell>{order.buyer}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "待付款"
                          ? "destructive"
                          : order.status === "已出貨"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </OwnershipZone>
  );

  const statDelta = (delta: string) => {
    const positive = delta.startsWith("+");
    return (
      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-xs",
          positive ? "text-emerald-600" : "text-rose-600"
        )}
      >
        {positive ? (
          <TrendingUp className="size-3.5" />
        ) : (
          <TrendingDown className="size-3.5" />
        )}
        {delta}
      </p>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">MVP 視覺生成</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hybrid 雙軌架構：Semantic Router 判定場景，動態組譯 UI 模版
          </p>
        </div>
        {phase === "done" && (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="size-4" />
            重新演示
          </Button>
        )}
      </div>

      {/* Idle：發光大按鈕 */}
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <button
            onClick={startGeneration}
            className="group relative flex flex-col items-center gap-3 rounded-2xl bg-primary px-14 py-10 text-primary-foreground shadow-[0_0_60px_-10px] shadow-primary/60 transition-all hover:scale-105 hover:shadow-[0_0_80px_-5px] hover:shadow-primary/70"
          >
            <Rocket className="size-10 transition-transform group-hover:-translate-y-1" />
            <span className="text-xl font-semibold">確認開工 (Generate MVP)</span>
            <span className="text-sm opacity-80">
              一次性生成整個網站架構與分工產物，之後各自接手開發
            </span>
          </button>
        </div>
      )}

      {/* Generating：Terminal 風格進度 */}
      {phase === "generating" && (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-2.5">
              <span className="size-3 rounded-full bg-red-500" />
              <span className="size-3 rounded-full bg-yellow-500" />
              <span className="size-3 rounded-full bg-green-500" />
              <span className="ml-3 font-mono text-xs text-zinc-400">
                meetadream-ai — mvp-generator
              </span>
            </div>
            <div className="min-h-72 space-y-2 p-4 font-mono text-sm">
              {logs.map((line, i) => (
                <p
                  key={i}
                  className={cn(
                    "animate-in fade-in slide-in-from-bottom-1",
                    line.startsWith("$")
                      ? "text-zinc-300"
                      : line.startsWith("✔")
                        ? "text-emerald-400"
                        : "text-sky-300"
                  )}
                >
                  {line}
                </p>
              ))}
              <span className="inline-block h-4 w-2 animate-pulse bg-zinc-300" />
            </div>
          </div>
        </div>
      )}

      {/* Done：預覽 + 分工交接 兩個分頁 */}
      {phase === "done" && (
        <Tabs defaultValue="preview" className="flex min-h-0 flex-1 flex-col">
          <TabsList>
            <TabsTrigger value="preview">MVP 預覽</TabsTrigger>
            <TabsTrigger value="handoff">分工交接</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="min-h-0 flex-1">
            <Card
              className={cn(
                "h-full overflow-hidden py-0 shadow-lg",
                previewTheme === "dark" && "dark border-zinc-700"
              )}
            >
              <CardContent className="h-full space-y-6 overflow-auto bg-muted/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {mvpPreviewData.appTitle}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      由 MeetAdream AI 依會議內容自動生成 ·{" "}
                      {previewThemes.find((t) => t.key === previewTheme)?.label}
                      佈局
                      {techStack.length > 0 && ` · ${techStack.join(" + ")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 換佈局：不喜歡就換，資料與結構不動 */}
                    <div className="flex items-center gap-0.5 rounded-lg border bg-background p-0.5">
                      {previewThemes.map((t) => (
                        <Button
                          key={t.key}
                          size="sm"
                          variant={previewTheme === t.key ? "secondary" : "ghost"}
                          className="h-6 px-2 text-xs"
                          onClick={() => setPreviewTheme(t.key)}
                        >
                          {t.label}
                        </Button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant={showOwnership ? "default" : "outline"}
                      className="gap-1.5"
                      onClick={() => setShowOwnership((v) => !v)}
                    >
                      <Users className="size-4" />
                      分工檢視
                    </Button>
                    <Badge className="gap-1">Live Preview</Badge>
                  </div>
                </div>

                {/* ---- 佈局 A：經典儀表板（統計卡列 → 工具列 → 表格） ---- */}
                {previewTheme === "classic" && (
                  <>
                    <OwnershipZone
                      active={showOwnership}
                      ticketIds={["CM-105"]}
                      assignments={assignments}
                      workItemIds={workItemIds}
                    >
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {mvpPreviewData.statCards.map((card) => (
                          <Card key={card.label} className="shadow-sm">
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground">
                                {card.label}
                              </p>
                              <p className="mt-1 text-xl font-semibold tracking-tight">
                                {card.value}
                              </p>
                              {statDelta(card.delta)}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </OwnershipZone>

                    <div className="flex items-center gap-3">
                      {searchZone("max-w-xs flex-1")}
                      {exportZone}
                    </div>

                    {tableZone(false)}
                  </>
                )}

                {/* ---- 佈局 B：側欄工作台（左導覽＋直式統計，右主工作區） ---- */}
                {previewTheme === "workbench" && (
                  <div className="flex gap-4">
                    <aside className="w-56 shrink-0 space-y-4">
                      <div className="space-y-1 rounded-xl border bg-card p-2 shadow-sm">
                        {["儀表板", "訂單管理", "報表匯出", "系統設定"].map(
                          (item, i) => (
                            <div
                              key={item}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                                i === 1
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  i === 1 ? "bg-primary" : "bg-border"
                                )}
                              />
                              {item}
                            </div>
                          )
                        )}
                      </div>
                      <OwnershipZone
                        active={showOwnership}
                        ticketIds={["CM-105"]}
                        assignments={assignments}
                        workItemIds={workItemIds}
                      >
                        <div className="space-y-2">
                          {mvpPreviewData.statCards.map((card) => (
                            <Card key={card.label} className="shadow-sm">
                              <CardContent className="flex items-center justify-between p-3">
                                <div>
                                  <p className="text-[11px] text-muted-foreground">
                                    {card.label}
                                  </p>
                                  <p className="text-base font-semibold tracking-tight">
                                    {card.value}
                                  </p>
                                </div>
                                {statDelta(card.delta)}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </OwnershipZone>
                    </aside>

                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        {searchZone("max-w-sm flex-1")}
                        {exportZone}
                      </div>
                      {tableZone(false)}
                    </div>
                  </div>
                )}

                {/* ---- 佈局 C：深色戰情室（橫幅大數字＋高密度表格） ---- */}
                {previewTheme === "dark" && (
                  <>
                    <OwnershipZone
                      active={showOwnership}
                      ticketIds={["CM-105"]}
                      assignments={assignments}
                      workItemIds={workItemIds}
                    >
                      <div className="grid grid-cols-2 divide-border overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-4 lg:divide-x">
                        {mvpPreviewData.statCards.map((card) => (
                          <div key={card.label} className="p-4">
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                              {card.label}
                            </p>
                            <p className="mt-1.5 text-2xl font-bold tracking-tight">
                              {card.value}
                            </p>
                            {statDelta(card.delta)}
                          </div>
                        ))}
                      </div>
                    </OwnershipZone>

                    <div className="flex items-center justify-between gap-3">
                      {searchZone("max-w-xs flex-1")}
                      {exportZone}
                    </div>

                    {tableZone(true)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="handoff" className="min-h-0 flex-1">
            <Step4Handoff
              assignments={assignments}
              workItemIds={workItemIds}
              techChoices={techChoices}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
