import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetSetting, SetSetting } from "../../../wailsjs/go/api/App";

export const FIRST_RUN_FLAG = "firstRunCompleted";

export function useFirstRunCompleted() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["setting", FIRST_RUN_FLAG],
    queryFn: () => GetSetting(FIRST_RUN_FLAG),
    staleTime: Infinity,
  });
  const mutation = useMutation({
    mutationFn: (value: string) => SetSetting(FIRST_RUN_FLAG, value),
    onSuccess: (_data, value) => {
      qc.setQueryData(["setting", FIRST_RUN_FLAG], value);
    },
  });
  return {
    completed: query.data === "1",
    loading: query.isLoading,
    markCompleted: () => mutation.mutateAsync("1"),
  };
}
