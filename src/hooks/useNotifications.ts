'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { DisasterEvent } from '@/types/disaster';
import { DISASTER_CONFIG } from '@/types/disaster';

export function useNotifications(events: DisasterEvent[]) {
  const seenIds = useRef(new Set<string>());
  const initialized = useRef(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    // First load: seed IDs without notifying
    if (!initialized.current) {
      events.forEach((e) => seenIds.current.add(e.id));
      initialized.current = true;
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const fresh = events.filter(
      (e) =>
        !seenIds.current.has(e.id) &&
        (e.state === 'breaking' || e.state === 'recent')
    );
    fresh.forEach((e) => seenIds.current.add(e.id));
    if (fresh.length === 0) return;

    for (const e of fresh.slice(0, 3)) {
      const cfg = DISASTER_CONFIG[e.disasterType];
      new Notification(`⚠ ${cfg.label.toUpperCase()} ALERT`, {
        body: e.title,
        icon: '/favicon.ico',
        tag: e.id,
      });
    }
    if (fresh.length > 3) {
      new Notification(`⚠ ${fresh.length - 3} MORE ALERTS`, {
        body: 'Open Crisis Monitor for details',
        icon: '/favicon.ico',
        tag: 'crisis-batch',
      });
    }
  }, [events]);

  return { requestPermission };
}
