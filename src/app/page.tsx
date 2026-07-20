"use client";

import { useState } from "react";
import { AppSidebar, type WorkflowStep } from "@/components/layout/AppSidebar";
import { Step1MeetingInput } from "@/components/steps/Step1MeetingInput";
import { Step2PrdView } from "@/components/steps/Step2PrdView";
import { Step3DevOpsBoard } from "@/components/steps/Step3DevOpsBoard";
import { Step4MvpPreview } from "@/components/steps/Step4MvpPreview";
import {
  detectTechDecisions,
  sampleMeeting,
  sampleTickets,
} from "@/data/MockData";

// 逐字稿為靜態範例資料，偵測結果不會變，模組層算一次即可
const techDecisions = detectTechDecisions(sampleMeeting);

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<WorkflowStep>(1);

  // 技術棧決策：自動偵測到的先帶入，其餘等使用者在 Step 2 拍板
  const [techChoices, setTechChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      techDecisions
        .filter((d) => d.detected)
        .map((d) => [d.category, d.detected!.value])
    )
  );

  // 任務的指派結果：AI 建議先帶入，Step 3 可改派/認領；Step 4 分工總覽共用
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(sampleTickets.map((t) => [t.id, t.suggestedAssignee]))
  );

  // ticketId → Azure DevOps Work Item ID（Step 3 同步完成後寫入）
  const [workItemIds, setWorkItemIds] = useState<Record<string, number>>({});

  const chooseTech = (category: string, value: string) =>
    setTechChoices((prev) => ({ ...prev, [category]: value }));

  const assignTicket = (ticketId: string, member: string) =>
    setAssignments((prev) => ({ ...prev, [ticketId]: member }));

  const recordWorkItem = (ticketId: string, workItemId: number) =>
    setWorkItemIds((prev) => ({ ...prev, [ticketId]: workItemId }));

  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step);
    if (step > maxUnlockedStep) setMaxUnlockedStep(step);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        currentStep={currentStep}
        maxUnlockedStep={maxUnlockedStep}
        onNavigate={setCurrentStep}
      />
      <main className="flex-1 overflow-auto bg-background">
        <div className="h-full p-6 lg:p-8">
          {currentStep === 1 && (
            <Step1MeetingInput onProceed={() => goToStep(2)} />
          )}
          {currentStep === 2 && (
            <Step2PrdView
              techDecisions={techDecisions}
              techChoices={techChoices}
              onChooseTech={chooseTech}
              onNext={() => goToStep(3)}
            />
          )}
          {currentStep === 3 && (
            <Step3DevOpsBoard
              techChoices={techChoices}
              assignments={assignments}
              onAssign={assignTicket}
              workItemIds={workItemIds}
              onWorkItemCreated={recordWorkItem}
              onNext={() => goToStep(4)}
            />
          )}
          {currentStep === 4 && (
            <Step4MvpPreview
              techDecisions={techDecisions}
              techChoices={techChoices}
              assignments={assignments}
              workItemIds={workItemIds}
            />
          )}
        </div>
      </main>
    </div>
  );
}
