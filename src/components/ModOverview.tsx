/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModSettings } from '../types/mod.ts';
import {
  Download,
  ShieldCheck,
  MousePointer,
  Layers,
  ArrowRight,
  Compass,
  Key,
  EyeOff,
} from 'lucide-react';

interface ModOverviewProps {
  settings: ModSettings;
  onOpenPreview: () => void;
  onOpenCode: () => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const ModOverview: React.FC<ModOverviewProps> = ({
  settings,
  onOpenPreview,
  onOpenCode,
  onDownloadZip,
  isDownloading,
}) => {
  return (
    <div className="space-y-10 py-2">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
            <span className="text-amber-400 font-semibold">Farming Simulator 25</span>
            <span aria-hidden="true">·</span>
            <span>GIANTS Engine 10 (Patch 1.24+)</span>
            <span aria-hidden="true">·</span>
            <span>descVersion {settings.descVersion}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono">v{settings.modVersion} by {settings.author}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Production Release</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Lazy Mouse Terrain Painter
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            Non-destructive stroke-stabilization overlay for Farming Simulator 25's Construction Landscaping modes.
            Eliminates mouse hand tremor, sudden angle snaps, and micro-stutters during ground painting and terrain sculpting.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 hover:bg-amber-500 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>Download {settings.modName}.zip</span>
            </button>
            <button
              onClick={onOpenPreview}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <span>Test In-Game Simulator</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>
            <button
              onClick={onOpenCode}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <span>Inspect Source Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid: Highlights the 6 Key Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Decoupled 2D Anchor Paradigm */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <MousePointer className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Decoupled 2D Anchor Paradigm</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Rather than overriding internal C++ 3D brush raycasts, the mod intercepts <code className="text-amber-400 font-mono">ConstructionScreen.mouseEvent</code>. Smoothed 2D tether coordinates are fed into the projector, letting GIANTS' native 3D raycast handle brush placement.
          </p>
        </div>

        {/* Card 2: Edge Autoscroll Restoration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Edge Autoscroll Restoration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            During mouse smoothing, the primary hardware cursor coordinates are forwarded directly to <code className="text-sky-400 font-mono">screenSelf.camera</code>. Screen-edge camera autoscrolling is preserved while keeping the brush tethered.
          </p>
        </div>

        {/* Card 3: Menu Suppression & Tab Filtering */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Tab Filtering &amp; Suppression</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bypasses full-screen canvas deadzones by inspecting the active mode (<code className="text-purple-400 font-mono">TAB_LANDSCAPING</code>). While browsing Placeables, Sheds, Animals, or Productions, all hooks and HUD entries stay dormant.
          </p>
        </div>

        {/* Card 4: GIANTS Safety Amber Tether Rendering */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Safety Amber Tether Rendering</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uses multi-segment <code className="text-amber-400 font-mono">drawFilledRect</code> in GIANTS safety amber (<code className="text-amber-400 font-mono">0.95, 0.65, 0.15, 0.85</code>). Draws a cyan reticle at the physical mouse cursor and an amber pip at the trailing anchor.
          </p>
        </div>

        {/* Card 5: Push-to-Talk Hold & F1 Help Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Momentary Hold &amp; F1 Help Box</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hold <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[11px] border border-slate-700">Left Alt</kbd> to smooth terrain; release for 1:1 mouse. Employs <code className="text-emerald-400 font-mono">addExtraPrintText</code> to dynamically show status in the standard F1 Help box.
          </p>
        </div>

        {/* Card 6: Multiplayer & Server Safe */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Multiplayer &amp; Server Safe</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            100% client-side input smoothing with zero desyncs. Guards dedicated servers via <code className="text-teal-400 font-mono">g_dedicatedServer</code> checks. Safe for all singleplayer and multiplayer games.
          </p>
        </div>
      </div>
    </div>
  );
};
