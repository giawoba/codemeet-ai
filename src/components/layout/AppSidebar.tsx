"use client";

import {
  AudioLines,
  BookOpen,
  SquareKanban,
  MonitorPlay,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStep = 1 | 2 | 3 | 4;

const navItems: {
  step: WorkflowStep;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { step: 1, label: "會議中心", description: "開會、通話、匯入紀錄", icon: AudioLines },
  { step: 2, label: "文件庫", description: "PRD 與知識庫", icon: BookOpen },
  { step: 3, label: "任務看板", description: "DevOps Tickets", icon: SquareKanban },
  { step: 4, label: "原型預覽", description: "MVP 視覺生成", icon: MonitorPlay },
];

interface AppSidebarProps {
  currentStep: WorkflowStep;
  /** 已完成的最大步驟，之後的選單顯示為鎖定樣式 */
  maxUnlockedStep: WorkflowStep;
  onNavigate: (step: WorkflowStep) => void;
}

export function AppSidebar({
  currentStep,
  maxUnlockedStep,
  onNavigate,
}: AppSidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">MeetAdream AI</p>
          <p className="text-xs text-muted-foreground">會議即開發助理</p>
        </div>
      </div>

      {/* Workflow Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workflow
        </p>
        {navItems.map((item) => {
          const isActive = item.step === currentStep;
          const isLocked = item.step > maxUnlockedStep;
          const Icon = item.icon;
          return (
            <button
              key={item.step}
              onClick={() => !isLocked && onNavigate(item.step)}
              disabled={isLocked}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent hover:text-accent-foreground",
                isLocked && "cursor-not-allowed opacity-40 hover:bg-transparent"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                  isActive
                    ? "border-primary/30 bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {item.step}
              </span>
              <span className="flex-1 leading-tight">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
              {isActive && <ChevronRight className="size-4 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-5 py-4">
        <p className="text-xs text-muted-foreground">
          V1 Demo · Greenfield Mode
        </p>
      </div>
    </aside>
  );
}
