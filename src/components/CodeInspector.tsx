/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModSettings } from '../types/mod.ts';
import {
  modDescXml,
  luaScript,
  installationReadmeText,
} from '../lib/modPackager.ts';
import { Copy, Check, FileCode, FileText, Info } from 'lucide-react';

interface CodeInspectorProps {
  settings: ModSettings;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ settings }) => {
  const [activeFile, setActiveFile] = useState<string>('lua');
  const [copied, setCopied] = useState<boolean>(false);

  const files = [
    {
      id: 'lua',
      name: 'LazyMouseTerrainPainter.lua',
      path: 'scripts/LazyMouseTerrainPainter.lua',
      lang: 'lua',
      content: luaScript,
      icon: FileCode,
      desc: 'Production GIANTS Engine 10 Lua script with Decoupled 2D Anchor, Edge Autoscroll Restoration to screenSelf.camera, and Tab Filtering.',
    },
    {
      id: 'modDesc',
      name: 'modDesc.xml',
      path: 'modDesc.xml',
      lang: 'xml',
      content: modDescXml,
      icon: FileCode,
      desc: 'FS25 mod descriptor: descVersion 94, actions (LAZYMOUSE_HOLD, LAZYMOUSE_INCREASE_RADIUS, LAZYMOUSE_DECREASE_RADIUS), and l10n strings.',
    },
    {
      id: 'readme',
      name: 'INSTALLATION.md',
      path: 'INSTALLATION.md',
      lang: 'markdown',
      content: installationReadmeText,
      icon: FileText,
      desc: 'Production documentation, architectural decisions, and mod folder setup instructions.',
    },
  ];

  const currentFile = files.find((f) => f.id === activeFile) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = currentFile.content.split('\n').length;
  const byteCount = new Blob([currentFile.content]).size;

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            FS25 Mod Source Code &amp; XML Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review the production GIANTS Engine 10 Lua scripts and mod descriptor for <span className="text-amber-400 font-mono">FS25_LazyMouseTerrainPainter</span>.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Copy File Contents</span>
            </>
          )}
        </button>
      </div>

      {/* File Tab Selector */}
      <div className="flex flex-wrap gap-2">
        {files.map((file) => {
          const isActive = file.id === activeFile;
          const Icon = file.icon;
          return (
            <button
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="font-semibold">{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* File Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-medium">{currentFile.desc}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 text-slate-500">
          <span>Path: {currentFile.path}</span>
          <span>·</span>
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{(byteCount / 1024).toFixed(1)} KB</span>
        </div>
      </div>

      {/* Code Display Frame */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs">
          <span className="font-mono text-slate-300 font-semibold">{currentFile.path}</span>
          <span className="font-mono text-slate-500 uppercase">{currentFile.lang}</span>
        </div>
        <pre className="overflow-x-auto p-5 text-xs font-mono leading-relaxed text-slate-300 max-h-[600px] select-text">
          <code>{currentFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
