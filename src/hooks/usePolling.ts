import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    const tick = () => {
      if (!active) return;
      void callbackRef.current();
    };

    tick();
    const timer = window.setInterval(tick, intervalMs);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs]);
}
