"use client";

import { useEffect, useRef, useState } from "react";
import {
  CloudUpload,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Hand,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sampleTickets,
  teamMembers,
  currentUser,
  getTechTagsForTicket,
  type TicketStatus,
} from "@/data/MockData";
import { cn } from "@/lib/utils";

interface Step3Props {
  techChoices: Record<string, string>;
  assignments: Record<string, string>;
  onAssign: (ticketId: string, member: string) => void;
  workItemIds: Record<string, number>;
  onWorkItemCreated: (ticketId: string, workItemId: number) => void;
  onNext: () => void;
}

type Phase = "assign" | "syncing" | "synced";

const columns: { status: TicketStatus; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

const SYNC_INTERVAL_MS = 450;

export function Step3DevOpsBoard({
  techChoices,
  assignments,
  onAssign,
  workItemIds,
  onWorkItemCreated,
  onNext,
}: Step3Props) {
  // 重回此頁時若已全數同步過，直接顯示完成狀態
  const [phase, setPhase] = useState<Phase>(() =>
    Object.keys(workItemIds).length === sampleTickets.length
      ? "synced"
      : "assign"
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const assign = onAssign;

  const startSync = () => {
    setPhase("syncing");
    // 逐項同步的視覺效果：每 450ms 完成一個任務並掛上 Work Item ID
    sampleTickets.forEach((ticket, i) => {
      timersRef.current.push(
        setTimeout(
          () => onWorkItemCreated(ticket.id, 2841 + i),
          SYNC_INTERVAL_MS * (i + 1)
        )
      );
    });
    timersRef.current.push(
      setTimeout(
        () => setPhase("synced"),
        SYNC_INTERVAL_MS * (sampleTickets.length + 1)
      )
    );
  };

  const syncedCount = Object.keys(workItemIds).length;
  const orgCount = new Set(
    Object.values(assignments)
      .map((name) => teamMembers.find((m) => m.name === name)?.azureOrg)
      .filter(Boolean)
  ).size;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            自動填寫 DevOps
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI 已依 PRD 拆解出 {sampleTickets.length} 個開發任務並建議負責人 —
            請確認指派或認領，再同步至各自的 Azure DevOps
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phase === "assign" && (
            <Button size="lg" onClick={startSync} className="gap-2">
              <CloudUpload className="size-5" />
              同步至 Azure DevOps
            </Button>
          )}
          {phase === "syncing" && (
            <Button size="lg" disabled className="gap-2">
              <Loader2 className="size-5 animate-spin" />
              同步中 {syncedCount}/{sampleTickets.length}
            </Button>
          )}
          {phase === "synced" && (
            <>
              <Badge variant="secondary" className="gap-1.5 px-3 py-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-500" />
                已同步 {sampleTickets.length} 個工作項目至 {orgCount} 個 Azure DevOps
              </Badge>
              <Button onClick={onNext} className="gap-2">
                前往原型預覽
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const tickets = sampleTickets.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="rounded-xl bg-muted/50 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="outline">{tickets.length}</Badge>
              </div>
              <div className="space-y-2.5">
                {tickets.map((ticket) => {
                  const assignee = assignments[ticket.id];
                  const workItemId = workItemIds[ticket.id];
                  const azureOrg = teamMembers.find(
                    (m) => m.name === assignee
                  )?.azureOrg;

                  return (
                    <Card key={ticket.id} className="shadow-sm">
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">
                            {ticket.id}
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {ticket.storyPoints} pt
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-snug">
                          {ticket.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {ticket.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {getTechTagsForTicket(ticket.tags, techChoices).map(
                            (tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="border-primary/40 text-[10px] text-primary"
                              >
                                {tech}
                              </Badge>
                            )
                          )}
                        </div>

                        {/* 指派區：assign 階段可改派/認領；同步後顯示 Work Item 狀態 */}
                        {phase === "assign" ? (
                          <div className="flex items-center gap-1.5 pt-1">
                            <Select
                              value={assignee}
                              onValueChange={(v) => assign(ticket.id, v)}
                            >
                              <SelectTrigger
                                size="sm"
                                className="h-7 flex-1 text-xs"
                              >
                                <SelectValue placeholder="指派給..." />
                              </SelectTrigger>
                              <SelectContent>
                                {teamMembers.map((m) => (
                                  <SelectItem key={m.name} value={m.name}>
                                    {m.name}（{m.role}）
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {assignee === ticket.suggestedAssignee && (
                              <Badge
                                variant="secondary"
                                className="gap-0.5 text-[10px]"
                              >
                                <Sparkles className="size-3" />
                                AI 建議
                              </Badge>
                            )}
                            {assignee !== currentUser && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 px-2 text-xs"
                                onClick={() => assign(ticket.id, currentUser)}
                              >
                                <Hand className="size-3" />
                                認領
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs",
                              workItemId
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "border-border bg-muted/50 text-muted-foreground"
                            )}
                          >
                            {workItemId ? (
                              <>
                                <CheckCircle2 className="size-3.5 shrink-0" />
                                <span className="font-mono">
                                  AB#{workItemId}
                                </span>
                                <span className="ml-auto truncate">
                                  {assignee} · {azureOrg}
                                </span>
                              </>
                            ) : (
                              <>
                                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                                同步至 {assignee} 的 Azure DevOps...
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {tickets.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    尚無任務
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
