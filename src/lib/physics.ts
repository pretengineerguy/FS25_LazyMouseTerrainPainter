/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CurveMode, Vector2D } from '../types/mod.ts';

export interface PhysicsStepParams {
  mouse: Vector2D;
  brush: Vector2D;
  velocity: Vector2D;
  stringLength: number; // in pixels
  mode: CurveMode;
  stiffness: number; // 0.1 to 1.0
  damping: number; // 0.05 to 0.5
}

export interface PhysicsStepResult {
  newBrush: Vector2D;
  newVelocity: Vector2D;
  distance: number;
  tension: number; // 0 to 1
  isPulling: boolean;
}

export function calculateLazyMouseStep(params: PhysicsStepParams): PhysicsStepResult {
  const { mouse, brush, velocity, stringLength, mode, stiffness, damping } = params;

  const dx = mouse.x - brush.x;
  const dy = mouse.y - brush.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let newBrushX = brush.x;
  let newBrushY = brush.y;
  let newVx = velocity.x;
  let newVy = velocity.y;
  let tension = 0;
  let isPulling = false;

  if (mode === 'fixed') {
    // Fixed string (classic deadzone leash):
    // Brush remains stationary until distance exceeds string length, then gets pulled taut
    if (dist > stringLength && dist > 0.0001) {
      isPulling = true;
      const angle = Math.atan2(dy, dx);
      newBrushX = mouse.x - Math.cos(angle) * stringLength;
      newBrushY = mouse.y - Math.sin(angle) * stringLength;
      tension = Math.min(1, (dist - stringLength) / (stringLength * 0.5 || 1));
    } else {
      tension = dist / (stringLength || 1);
    }
  } else if (mode === 'elastic') {
    // Elastic leash (spring model):
    // When distance exceeds stringLength, elastic restoring force pulls the brush towards mouse
    if (dist > stringLength && dist > 0.0001) {
      isPulling = true;
      const excess = dist - stringLength;
      const normX = dx / dist;
      const normY = dy / dist;

      // Spring pull factor proportional to excess distance and stiffness
      const stepFactor = Math.min(1, excess * stiffness * 0.15);
      newBrushX = brush.x + normX * stepFactor * excess;
      newBrushY = brush.y + normY * stepFactor * excess;
      tension = Math.min(1, excess / (stringLength * 1.5 || 1));
    } else {
      tension = (dist / (stringLength || 1)) * 0.5;
    }
  } else if (mode === 'inertia') {
    // Inertia damping (momentum / velocity exponential moving average)
    isPulling = dist > 2;
    const targetVx = dx * damping;
    const targetVy = dy * damping;

    newVx = velocity.x * 0.7 + targetVx * 0.3;
    newVy = velocity.y * 0.7 + targetVy * 0.3;

    newBrushX = brush.x + newVx;
    newBrushY = brush.y + newVy;
    tension = Math.min(1, dist / (stringLength * 2 || 1));
  }

  return {
    newBrush: { x: newBrushX, y: newBrushY },
    newVelocity: { x: newVx, y: newVy },
    distance: dist,
    tension,
    isPulling,
  };
}
