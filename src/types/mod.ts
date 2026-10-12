/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurveMode = 'elastic' | 'fixed' | 'inertia';

export interface ModSettings {
  modName: string;
  modTitle: string;
  enabledByDefault: boolean;
  activationMode: 'hold' | 'toggle';
  defaultKeybind: string;
  defaultKeybindFSKey: string;
  incKeybind: string;
  decKeybind: string;
  tetherRadius: number; // 0.06 (screen percentage radius in GIANTS engine)
  minRadius: number; // 0.01
  maxRadius: number; // 0.25
  radiusStep: number; // 0.005
  stringLengthMeters: number;
  curveMode: CurveMode;
  elasticStiffness: number; // 0.1 to 1.0
  inertiaDamping: number; // 0.05 to 0.5
  leashColor: string; // hex (GIANTS safety amber: #F3A626)
  showHudOverlay: boolean;
  hudPosition: 'top_right' | 'top_left' | 'bottom_left';
  enableSoundFeedback: boolean;
  multiplayerSync: boolean;
  leftMenuThreshold: number; // normalized screen width, e.g. 0.38
  bottomMenuThreshold: number; // normalized screen height, e.g. 0.16
  descVersion: string;
  modVersion: string;
  author: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface BrushState {
  mode: 'sculpt' | 'level' | 'smooth' | 'paint';
  size: number;
  strength: number;
  targetHeight: number;
  paintMaterial: 'dirt' | 'grass' | 'gravel' | 'asphalt';
}
