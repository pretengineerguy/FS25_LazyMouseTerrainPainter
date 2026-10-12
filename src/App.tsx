/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModSettings } from './types/mod.ts';
import { Header } from './components/Header.tsx';
import { ModOverview } from './components/ModOverview.tsx';
import { InteractiveHudPreview } from './components/InteractiveHudPreview.tsx';
import { CodeInspector } from './components/CodeInspector.tsx';
import { InstallationGuide } from './components/InstallationGuide.tsx';
import { buildProductionModZip } from './lib/modPackager.ts';

const DEFAULT_SETTINGS: ModSettings = {
  modName: 'FS25_LazyMouseTerrainPainter',
  modTitle: 'Lazy Mouse Terrain Painter',
  enabledByDefault: false,
  activationMode: 'hold',
  defaultKeybind: 'Left Alt',
  defaultKeybindFSKey: 'KEY_lalt',
  incKeybind: ']',
  decKeybind: '[',
  tetherRadius: 0.06,
  minRadius: 0.01,
  maxRadius: 0.25,
  radiusStep: 0.005,
  stringLengthMeters: 1.2,
  curveMode: 'fixed',
  elasticStiffness: 0.65,
  inertiaDamping: 0.25,
  leashColor: '#F3A626',
  showHudOverlay: true,
  hudPosition: 'top_right',
  enableSoundFeedback: true,
  multiplayerSync: true,
  leftMenuThreshold: 0.38,
  bottomMenuThreshold: 0.16,
  descVersion: '94',
  modVersion: '1.0.0.0',
  author: 'Pretengineer',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('hud-preview');
  const [settings, setSettings] = useState<ModSettings>(DEFAULT_SETTINGS);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const updateSettings = (newSettings: Partial<ModSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zipBlob = await buildProductionModZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'FS25_LazyMouseTerrainPainter.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to create mod zip archive:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
        downloadSuccess={downloadSuccess}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hud-preview' && (
          <InteractiveHudPreview
            settings={settings}
            updateSettings={updateSettings}
          />
        )}

        {activeTab === 'overview' && (
          <ModOverview
            settings={settings}
            onOpenPreview={() => setActiveTab('hud-preview')}
            onOpenCode={() => setActiveTab('code')}
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
          />
        )}

        {activeTab === 'code' && (
          <CodeInspector settings={settings} />
        )}

        {activeTab === 'install' && (
          <InstallationGuide
            settings={settings}
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FS25 Lazy Mouse Terrain Painter</span>
            <span aria-hidden="true">·</span>
            <span>v1.0.0.0 by Pretengineer</span>
            <span aria-hidden="true">·</span>
            <span>GIANTS Engine 10 (FS25)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('hud-preview')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Demo Simulator
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Installation
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Source Code
            </button>
            <button
              onClick={handleDownloadZip}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
            >
              Download .zip
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
