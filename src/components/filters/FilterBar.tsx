'use client';

import { useState, useEffect } from 'react';
import { DISASTER_CONFIG, type DisasterSubtype } from '@/types/disaster';
import { ALL_DISASTER_TYPES, type TimeRange } from '@/types/filters';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '24H', value: '24h' },
  { label: '7D',  value: '7d'  },
  { label: '30D', value: '30d' },
];

interface FilterBarProps {
  activeTypes: Set<DisasterSubtype>;
  timeRange: TimeRange;
  showHeatMap: boolean;
  onToggleType: (type: DisasterSubtype) => void;
  onSetTimeRange: (range: TimeRange) => void;
  onToggleHeatMap: () => void;
  onRequestNotifications: () => Promise<boolean>;
}

const mono = { fontFamily: "'Share Tech Mono', monospace" };

export default function FilterBar({
  activeTypes,
  timeRange,
  showHeatMap,
  onToggleType,
  onSetTimeRange,
  onToggleHeatMap,
  onRequestNotifications,
}: FilterBarProps) {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  async function handleNotifClick() {
    const granted = await onRequestNotifications();
    setNotifPermission(granted ? 'granted' : 'denied');
  }

  return (
    <div
      className="flex-shrink-0 overflow-x-auto scrollbar-none"
      style={{ background: '#020804', borderBottom: '1px solid #0c1f10', ...mono }}
    >
      <div className="flex items-center gap-1 px-2 py-1 min-w-max">

        {/* Type toggles */}
        <span className="text-[8px] tracking-widest mr-1 flex-shrink-0" style={{ color: '#3a6828' }}>
          TYPE:
        </span>

        {ALL_DISASTER_TYPES.map((type) => {
          const cfg = DISASTER_CONFIG[type];
          const on = activeTypes.has(type);
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              title={`Toggle ${cfg.label}`}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] flex-shrink-0 transition-opacity"
              style={{
                border: `1px solid ${on ? cfg.color : '#1a4a22'}`,
                color: on ? cfg.color : '#3a6828',
                background: on ? `${cfg.color}15` : 'transparent',
                opacity: on ? 1 : 0.45,
                letterSpacing: '0.04em',
              }}
            >
              <span style={{
                width: 6, height: 6,
                background: on ? cfg.color : '#3a6828',
                transform: 'rotate(45deg)',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span className="hidden sm:inline">{cfg.label.toUpperCase()}</span>
              <span className="sm:hidden">{cfg.emoji}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-3 w-px mx-1 flex-shrink-0" style={{ background: '#1a4a22' }} />

        {/* Time range */}
        <span className="text-[8px] tracking-widest mr-1 flex-shrink-0" style={{ color: '#3a6828' }}>
          RANGE:
        </span>
        {TIME_RANGES.map(({ label, value }) => {
          const active = timeRange === value;
          return (
            <button
              key={value}
              onClick={() => onSetTimeRange(value)}
              className="px-1.5 py-0.5 text-[9px] flex-shrink-0 transition-colors"
              style={{
                border: `1px solid ${active ? '#d4aa00' : '#1a4a22'}`,
                color: active ? '#d4aa00' : '#3a6828',
                background: active ? '#d4aa0015' : 'transparent',
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-3 w-px mx-1 flex-shrink-0" style={{ background: '#1a4a22' }} />

        {/* Heat map */}
        <button
          onClick={onToggleHeatMap}
          className="px-1.5 py-0.5 text-[9px] flex-shrink-0 transition-colors"
          style={{
            border: `1px solid ${showHeatMap ? '#44ff66' : '#1a4a22'}`,
            color: showHeatMap ? '#44ff66' : '#3a6828',
            background: showHeatMap ? '#44ff6615' : 'transparent',
          }}
        >
          ◎ HEAT
        </button>

        {/* Notifications */}
        {notifPermission !== 'denied' && notifPermission !== 'unsupported' && (
          <button
            onClick={handleNotifClick}
            className="px-1.5 py-0.5 text-[9px] flex-shrink-0 transition-colors"
            style={{
              border: `1px solid ${notifPermission === 'granted' ? '#44ff66' : '#1a4a22'}`,
              color: notifPermission === 'granted' ? '#44ff66' : '#3a6828',
              background: notifPermission === 'granted' ? '#44ff6615' : 'transparent',
            }}
          >
            {notifPermission === 'granted' ? '⊙ ALERTS ON' : '⊙ ALERTS'}
          </button>
        )}
      </div>
    </div>
  );
}
