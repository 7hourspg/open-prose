import { useEffect, useState } from "react";
import { ReadImage } from "../../wailsjs/go/api/App";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

const PREFIX = "/media/";

/**
 * Resolves an image URL to something the webview can actually render.
 *
 * For project-stored images ("/media/<filename>") the editor would
 * otherwise hit Vite (in `wails dev`) which has no such route, so we
 * fetch the file via Wails IPC and return a data URL. Other URLs pass
 * through unchanged.
 *
 * Identical URLs only fetch once per session (module-level cache).
 */
export function useResolvedSrc(url: string | undefined | null): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!url) return "";
    if (!url.startsWith(PREFIX)) return url;
    return cache.get(url) ?? "";
  });

  useEffect(() => {
    if (!url) {
      setResolved("");
      return;
    }
    if (!url.startsWith(PREFIX)) {
      setResolved(url);
      return;
    }
    const cached = cache.get(url);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    const filename = url.slice(PREFIX.length);
    const promise =
      inflight.get(url) ??
      ReadImage(filename)
        .then((dataURL) => {
          cache.set(url, dataURL);
          inflight.delete(url);
          return dataURL;
        })
        .catch((err) => {
          inflight.delete(url);
          throw err;
        });
    inflight.set(url, promise);
    promise
      .then((dataURL) => {
        if (!cancelled) setResolved(dataURL);
      })
      .catch(() => {
        // Leave resolved as the original URL; broken image renders.
        if (!cancelled) setResolved(url);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return resolved;
}
