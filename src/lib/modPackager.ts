/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import modDescXml from '../../FS25_LazyMouseTerrainPainter/modDesc.xml?raw';
import luaScript from '../../FS25_LazyMouseTerrainPainter/scripts/LazyMouseTerrainPainter.lua?raw';
import iconDdsUrl from "../../FS25_LazyMouseTerrainPainter/icon_LazyMouseTerrainPainter.dds?url";
export { modDescXml, luaScript };

export const installationReadmeText = `========================================================================
FARMING SIMULATOR 25 MOD: LAZY MOUSE TERRAIN PAINTER (FS25_LazyMouseTerrainPainter)
Production Release v1.0.0.0
Author: Pretengineer
Engine Target: GIANTS Engine 10 / Farming Simulator 25 (Patch 1.24+)
========================================================================

ABOUT
------------------------------------------------------------------------
Lazy Mouse Terrain Painter introduces a precision stroke-stabilization
tether to Farming Simulator 25's Construction screen Landscaping modes.

Eliminates hand tremor, sudden angle snaps, and micro-stutters when
sculpting hills, creating level plateaus, smoothing slopes, or painting
ground textures.

KEY ARCHITECTURAL HIGHLIGHTS
------------------------------------------------------------------------
1. Decoupled 2D Anchor Paradigm:
   Intercepts ConstructionScreen.mouseEvent. While Left Alt is held,
   smoothed 2D anchor coordinates are fed to the brush projector,
   allowing GIANTS' native 3D raycast to determine terrain height.

2. Edge Autoscroll Restoration:
   Physical hardware cursor coordinates (posX, posY) are routed directly
   to screenSelf.camera/topDownCamera, preserving full screen-edge
   autoscrolling while keeping the brush tethered.

3. Tab & Menu Filtering:
   Evaluates active mode (TAB_LANDSCAPING / Index 5). While browsing
   Placeables, Sheds, Animals, or Productions, all hooks and HUD entries
   remain completely dormant.

CONTROLS & KEYBINDINGS
------------------------------------------------------------------------
- Hold [Left Alt]: Stabilize stroke (Momentary Hold)
- Press [ ] ]: Increase tether radius (+0.005)
- Press [ [ ]: Decrease tether radius (-0.005)

INSTALLATION
------------------------------------------------------------------------
1. Copy 'FS25_LazyMouseTerrainPainter.zip' to your Farming Simulator 25 mods folder:
   - Windows: Documents\\My Games\\FarmingSimulator2025\\mods\\
   - macOS: ~/Library/Application Support/FarmingSimulator2025/mods/
2. Start Farming Simulator 25.
3. In the Career / Multiplayer Savegame setup screen, check the box next
   to "Lazy Mouse Terrain Painter" to activate the mod.
4. Press Shift + P to open the Construction screen, select Landscaping,
   and hold Left Alt while painting or sculpting.

MULTIPLAYER COMPATIBILITY
------------------------------------------------------------------------
Full client-side simulation. Compatible with dedicated servers and
crossplay multiplayer sessions.
`;

/**
 * Packages the pre-existing files in FS25_LazyMouseTerrainPainter/ directly
 * into an authentic mod archive without generating synthetic dummy files.
 */
export async function buildProductionModZip(): Promise<Blob> {
  const zip = new JSZip();

  // 1. modDesc.xml (verbatim from FS25_LazyMouseTerrainPainter/modDesc.xml)
  zip.file('modDesc.xml', modDescXml);

  // 2. scripts/LazyMouseTerrainPainter.lua (verbatim from FS25_LazyMouseTerrainPainter/scripts/LazyMouseTerrainPainter.lua)
  zip.file('scripts/LazyMouseTerrainPainter.lua', luaScript);

  // 3. icon.dds (verbatim binary from FS25_LazyMouseTerrainPainter/icon.dds)
  try {
    const res = await fetch(iconDdsUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch icon.dds: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    zip.file('icon.dds', arrayBuffer);
  } catch (err) {
    console.error('Failed to bundle icon.dds asset:', err);
  }

  // 4. Documentation
  zip.file('README.txt', installationReadmeText);
  zip.file('INSTALLATION.md', installationReadmeText);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
