"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  MonitorUp,
  PhoneOff,
  Sparkles,
  Captions,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sampleMeeting, teamMembers } from "@/data/MockData";
import { cn } from "@/lib/utils";

interface MeetingRoomProps {
  mode: "video" | "voice";
  /** 側欄「結束會議，生成 AI 分析」：直接進入 Step 2 */
  onAnalyze: () => void;
  /** 控制列紅色「結束會議」：回會議中心，錄音存進會議紀錄列表 */
  onLeave: (elapsedSeconds: number) => void;
}

const STREAM_INTERVAL_MS = 2200;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MeetingRoom({ mode, onAnalyze, onLeave }: MeetingRoomProps) {
  // 已「說出」的逐字稿段數（模擬即時語音轉文字）
  const [visibleCount, setVisibleCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const segments = sampleMeeting.transcript;
  const done = visibleCount >= segments.length;
  const currentSpeaker = done ? null : segments[visibleCount - 1]?.speaker;

  useEffect(() => {
    const streamTimer = setInterval(
      () => setVisibleCount((c) => Math.min(c + 1, segments.length)),
      STREAM_INTERVAL_MS
    );
    const clockTimer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      clearInterval(streamTimer);
      clearInterval(clockTimer);
    };
  }, [segments.length]);

  // 逐字稿自動捲到最新一句
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleCount]);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 會議室標頭 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            {sampleMeeting.title}
          </h1>
          <Badge variant="outline" className="font-mono">
            {mode === "video" ? "視訊會議" : "語音通話"} · CM-8421
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400">
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            REC · AI 逐字稿擷取中
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {formatElapsed(elapsed)}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        {/* 與會者區 */}
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
            {teamMembers.map((member) => {
              const speaking = member.name === currentSpeaker;
              return (
                <div
                  key={member.name}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl bg-zinc-900 transition-all",
                    speaking && "ring-2 ring-emerald-400"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white",
                      speaking ? "bg-emerald-600" : "bg-zinc-700"
                    )}
                  >
                    {member.name.slice(0, 1)}
                  </div>
                  <p className="mt-2 text-sm text-zinc-200">
                    {member.name}
                    <span className="ml-1 text-xs text-zinc-500">
                      {member.role}
                    </span>
                  </p>
                  <span className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs text-zinc-400">
                    {speaking ? (
                      <>
                        <Mic className="size-3.5 text-emerald-400" />
                        發言中
                      </>
                    ) : (
                      <MicOff className="size-3.5" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 控制列 */}
          <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-2.5">
            <Button
              size="icon"
              variant={muted ? "destructive" : "secondary"}
              onClick={() => setMuted((v) => !v)}
              title={muted ? "取消靜音" : "靜音"}
            >
              {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              disabled={mode === "voice"}
              title="攝影機"
            >
              <Video className="size-4" />
            </Button>
            <Button size="icon" variant="secondary" title="分享畫面">
              <MonitorUp className="size-4" />
            </Button>
            <Button size="icon" variant="secondary" title="即時字幕">
              <Captions className="size-4" />
            </Button>
            <div className="mx-2 h-6 w-px bg-border" />
            <Button
              variant="destructive"
              className="gap-2 px-4"
              onClick={() => onLeave(elapsed)}
            >
              <PhoneOff className="size-4" />
              結束會議
            </Button>
          </div>
        </div>

        {/* 即時逐字稿側欄 */}
        <div className="flex w-96 shrink-0 flex-col rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">即時逐字稿</h2>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              AI 同步標記關鍵需求
            </Badge>
          </div>
          <div
            ref={transcriptRef}
            className="min-h-0 flex-1 space-y-2.5 overflow-y-auto scroll-smooth p-3"
          >
            {segments.slice(0, visibleCount).map((seg, i) => (
              <div
                key={seg.id}
                className={cn(
                  "rounded-lg border p-2.5 text-sm animate-in fade-in slide-in-from-bottom-2",
                  seg.isKeyPoint && "border-primary/40 bg-primary/5",
                  i === visibleCount - 1 && !done && "border-emerald-400/60"
                )}
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {seg.speaker}
                  </span>
                  <span className="font-mono">{seg.timestamp}</span>
                  {seg.isKeyPoint && (
                    <Badge variant="secondary" className="ml-auto gap-0.5 text-[9px]">
                      <Sparkles className="size-2.5" />
                      關鍵需求
                    </Badge>
                  )}
                </div>
                {seg.text}
              </div>
            ))}
            {!done && (
              <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
                聆聽中...
              </p>
            )}
          </div>
          {done && (
            <div className="border-t p-3">
              <Button className="w-full gap-2" onClick={onAnalyze}>
                <Sparkles className="size-4" />
                結束會議，生成 AI 分析
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
