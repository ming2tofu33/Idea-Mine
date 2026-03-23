import { useState, useCallback } from "react";
import { vaultApi } from "../lib/api";
import type { Idea } from "../types/api";
import type { Overview } from "../types/overview";

export function useVault() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [overviews, setOverviews] = useState<Overview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ideasData, overviewsData] = await Promise.all([
        vaultApi.getVaultedIdeas(),
        vaultApi.getOverviews(),
      ]);
      setIdeas(ideasData);
      setOverviews(overviewsData);
    } catch (e) {
      setError("금고 데이터를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIdea = async (ideaId: string) => {
    try {
      await vaultApi.deleteIdea(ideaId);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    } catch {
      setError("원석을 삭제하지 못했습니다");
    }
  };

  return { ideas, overviews, loading, error, loadVault, deleteIdea };
}
