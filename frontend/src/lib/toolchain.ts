import { useQuery } from "@tanstack/react-query";
import { Toolchain } from "../../wailsjs/go/api/App";
import type { api } from "../../wailsjs/go/models";

export const TOOLCHAIN_KEY = ["toolchain"] as const;

export function useToolchain() {
  return useQuery<api.ToolchainInfo>({
    queryKey: TOOLCHAIN_KEY,
    queryFn: () => Toolchain(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
