/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ModSettings } from '../types/mod.ts';
import { FolderCheck, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

interface InstallationGuideProps {
  settings: ModSettings;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const InstallationGuide: React.FC<InstallationGuideProps> = ({
  settings,
  onDownloadZip,
  isDownloading,
}) => {
  return (
    <div className="space-y-8 py-2">
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Farming Simulator 25 Installation &amp; Setup Guide
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Install and activate <span className="text-amber-400 font-mono">{settings.modName}.zip</span> (v{settings.modVersion} by {settings.author}) in FS25.
        </p>
      </div>

      {/* 4 Step Visual Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 relative overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            01
          </div>
          <h3 className="text-sm font-semibold text-white">Download Zip</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click <strong>Download FS25 Mod (.zip)</strong> to get <code className="text-amber-400 font-mono text-[11px]">{settings.modName}.zip</code>.
          </p>
          <div className="text-[11px] text-amber-400/90 font-medium pt-1">
            Important: Do NOT unzip or extract the file.
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            02
          </div>
          <h3 className="text-sm font-semibold text-white">Move to Mods Folder</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste the downloaded <code className="font-mono text-slate-300">.zip</code> directly into your FS25 <code className="font-mono text-amber-400">mods</code> directory.
          </p>
          <div className="text-[10px] text-slate-500 font-mono pt-1 break-all">
            Documents\My Games\FarmingSimulator2025\mods\
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            03
          </div>
          <h3 className="text-sm font-semibold text-white">Enable in Savegame</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Launch FS25. In the Career or Multiplayer Savegame screen, check <strong>Lazy Mouse Terrain Painter</strong> in the active mod list.
          </p>
        </div>

        {/* Step 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            04
          </div>
          <h3 className="text-sm font-semibold text-white">Landscaping &amp; Hold Alt</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Open the Construction screen (<kbd className="font-mono text-slate-300">Shift+P</kbd>) &gt; Landscaping. Simply <strong>hold <kbd className="font-mono text-amber-400">{settings.defaultKeybind}</kbd></strong> to smooth!
          </p>
        </div>
      </div>

      {/* Directory Paths Reference */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FolderCheck className="h-4 w-4 text-amber-400" />
          <span>Farming Simulator 25 Mods Folder Locations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <span className="text-slate-400 font-sans font-medium text-[11px] block">
              Windows (Steam, Epic Games, Giants Direct, PC Game Pass)
            </span>
            <div className="text-amber-400 break-all select-all">
              C:\Users\&lt;YourUsername&gt;\Documents\My Games\FarmingSimulator2025\mods\
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
            <span className="text-slate-400 font-sans font-medium text-[11px] block">
              macOS (Apple Silicon &amp; Intel)
            </span>
            <div className="text-amber-400 break-all select-all">
              ~/Library/Application Support/FarmingSimulator2025/mods/
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Compatibility Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>Multiplayer &amp; Dedicated Server Support</span>
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            The mod is 100% client-side compatible with dedicated servers and crossplay multiplayer sessions. Dedicated server instances cleanly bypass UI hooks via <code className="text-teal-400 font-mono">g_dedicatedServer</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Keybindings &amp; Troubleshooting</span>
          </h3>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Keybindings can be remapped at any time in the standard FS25 Pause Menu under <strong>Keyboard Controls &gt; General &gt; Stabilize Stroke (Lazy Mouse)</strong>.
          </p>
        </div>
      </div>

      {/* Direct CTA */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 hover:bg-amber-500 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          <span>Download {settings.modName}.zip (v{settings.modVersion})</span>
        </button>
      </div>
    </div>
  );
};
