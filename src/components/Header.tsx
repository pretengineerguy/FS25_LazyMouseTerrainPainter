/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
  downloadSuccess: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  isDownloading,
  downloadSuccess,
}) => {
  const navItems = [
    { id: 'hud-preview', label: 'Demo / Simulator' },
    { id: 'overview', label: 'Overview' },
    { id: 'install', label: 'Installation Guide' },
    { id: 'code', label: 'Source Code' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('hud-preview')}
            className="flex items-center gap-2.5 text-left text-base font-bold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
              FS25
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-100 leading-none">Lazy Mouse Terrain Painter</span>
              <span className="text-[10px] text-amber-400/80 font-mono font-normal">v1.0.0.0 by Pretengineer</span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer text-sm ${
                  isActive
                    ? 'text-amber-400 font-semibold border-b-2 border-amber-500 pb-0.5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Downloaded .zip</span>
              </>
            ) : (
              <>
                <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>Download FS25 Mod (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
