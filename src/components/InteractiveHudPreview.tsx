/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ModSettings, Vector2D } from '../types/mod.ts';
import { RotateCcw, Key, MousePointer2, Sliders, Sparkles } from 'lucide-react';

interface InteractiveHudPreviewProps {
  settings: ModSettings;
  updateSettings: (newSettings: Partial<ModSettings>) => void;
}

export const InteractiveHudPreview: React.FC<InteractiveHudPreviewProps> = ({
  settings,
  updateSettings,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stabilizer active state (Push-to-Talk via Left Alt)
  const [isAltHeld, setIsAltHeld] = useState<boolean>(false);
  const [brushRadius, setBrushRadius] = useState<number>(24);
  const [viewportDims, setViewportDims] = useState<{ width: number; height: number; dpr: number }>({
    width: 800,
    height: 480,
    dpr: 1,
  });

  // Physics positions (in internal canvas buffer coordinate space)
  const cursorRef = useRef<Vector2D>({ x: 400, y: 240 });
  const anchorRef = useRef<Vector2D>({ x: 400, y: 240 });
  const isMouseDownRef = useRef<boolean>(false);
  const strokePathRef = useRef<Vector2D[]>([]);

  // Dynamic Buffer Resizing with ResizeObserver & devicePixelRatio support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.max(1, Math.round(rect.width * dpr));
      const targetHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        const wasZero = canvas.width === 0 || canvas.height === 0;
        const prevWidth = canvas.width || targetWidth;
        const prevHeight = canvas.height || targetHeight;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        if (wasZero) {
          cursorRef.current = { x: targetWidth / 2, y: targetHeight / 2 };
          anchorRef.current = { x: targetWidth / 2, y: targetHeight / 2 };
        } else {
          // Scale positions proportionately to avoid jumps during window resize
          const scaleW = targetWidth / prevWidth;
          const scaleH = targetHeight / prevHeight;
          cursorRef.current = {
            x: cursorRef.current.x * scaleW,
            y: cursorRef.current.y * scaleH,
          };
          anchorRef.current = {
            x: anchorRef.current.x * scaleW,
            y: anchorRef.current.y * scaleH,
          };
        }

        setViewportDims({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          dpr,
        });
      }
    };

    updateCanvasDimensions();

    const observer = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    observer.observe(canvas);
    window.addEventListener('resize', updateCanvasDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  // Key listeners for Push-to-Talk Left Alt and Radius adjustments [ and ]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault();
        setIsAltHeld(true);
      } else if (e.key === ']' || e.code === 'BracketRight') {
        e.preventDefault();
        updateSettings({
          tetherRadius: Math.min(settings.maxRadius, Number((settings.tetherRadius + settings.radiusStep).toFixed(3))),
        });
      } else if (e.key === '[' || e.code === 'BracketLeft') {
        e.preventDefault();
        updateSettings({
          tetherRadius: Math.max(settings.minRadius, Number((settings.tetherRadius - settings.radiusStep).toFixed(3))),
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault();
        setIsAltHeld(false);
        // Instant re-centering onto cursor when Alt is released
        anchorRef.current = { ...cursorRef.current };
      }
    };

    const handleBlur = () => {
      setIsAltHeld(false);
      anchorRef.current = { ...cursorRef.current };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [settings.tetherRadius, settings.minRadius, settings.maxRadius, settings.radiusStep, updateSettings]);

  // Main canvas animation render loop (renders true 1:1 circular geometry)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const cursor = cursorRef.current;
      const anchor = anchorRef.current;

      // Tether physics calculation (Isotropic screen-space tether)
      if (isAltHeld) {
        const aspectRatio = width / height;
        const normCursorX = cursor.x / width;
        const normCursorY = cursor.y / height;
        const normAnchorX = anchor.x / width;
        const normAnchorY = anchor.y / height;

        const deltaX = (normCursorX - normAnchorX) * aspectRatio;
        const deltaY = normCursorY - normAnchorY;
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (dist > settings.tetherRadius) {
          const unitX = deltaX / dist;
          const unitY = deltaY / dist;
          const newNormAnchorX = normCursorX - (unitX * settings.tetherRadius) / aspectRatio;
          const newNormAnchorY = normCursorY - (unitY * settings.tetherRadius);

          anchorRef.current = {
            x: newNormAnchorX * width,
            y: newNormAnchorY * height,
          };
        }
      } else {
        // Immediate snap to cursor when inactive
        anchorRef.current = { ...cursor };
      }

      // Record drawing trail when mouse button is down
      if (isMouseDownRef.current) {
        strokePathRef.current.push({ ...anchorRef.current });
        if (strokePathRef.current.length > 500) strokePathRef.current.shift();
      }

      // 1. Clear Canvas with deep slate backdrop
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle 3D terrain grid mesh
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1 * dpr;
      const gridSize = 40 * dpr;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Subtle topography contour isolines (true concentric circles)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1.5 * dpr;
      const maxRadius = Math.max(width, height);
      for (let r = 80 * dpr; r < maxRadius; r += 70 * dpr) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Render Stabilized Stroke Path (Amber)
      if (strokePathRef.current.length > 1) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = Math.max(3 * dpr, brushRadius * 0.3 * dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(strokePathRef.current[0].x, strokePathRef.current[0].y);
        for (let i = 1; i < strokePathRef.current.length; i++) {
          ctx.lineTo(strokePathRef.current[i].x, strokePathRef.current[i].y);
        }
        ctx.stroke();
      }

      // 4. Tether line (Amber Dashed) when Alt is held
      if (isAltHeld) {
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 2.5 * dpr;
        ctx.setLineDash([6 * dpr, 4 * dpr]);
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Trailing Anchor / Brush Reticle (Amber, 1:1 true circle)
      const currentAnchor = anchorRef.current;
      const scaledBrushRadius = brushRadius * dpr;

      ctx.strokeStyle = isAltHeld ? '#f59e0b' : '#64748b';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(currentAnchor.x, currentAnchor.y, scaledBrushRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Brush inner fill
      ctx.fillStyle = isAltHeld ? 'rgba(245, 158, 11, 0.12)' : 'rgba(100, 116, 139, 0.08)';
      ctx.beginPath();
      ctx.arc(currentAnchor.x, currentAnchor.y, scaledBrushRadius, 0, Math.PI * 2);
      ctx.fill();

      // True perpendicular crosshairs
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(currentAnchor.x - scaledBrushRadius - 6 * dpr, currentAnchor.y);
      ctx.lineTo(currentAnchor.x + scaledBrushRadius + 6 * dpr, currentAnchor.y);
      ctx.moveTo(currentAnchor.x, currentAnchor.y - scaledBrushRadius - 6 * dpr);
      ctx.lineTo(currentAnchor.x, currentAnchor.y + scaledBrushRadius + 6 * dpr);
      ctx.stroke();

      // Trailing anchor center pip (Amber, 1:1 true circle)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(currentAnchor.x, currentAnchor.y, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // 6. Lead Cursor Pip (Cyan, 1:1 true circle) following hardware mouse
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 8 * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 3 * dpr, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isAltHeld, settings.tetherRadius, brushRadius]);

  // Measure mouse event coordinates relative to bounding rect and buffer scale
  const getCanvasCoords = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Vector2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    cursorRef.current = getCanvasCoords(e);
  }, [getCanvasCoords]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    cursorRef.current = getCanvasCoords(e);
    isMouseDownRef.current = true;
  }, [getCanvasCoords]);

  const handlePointerUp = useCallback(() => {
    isMouseDownRef.current = false;
  }, []);

  const clearStrokes = () => {
    strokePathRef.current = [];
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Push-to-Talk status */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Interactive In-Game HUD Simulator</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              FS25 Ready
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Move your cursor inside the canvas below. Hold <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-xs border border-slate-700">Left Alt</kbd> to activate the tether and click &amp; drag to draw smooth landscaping curves with perfect 1:1 circular geometry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Mouse / Touch button to hold Left Alt */}
          <button
            onMouseDown={() => setIsAltHeld(true)}
            onMouseUp={() => {
              setIsAltHeld(false);
              anchorRef.current = { ...cursorRef.current };
            }}
            onMouseLeave={() => {
              setIsAltHeld(false);
              anchorRef.current = { ...cursorRef.current };
            }}
            onTouchStart={() => setIsAltHeld(true)}
            onTouchEnd={() => {
              setIsAltHeld(false);
              anchorRef.current = { ...cursorRef.current };
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold select-none cursor-pointer transition-all ${
              isAltHeld
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-95'
                : 'bg-amber-600/90 text-white hover:bg-amber-500'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>{isAltHeld ? 'HOLDING ALT (STABILISING)' : 'HOLD [Left Alt] (Click & Hold)'}</span>
          </button>

          <button
            onClick={clearStrokes}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Clear stroke trail"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Clear Trail</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl h-[480px] w-full"
      >
        {/* Native-style F1 Help Box in Top-Right Corner */}
        <div className="absolute top-4 right-4 z-20 w-72 rounded-xl border border-slate-800/90 bg-slate-950/92 p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 pointer-events-none select-none">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${isAltHeld ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
              F1 HELP
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              LANDSCAPING
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {isAltHeld ? (
              <>
                <div className="flex items-center justify-between font-semibold text-amber-400">
                  <span>Lazy Mouse:</span>
                  <span className="font-mono bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-800/60">
                    ACTIVE
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tether Length:</span>
                  <span className="font-mono text-amber-300">
                    {(settings.tetherRadius * 100).toFixed(1)} <span className="text-[10px] text-slate-500">[ [ / ] ]</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-300 font-medium">
                LazyMouse: <span className="text-amber-400">Hold [Left Alt] to Stabilise</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Responsive Canvas Viewport */}
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none select-none block"
        />

        {/* Bottom Status Telemetry Line */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-between border-t border-slate-800 bg-slate-950/90 px-4 py-2 text-[11px] font-mono select-none">
          <div className="flex items-center gap-3">
            <span className={isAltHeld ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
              {isAltHeld ? '● TETHER ACTIVE (Hold Alt)' : '○ RAW MOUSE (1:1 Cursor)'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              Radius: {(settings.tetherRadius * 100).toFixed(1)} ({settings.tetherRadius.toFixed(3)})
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Viewport: {viewportDims.width}×{viewportDims.height} ({viewportDims.dpr}x DPI)</span>
            <span>·</span>
            <span>Geometry: 1:1 Circular</span>
          </div>
        </div>
      </div>

      {/* 3-Step Usage Guidance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Key className="h-4 w-4" />
            <span>1. Hold Left Alt</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hold key to stabilise strokes; release to return to raw mouse control. Releasing Alt instantly re-centres the anchor onto your pointer.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <MousePointer2 className="h-4 w-4" />
            <span>2. Lead &amp; Follow</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Move the cyan lead cursor; the amber brush follows on an elastic tether to eliminate jitter, tremors, and sudden angle snaps.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Sliders className="h-4 w-4" />
            <span>3. Adjust Length</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">[</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">]</kbd> on the fly to tighten or lengthen the leash in steps of 0.005.
          </p>
        </div>
      </div>

      {/* Quick Fine-Tuning Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        {/* Tether Radius Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-200">Tether Radius</span>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {(settings.tetherRadius * 100).toFixed(1)} ({settings.tetherRadius.toFixed(3)})
            </span>
          </div>
          <input
            type="range"
            min={settings.minRadius}
            max={settings.maxRadius}
            step={settings.radiusStep}
            value={settings.tetherRadius}
            onChange={(e) => updateSettings({ tetherRadius: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Min: {(settings.minRadius * 100).toFixed(1)}</span>
            <span>Press [ or ] to adjust</span>
            <span>Max: {(settings.maxRadius * 100).toFixed(1)}</span>
          </div>
        </div>

        {/* Brush Radius Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-200">Brush Reticle Size</span>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {brushRadius}px (1:1 circular)
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={64}
            value={brushRadius}
            onChange={(e) => setBrushRadius(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Small (12px)</span>
            <span>Medium (24px)</span>
            <span>Large (64px)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
