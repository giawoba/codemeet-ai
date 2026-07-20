"use client";

import { useEffect, useRef, useState } from "react";
import {
  Folder,
  FileCode2,
  FileText,
  GitBranch,
  Layers,
  Users,
  CloudUpload,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  codeModules,
  teamMembers,
  currentUser,
  countTodoAnchors,
  expandTodoAnchors,
  generateCodeowners,
  generateHandoffMd,
} from "@/data/MockData";
import { getModuleScaffold, contractScaffold } from "@/data/CodeTemplates";
import { cn } from "@/lib/utils";

interface Step4HandoffProps {
  assignments: Record<string, string>;
  workItemIds: Record<string, number>;
  techChoices: Record<string, string>;
}

type ViewMode = "module" | "person";
type PublishState = "idle" | "publishing" | "published";

const REPO_URL =
  "https://dev.azure.com/meetadream/ecommerce-admin/_git/ecommerce-admin";
const INITIAL_COMMIT = "a1b2c3d";

interface FileEntry {
  id: string;
  label: string;
  kind: "code" | "doc";
}

interface TreeSection {
  key: string;
  title: string;
  meta?: string;
  files: FileEntry[];
}

export function Step4Handoff({
  assignments,
  workItemIds,
  techChoices,
}: Step4HandoffProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("module");
  const [selectedId, setSelectedId] = useState<string>(
    `handoff:${currentUser}`
  );

  // ----- 發佈至 Git Repo（謝幕動畫） -----
  const publishSteps = [
    `git init ecommerce-admin · 初始 commit ${INITIAL_COMMIT}（訊息含 ${codeModules.length} 個 AB# 連結）`,
    "push → dev.azure.com/meetadream/ecommerce-admin",
    `建立 ${codeModules.length} 條 feature 分支`,
    "套用 main 分支保護：PR 必經 · CODEOWNERS 雙簽生效",
    `邀請 ${teamMembers.length} 位協作者，發送 clone URL 與各自的交接檔`,
  ];
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [doneSteps, setDoneSteps] = useState(0);
  const [copied, setCopied] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const startPublish = () => {
    setPublishState("publishing");
    setDoneSteps(0);
    publishSteps.forEach((_, i) => {
      timersRef.current.push(
        setTimeout(() => setDoneSteps(i + 1), 550 * (i + 1))
      );
    });
    timersRef.current.push(
      setTimeout(
        () => setPublishState("published"),
        550 * (publishSteps.length + 1)
      )
    );
  };

  const copyRepoUrl = async () => {
    try {
      await navigator.clipboard.writeText(REPO_URL);
      setCopied(true);
      timersRef.current.push(setTimeout(() => setCopied(false), 1500));
    } catch {
      // clipboard 權限被拒時靜默略過（Demo 環境）
    }
  };

  // 每個任務的骨架依 Step 2 選定的技術棧生成
  const scaffoldByTicket = Object.fromEntries(
    codeModules.map((m) => [m.ticketId, getModuleScaffold(m.ticketId, techChoices)])
  );

  // ----- 每人開發包統計 -----
  const memberPacks = teamMembers.map((member) => {
    const modules = codeModules.filter(
      (m) => assignments[m.ticketId] === member.name
    );
    return {
      member,
      modules,
      ticketCount: modules.length,
      fileCount: modules.reduce(
        (sum, m) => sum + scaffoldByTicket[m.ticketId].files.length,
        0
      ),
      anchorCount: modules.reduce(
        (sum, m) => sum + countTodoAnchors(scaffoldByTicket[m.ticketId].files),
        0
      ),
    };
  });

  // ----- 檔案樹（兩種分組） -----
  const sections: TreeSection[] =
    viewMode === "module"
      ? [
          {
            key: "contracts",
            title: `${contractScaffold.path}/`,
            meta: "共用合約 · 雙簽",
            files: contractScaffold.files.map((f) => ({
              id: `contract:${f.name}`,
              label: f.name,
              kind: "code" as const,
            })),
          },
          ...codeModules.map((m) => ({
            key: m.ticketId,
            title: `${scaffoldByTicket[m.ticketId].path}/`,
            meta: `${m.ticketId} · ${assignments[m.ticketId] ?? "未指派"}`,
            files: scaffoldByTicket[m.ticketId].files.map((f) => ({
              id: `mod:${m.ticketId}:${f.name}`,
              label: f.name,
              kind: "code" as const,
            })),
          })),
          {
            key: "handoff",
            title: ".meetadream/handoff/",
            meta: "每人交接檔",
            files: teamMembers.map((m) => ({
              id: `handoff:${m.name}`,
              label: `${m.name.toUpperCase()}.md`,
              kind: "doc" as const,
            })),
          },
          {
            key: "root",
            title: "（repo 根目錄）",
            files: [{ id: "codeowners", label: "CODEOWNERS", kind: "doc" }],
          },
        ]
      : [
          ...memberPacks.map((pack) => ({
            key: pack.member.name,
            title: `${pack.member.name}（${pack.member.role}）`,
            meta: `${pack.ticketCount} 個任務`,
            files: [
              ...pack.modules.flatMap((m) =>
                scaffoldByTicket[m.ticketId].files.map((f) => ({
                  id: `mod:${m.ticketId}:${f.name}`,
                  label: `${scaffoldByTicket[m.ticketId].path}/${f.name}`,
                  kind: "code" as const,
                }))
              ),
              {
                id: `handoff:${pack.member.name}`,
                label: `handoff/${pack.member.name.toUpperCase()}.md`,
                kind: "doc" as const,
              },
            ],
          })),
          {
            key: "shared",
            title: "共用（動它要走雙簽）",
            files: [
              ...contractScaffold.files.map((f) => ({
                id: `contract:${f.name}`,
                label: `${contractScaffold.path}/${f.name}`,
                kind: "code" as const,
              })),
              { id: "codeowners", label: "CODEOWNERS", kind: "doc" as const },
            ],
          },
        ];

  // ----- 檔案內容解析 -----
  const resolveFile = (
    id: string
  ): { title: string; content: string } | null => {
    if (id === "codeowners") {
      return {
        title: "CODEOWNERS",
        content: generateCodeowners(assignments, techChoices),
      };
    }
    if (id.startsWith("handoff:")) {
      const name = id.slice("handoff:".length);
      return {
        title: `.meetadream/handoff/${name.toUpperCase()}.md`,
        content: generateHandoffMd(name, assignments, workItemIds, techChoices),
      };
    }
    if (id.startsWith("contract:")) {
      const name = id.slice("contract:".length);
      const file = contractScaffold.files.find((f) => f.name === name);
      return file
        ? { title: `${contractScaffold.path}/${file.name}`, content: file.content }
        : null;
    }
    if (id.startsWith("mod:")) {
      const [, ticketId, fileName] = id.split(":");
      const scaffold = scaffoldByTicket[ticketId];
      const file = scaffold?.files.find((f) => f.name === fileName);
      if (!scaffold || !file) return null;
      return {
        title: `${scaffold.path}/${file.name}`,
        content: expandTodoAnchors(file.content, assignments, workItemIds),
      };
    }
    return null;
  };

  const selected = resolveFile(selectedId);
  const selectedModule = selectedId.startsWith("mod:")
    ? codeModules.find((m) => m.ticketId === selectedId.split(":")[1])
    : undefined;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 發佈至 Git Repo */}
      <Card className="shrink-0 py-0 shadow-sm">
        <CardContent className="p-4">
          {publishState === "idle" && (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  程式碼骨架與分工產物已就緒
                </p>
                <p className="text-xs text-muted-foreground">
                  發佈後成員即可 clone 專案、切到自己的分支開工，MeetAdream
                  功成身退
                </p>
              </div>
              <Button onClick={startPublish} className="gap-2">
                <CloudUpload className="size-4" />
                發佈至 Git Repo
              </Button>
            </div>
          )}

          {publishState === "publishing" && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="size-4 animate-spin" />
                發佈中...
              </p>
              {publishSteps.slice(0, doneSteps).map((line) => (
                <p
                  key={line}
                  className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1"
                >
                  <Check className="size-3.5 shrink-0 text-emerald-500" />
                  {line}
                </p>
              ))}
            </div>
          )}

          {publishState === "published" && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <p className="text-sm font-medium">
                  Repo 已發佈，團隊可以開工了
                </p>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  main 已保護 · CODEOWNERS 生效
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                  git clone {REPO_URL}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyRepoUrl}
                  title="複製 clone 指令"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                初始 commit {INITIAL_COMMIT} · {codeModules.length} 條 feature
                分支 · 已通知 {teamMembers.length} 位成員（附各自的交接檔連結）
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 每人開發包 */}
      <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
        {memberPacks.map(({ member, modules, ...stats }) => (
          <Card key={member.name} className="shadow-sm">
            <CardContent className="space-y-2 p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {member.name.slice(0, 1)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium">
                    {member.name}
                    {member.name === currentUser && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        （你）
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {member.azureOrg}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.ticketCount} 個任務 · {stats.fileCount} 個檔案 ·{" "}
                {stats.anchorCount} 個待辦錨點
              </p>
              <div className="space-y-0.5">
                {modules.length > 0 ? (
                  modules.map((m) => (
                    <p
                      key={m.ticketId}
                      className="flex items-center gap-1 truncate font-mono text-[10px] text-muted-foreground"
                    >
                      <GitBranch className="size-3 shrink-0" />
                      {m.branch}
                    </p>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    本次無指派
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 檔案樹 + 程式碼檢視 */}
      <div className="flex min-h-0 flex-1 gap-4">
        <Card className="flex w-80 shrink-0 flex-col py-0 shadow-sm">
          <div className="flex items-center gap-1 border-b p-2">
            <Button
              size="sm"
              variant={viewMode === "module" ? "secondary" : "ghost"}
              className="h-7 flex-1 gap-1 text-xs"
              onClick={() => setViewMode("module")}
            >
              <Layers className="size-3.5" />
              按模組
            </Button>
            <Button
              size="sm"
              variant={viewMode === "person" ? "secondary" : "ghost"}
              className="h-7 flex-1 gap-1 text-xs"
              onClick={() => setViewMode("person")}
            >
              <Users className="size-3.5" />
              按人
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 p-2.5">
              {sections.map((section) => (
                <div key={section.key}>
                  <div className="mb-1 flex items-center gap-1.5 px-1">
                    <Folder className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-xs font-medium">
                      {section.title}
                    </span>
                    {section.meta && (
                      <Badge
                        variant="outline"
                        className="ml-auto shrink-0 text-[9px]"
                      >
                        {section.meta}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {section.files.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedId(file.id)}
                        className={cn(
                          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 pl-6 text-left font-mono text-xs transition-colors",
                          selectedId === file.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {file.kind === "code" ? (
                          <FileCode2 className="size-3.5 shrink-0" />
                        ) : (
                          <FileText className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{file.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* 程式碼檢視器 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-lg">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <span className="font-mono text-xs text-zinc-300">
              {selected?.title ?? "選擇左側檔案"}
            </span>
            {selectedModule && (
              <>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedModule.ticketId} ·{" "}
                  {assignments[selectedModule.ticketId] ?? "未指派"}
                </Badge>
                <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                  <GitBranch className="size-3" />
                  {selectedModule.branch}
                </span>
              </>
            )}
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <pre className="p-4 font-mono text-xs leading-relaxed">
              {selected?.content.split("\n").map((line, i) => {
                const isAnchor = line.includes("TODO(");
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      isAnchor && "-mx-2 rounded bg-amber-500/15 px-2"
                    )}
                  >
                    <span className="w-8 shrink-0 select-none text-right text-zinc-600">
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "ml-4 whitespace-pre-wrap",
                        isAnchor ? "text-amber-300" : "text-zinc-300"
                      )}
                    >
                      {line || " "}
                    </span>
                  </div>
                );
              })}
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
