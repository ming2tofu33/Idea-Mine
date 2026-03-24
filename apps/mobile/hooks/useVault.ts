/**
 * IDEA MINE — useVault Hook
 * React Query로 금고 데이터를 캐시. Lab/Vault 탭 간 공유.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vaultApi } from "../lib/api";
import type { Idea } from "../types/api";
import type { Overview } from "../types/overview";

export function useVault() {
  const queryClient = useQueryClient();

  const {
    data: ideas = [],
    isLoading: ideasLoading,
    error: ideasError,
  } = useQuery<Idea[]>({
    queryKey: ["vault-ideas"],
    queryFn: vaultApi.getVaultedIdeas,
    staleTime: 30 * 1000, // 30초
  });

  const {
    data: overviews = [],
    isLoading: overviewsLoading,
    error: overviewsError,
  } = useQuery<Overview[]>({
    queryKey: ["vault-overviews"],
    queryFn: vaultApi.getOverviews,
    staleTime: 30 * 1000,
  });

  const loading = ideasLoading || overviewsLoading;
  const error = ideasError || overviewsError
    ? "금고 데이터를 불러오지 못했습니다"
    : null;

  const loadVault = () => {
    queryClient.invalidateQueries({ queryKey: ["vault-ideas"] });
    queryClient.invalidateQueries({ queryKey: ["vault-overviews"] });
  };

  const deleteIdea = async (ideaId: string) => {
    try {
      await vaultApi.deleteIdea(ideaId);
      queryClient.setQueryData<Idea[]>(["vault-ideas"], (old) =>
        old ? old.filter((i) => i.id !== ideaId) : []
      );
    } catch {
      // 에러 시 refetch로 복구
      queryClient.invalidateQueries({ queryKey: ["vault-ideas"] });
    }
  };

  return { ideas, overviews, loading, error, loadVault, deleteIdea };
}
