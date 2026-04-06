import { VaultBackground } from "@/components/backgrounds/vault-background";

export default function VaultPage() {
  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">The Vault</h2>
          <p className="mt-2 text-sm text-text-secondary">
            아이디어 자산을 보관하고 다시 꺼내보는 공간
          </p>
        </div>
      </div>
    </div>
  );
}
