import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PreviewStatus,
  StartPreview,
  StopPreview,
} from "../../wailsjs/go/api/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import type { api } from "../../wailsjs/go/models";

export const PREVIEW_KEY = ["preview"] as const;

export function usePreview() {
  const qc = useQueryClient();
  useEffect(() => {
    const offReady = EventsOn("preview:ready", () =>
      qc.invalidateQueries({ queryKey: PREVIEW_KEY })
    );
    const offStopped = EventsOn("preview:stopped", () =>
      qc.invalidateQueries({ queryKey: PREVIEW_KEY })
    );
    return () => {
      offReady();
      offStopped();
    };
  }, [qc]);

  return useQuery<api.PreviewState>({
    queryKey: PREVIEW_KEY,
    queryFn: () => PreviewStatus(),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export async function startPreview(projectDir: string) {
  return StartPreview(projectDir);
}

export async function stopPreview() {
  return StopPreview();
}
