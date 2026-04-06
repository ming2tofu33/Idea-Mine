import { MineBackground } from "@/components/backgrounds/mine-background";

export default function MinePage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">The Mine</h2>
          <p className="mt-2 text-sm text-text-secondary">
            광맥을 탐사하고 아이디어를 채굴하는 공간
          </p>
        </div>
      </div>
    </div>
  );
}
