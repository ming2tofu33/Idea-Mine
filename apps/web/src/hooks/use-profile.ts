"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api";
import type { UserProfile } from "@/types/api";

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (language: "ko" | "en") => profileApi.updateLanguage(language),
    onSuccess: (_, language) => {
      queryClient.setQueryData<UserProfile | null>(["profile"], (old) =>
        old ? { ...old, language } : old,
      );
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    updateLanguage: (language: "ko" | "en") =>
      updateLanguageMutation.mutate(language),
    isUpdatingLanguage: updateLanguageMutation.isPending,
  };
}
