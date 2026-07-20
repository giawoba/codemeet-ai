"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCircle2,
  Cpu,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { sampleMeeting, samplePRD, type TechDecision } from "@/data/MockData";
import { cn } from "@/lib/utils";

interface Step2Props {
  techDecisions: TechDecision[];
  techChoices: Record<string, string>;
  onChooseTech: (category: string, value: string) => void;
  onNext: () => void;
}

export function Step2PrdView({
  techDecisions,
  techChoices,
  onChooseTech,
  onNext,
}: Step2Props) {
  const pendingCount = techDecisions.filter(
    (d) => !techChoices[d.category]
  ).length;

  // 「其他」自訂輸入：目前展開輸入框的決策卡與草稿文字
  const [customEditingId, setCustomEditingId] = useState<string | null>(null);
  const [customDraft, setCustomDraft] = useState("");

  const confirmCustom = (category: string) => {
    const value = customDraft.trim();
    if (!value) return;
    onChooseTech(category, value);
    setCustomEditingId(null);
    setCustomDraft("");
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            語意收斂與規格生成
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sampleMeeting.title} · {sampleMeeting.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              尚有 {pendingCount} 項技術決策待確認
            </span>
          )}
          <Button onClick={onNext} disabled={pendingCount > 0} className="gap-2">
            同步至任務看板
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 左欄：逐字稿重點 */}
        <Card className="flex min-h-0 flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">會議逐字稿</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ScrollArea className="h-full max-h-[60vh] pr-3">
              <div className="space-y-3">
                {sampleMeeting.transcript.map((seg) => (
                  <div
                    key={seg.id}
                    className={cn(
                      "rounded-lg border p-3 text-sm",
                      seg.isKeyPoint && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {seg.speaker}
                      </span>
                      <span>{seg.role}</span>
                      <span className="ml-auto font-mono">{seg.timestamp}</span>
                      {seg.isKeyPoint && (
                        <Badge variant="secondary" className="text-[10px]">
                          關鍵需求
                        </Badge>
                      )}
                    </div>
                    {seg.text}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 右欄：AI 生成的結構化資訊 */}
        <Card className="flex min-h-0 flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI 生成規格</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ScrollArea className="h-full max-h-[60vh] pr-3">
              <div className="space-y-5">
                {/* 會議精華 */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold">會議精華總結</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {samplePRD.summary.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">•</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>

                <Separator />

                {/* User Stories */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold">
                    User Stories（{samplePRD.userStories.length}）
                  </h3>
                  <div className="space-y-3">
                    {samplePRD.userStories.map((story) => (
                      <div key={story.id} className="rounded-lg border p-3">
                        <div className="mb-1.5 flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {story.id}
                          </Badge>
                          <Badge
                            variant={story.priority === "P0" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {story.priority}
                          </Badge>
                        </div>
                        <p className="text-sm">
                          身為<b>{story.asA}</b>，我想要
                          <b>{story.iWant}</b>，以便{story.soThat}。
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {story.acceptanceCriteria.map((ac, i) => (
                            <li key={i}>✓ {ac}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* 技術棧決策：有提及自動帶入，未提及出現選擇提示 */}
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <Cpu className="size-4" />
                    技術棧決策
                  </h3>
                  <div className="space-y-2">
                    {techDecisions.map((decision) => {
                      const chosen = techChoices[decision.category];
                      const isAutoDetected =
                        decision.detected && chosen === decision.detected.value;
                      return (
                        <div
                          key={decision.id}
                          className={cn(
                            "rounded-lg border p-3",
                            chosen
                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                              : "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40"
                          )}
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {decision.category}
                            </p>
                            {chosen ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-[10px]"
                              >
                                <CheckCircle2 className="size-3 text-emerald-500" />
                                {isAutoDetected ? "自動偵測" : "已決策"}
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-[10px] text-amber-700 dark:text-amber-400"
                              >
                                <AlertTriangle className="size-3" />
                                待決策
                              </Badge>
                            )}
                          </div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            {decision.detected ? (
                              <>
                                出處：{decision.detected.speaker}
                                「{decision.detected.quote}」
                              </>
                            ) : (
                              <>
                                會議中未提及，請選擇（建議預設：
                                {decision.defaultOption}）
                              </>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {decision.options.map((option) => (
                              <Button
                                key={option}
                                size="sm"
                                variant={chosen === option ? "default" : "outline"}
                                className="h-7 text-xs"
                                onClick={() =>
                                  onChooseTech(decision.category, option)
                                }
                              >
                                {option}
                                {!decision.detected &&
                                  option === decision.defaultOption &&
                                  "（預設）"}
                              </Button>
                            ))}
                            {/* 自訂值被選中時，以選中樣式呈現 */}
                            {chosen && !decision.options.includes(chosen) && (
                              <Button size="sm" className="h-7 gap-1 text-xs">
                                <PenLine className="size-3" />
                                {chosen}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 text-xs text-muted-foreground"
                              onClick={() => {
                                setCustomEditingId(
                                  customEditingId === decision.id
                                    ? null
                                    : decision.id
                                );
                                setCustomDraft(
                                  chosen && !decision.options.includes(chosen)
                                    ? chosen
                                    : ""
                                );
                              }}
                            >
                              <PenLine className="size-3" />
                              其他
                            </Button>
                          </div>
                          {customEditingId === decision.id && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Input
                                autoFocus
                                value={customDraft}
                                onChange={(e) => setCustomDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    confirmCustom(decision.category);
                                  if (e.key === "Escape")
                                    setCustomEditingId(null);
                                }}
                                placeholder={`自行輸入${decision.category}，例如 Svelte、Firebase...`}
                                className="h-7 flex-1 text-xs"
                              />
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                disabled={!customDraft.trim()}
                                onClick={() => confirmCustom(decision.category)}
                              >
                                確認
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <Separator />

                {/* 痛點攔截 */}
                <section>
                  <h3 className="mb-2 text-sm font-semibold">痛點攔截提醒</h3>
                  <div className="space-y-2">
                    {samplePRD.gapAlerts.map((gap) => (
                      <div
                        key={gap.id}
                        className={cn(
                          "flex gap-2.5 rounded-lg border p-3 text-sm",
                          gap.severity === "warning"
                            ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40"
                            : "border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40"
                        )}
                      >
                        {gap.severity === "warning" ? (
                          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Info className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                        )}
                        <div>
                          <p className="font-medium">{gap.topic}</p>
                          <p className="text-xs text-muted-foreground">
                            {gap.message} 預設決策：{gap.defaultDecision}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
