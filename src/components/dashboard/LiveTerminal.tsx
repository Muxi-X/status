'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import type { EventType } from '@/lib/types/telemetry';

export interface TelemetryEvent {
  id: string;
  type: EventType;
  title: string;
  actor: string;
  url?: string;
  timestamp: string;
}

export interface LiveTerminalProps {
  events?: TelemetryEvent[];
  className?: string;
}

function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '00:00:00';
  }
}

function getEventBadge(type: EventType) {
  switch (type) {
    case 'PR_MERGED':
      return {
        label: 'PR_MERGED',
        className:
          'bg-[var(--status-success)]/20 text-[var(--status-success)] border-[var(--status-success)]/40',
      };
    case 'CI_PASSED':
      return {
        label: 'CI_PASSED',
        className:
          'bg-[var(--status-running)]/20 text-[var(--status-running)] border-[var(--status-running)]/40',
      };
    case 'CI_FAILED':
      return {
        label: 'CI_FAILED',
        className:
          'bg-[var(--status-danger)]/20 text-[var(--status-danger)] border-[var(--status-danger)]/40',
      };
    case 'RELEASE_PUBLISHED':
      return {
        label: 'RELEASE',
        className: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      };
    case 'ISSUE_CLOSED':
    default:
      return {
        label: 'ISSUE_CLOSED',
        className: 'bg-zinc-700/30 text-zinc-400 border-zinc-700',
      };
  }
}

export function LiveTerminal({ events = [], className }: LiveTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Chronologically order: oldest at top, newest at bottom, limit to 15 items
  const sortedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return [...events]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-15);
  }, [events]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [sortedEvents]);

  return (
    <section
      aria-label="Real-time Event Stream"
      className={clsx('col-span-1 md:col-span-6 xl:col-span-12 w-full', className)}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Live Stream
          </h2>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">
          TTY0 // AUTO-SCROLL ON
        </span>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[var(--panel-border)] bg-zinc-950/95 font-mono shadow-sm">
        {/* Terminal Header Bar */}
        <div className="flex h-8 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-[10px] font-semibold tracking-[0.14em] text-zinc-300 uppercase">
              Live Engineering Events
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--status-success)]" />
            <span className="text-[9px] tracking-wider text-zinc-400 uppercase">STREAMING</span>
          </div>
        </div>

        {/* Terminal Event Body */}
        <div
          ref={containerRef}
          tabIndex={0}
          role="region"
          aria-label="Terminal Event Log"
          className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 max-h-[280px] min-h-[180px] overflow-y-auto p-3 text-[11px] leading-relaxed scroll-smooth focus:outline-none"
        >
          {sortedEvents.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-zinc-600">
              <p className="animate-pulse">Awaiting telemetry event stream packets...</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedEvents.map((evt) => {
                const badge = getEventBadge(evt.type);
                return (
                  <div
                    key={evt.id}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[4px] px-1.5 py-1 transition-colors hover:bg-zinc-900/60"
                  >
                    {/* Timestamp */}
                    <span className="shrink-0 text-zinc-500 tabular-nums select-none">
                      {formatTimestamp(evt.timestamp)}
                    </span>

                    {/* Event Type Badge */}
                    <span
                      className={clsx(
                        'shrink-0 rounded-[3px] border px-1.5 py-0.2 text-[9px] font-semibold tracking-wider uppercase',
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>

                    {/* Event Title */}
                    <span className="min-w-0 flex-1 truncate text-zinc-200">
                      {evt.url ? (
                        <a
                          href={evt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-white"
                        >
                          {evt.title}
                        </a>
                      ) : (
                        evt.title
                      )}
                    </span>

                    {/* Actor */}
                    <span className="shrink-0 text-right text-[10px] text-zinc-500">
                      @{evt.actor}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
