"use client";

import { useState } from "react";
import {
  FileAudio,
  Video,
  Phone,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  meetingHistory,
  sampleMeeting,
  type MeetingRecord,
} from "@/data/MockData";
import { MeetingRoom } from "./MeetingRoom";
import { cn } from "@/lib/utils";

interface Step1Props {
  /** 會議結束或載入範例後，進入 Step 2 分析 */
  onProceed: () => void;
}

type Step1Mode = "hub" | "video" | "voice";

export function Step1MeetingInput({ onProceed }: Step1Props) {
  const [mode, setMode] = useState<Step1Mode>("hub");
  const [joinCode, setJoinCode] = useState("");
  // 會議紀錄列表：掛斷會議後，剛結束的場次會插到最上方等待分析
  const [records, setRecords] = useState<MeetingRecord[]>(meetingHistory);

  const handleLeave = (elapsedSeconds: number) => {
    const justEnded: MeetingRecord = {
      id: `meeting-${Date.now()}`,
      title: sampleMeeting.title,
      date: new Date().toISOString().slice(0, 10),
      durationMinutes: Math.max(1, Math.ceil(elapsedSeconds / 60)),
      participantCount: sampleMeeting.participants.length,
      status: "new",
    };
    setRecords((prev) => [justEnded, ...prev]);
    setMode("hub");
  };

  if (mode === "video" || mode === "voice") {
    return (
      <MeetingRoom mode={mode} onAnalyze={onProceed} onLeave={handleLeave} />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">會議中心</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          會議在這裡開，AI 邊開邊聽——結束的瞬間，PRD、任務與 MVP 已經在路上
        </p>
      </div>

      {/* 三條入口：發起視訊 / 語音通話 / 加入會議 */}
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
        <button
          onClick={() => setMode("video")}
          className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
            <Video className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">發起視訊會議</p>
            <p className="mt-1 text-xs text-muted-foreground">
              即時逐字稿與關鍵需求標記隨會議進行
            </p>
          </div>
        </button>

        <button
          onClick={() => setMode("voice")}
          className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground transition-transform group-hover:scale-110">
            <Phone className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">發起語音通話</p>
            <p className="mt-1 text-xs text-muted-foreground">
              臨時討論也不漏接，通話同樣進分析管線
            </p>
          </div>
        </button>

        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
            <KeyRound className="size-6" />
          </div>
          <p className="text-sm font-semibold">加入會議</p>
          <div className="flex w-full gap-1.5">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && joinCode.trim()) setMode("video");
              }}
              placeholder="會議代碼"
              className="h-8 text-center font-mono text-xs"
            />
            <Button
              size="icon"
              className="size-8 shrink-0"
              disabled={!joinCode.trim()}
              onClick={() => setMode("video")}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        或從會議紀錄繼續
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* 會議紀錄列表：每場會議結束後自動留存錄音與逐字稿 */}
      <Card className="w-full py-0 shadow-sm">
        <CardContent className="divide-y p-0">
          {records.map((record) => {
            const isNew = record.status === "new";
            return (
              <div
                key={record.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5",
                  isNew && "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    isNew
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <FileAudio className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-medium">
                    {record.title}
                    {isNew && (
                      <Badge className="shrink-0 text-[10px]">
                        新錄製 · 待分析
                      </Badge>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{record.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {record.durationMinutes} 分鐘
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {record.participantCount} 位與會者
                    </span>
                  </p>
                </div>
                {isNew ? (
                  <Button onClick={onProceed} className="shrink-0 gap-1.5">
                    <Sparkles className="size-4" />
                    開始 AI 分析
                  </Button>
                ) : (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    已分析
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
