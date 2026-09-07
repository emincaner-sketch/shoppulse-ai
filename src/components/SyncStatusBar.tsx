'use client';

import React from 'react';
import { Language } from '@/types';
import { RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface SyncStatusBarProps {
  language: Language;
  syncStatus: 'IDLE' | 'SYNCING' | 'READY' | 'FAILED';
  syncProgress: number;
  stageLabelTr: string;
  stageLabelEn: string;
  onTriggerSync?: () => void;
  onDismiss?: () => void;
}

export default function SyncStatusBar({
  language,
  syncStatus,
  syncProgress,
  stageLabelTr,
  stageLabelEn,
  onTriggerSync,
  onDismiss,
}: SyncStatusBarProps) {
  if (syncStatus === 'IDLE' || (syncStatus === 'READY' && syncProgress >= 100)) {
    return null;
  }

  const label = language === 'tr' ? stageLabelTr : stageLabelEn;

  return (
    <div className="w-full bg-[#121215] border-b border-white/[0.08] px-4 py-2.5 transition-all animate-in fade-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {syncStatus === 'SYNCING' ? (
            <div className="relative flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
          ) : syncStatus === 'FAILED' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
            <span className="font-semibold text-zinc-100">
              {language === 'tr' ? 'Veri Eşitleme Durumu:' : 'Store Sync Engine:'}
            </span>
            <span className="text-zinc-300 font-mono text-[11px]">{label}</span>
          </div>
        </div>

        {/* Right progress indicator */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 w-36 sm:w-48">
            <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden border border-white/[0.04]">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, syncProgress)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-emerald-400 font-semibold tabular-nums w-9 text-right">
              %{syncProgress}
            </span>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
