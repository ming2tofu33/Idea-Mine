import { LabBackground } from "@/components/backgrounds/lab-background";

export default function LabPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">The Lab</h2>
          <p className="mt-2 text-sm text-text-secondary">
            선택한 아이디어를 정제하고 확장하는 공간
          </p>
        </div>
      </div>
    </div>
  );
}
