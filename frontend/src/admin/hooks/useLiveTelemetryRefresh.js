import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Reusable Hook for Real-Time Telemetry Refresh (Phase 6)
 * Built specifically so polling can be replaced/augmented with Socket.IO effortlessly later without refactoring consuming components.
 *
 * @param {Function} onRefresh - Async callback function that refreshes data from server APIs
 * @param {number} defaultIntervalMs - Polling interval in milliseconds (default: 20000ms / 20s)
 */
export function useLiveTelemetryRefresh(onRefresh, defaultIntervalMs = 20000) {
  const [intervalMs, setIntervalMs] = useState(defaultIntervalMs);
  const [isPolling, setIsPolling] = useState(defaultIntervalMs > 0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep latest reference to onRefresh to avoid re-triggering timer when callback identity changes
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  /**
   * Trigger an immediate synchronous/async refresh
   */
  const triggerImmediateRefresh = useCallback(async (silent = true) => {
    if (!onRefreshRef.current) return;
    setIsRefreshing(true);
    try {
      await onRefreshRef.current(silent);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Live telemetry refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Toggle polling ON or OFF
   */
  const togglePolling = useCallback(() => {
    setIsPolling((prev) => !prev);
  }, []);

  /**
   * Change polling interval dynamically (e.g. 15s, 30s, 60s, or 0 to pause)
   */
  const changeInterval = useCallback((newIntervalMs) => {
    setIntervalMs(newIntervalMs);
    setIsPolling(newIntervalMs > 0);
  }, []);

  // Polling / Socket.IO Lifecycle effect
  useEffect(() => {
    if (!isPolling || intervalMs <= 0) return;

    // Polling interval timer
    const timer = setInterval(() => {
      triggerImmediateRefresh(true);
    }, intervalMs);

    /* 
     * Socket.IO Future Extension Placeholder:
     * if (socketInstance) {
     *   socketInstance.on("issue:created", () => triggerImmediateRefresh(true));
     *   socketInstance.on("issue:updated", () => triggerImmediateRefresh(true));
     *   socketInstance.on("department:workload", () => triggerImmediateRefresh(true));
     * }
     */

    return () => {
      clearInterval(timer);
      /*
       * if (socketInstance) {
       *   socketInstance.off("issue:created");
       *   socketInstance.off("issue:updated");
       * }
       */
    };
  }, [isPolling, intervalMs, triggerImmediateRefresh]);

  return {
    isPolling,
    isRefreshing,
    intervalMs,
    lastUpdated,
    togglePolling,
    changeInterval,
    triggerImmediateRefresh
  };
}
