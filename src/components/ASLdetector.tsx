"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";

interface Landmark { x: number; y: number; z: number; }

const WRIST = 0;
const THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_TIP = 8;
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_TIP = 12;
const RING_MCP = 13, RING_PIP = 14, RING_TIP = 16;
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_TIP = 20;

const dist = (a: Landmark, b: Landmark) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
const handSize = (lm: Landmark[]) => dist(lm[WRIST], lm[MIDDLE_MCP]) || 1;
const nd = (a: Landmark, b: Landmark, lm: Landmark[]) => dist(a, b) / handSize(lm);
const dist3D = (a: Landmark, b: Landmark) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
const nd3D = (a: Landmark, b: Landmark, lm: Landmark[]) => dist3D(a, b) / handSize(lm);

// Strict helpers kept for the two-hand HELP classifier (no occlusion relaxation needed)
const up   = (tip: Landmark, pip: Landmark, mcp: Landmark) =>
  tip.y < pip.y - 0.01 && pip.y < mcp.y + 0.02;
const down = (tip: Landmark, pip: Landmark) => tip.y > pip.y - 0.03;

// ── Occlusion-aware finger state ──────────────────────────────────────────────
//
// 'up'  — finger is clearly extended
// 'down'— finger is clearly folded
// 'mid' — finger is curled but tracked (intentional intermediate, e.g. C-shape)
// 'occ' — tip or PIP landmark is near the frame edge → tracking is unreliable
//
// 'occ' participates in relaxed pattern matching: it satisfies either 'up' or
// 'down' without counting against the match.  'mid' is intentional geometry and
// does NOT satisfy strict up/down requirements.

const EDGE_MARGIN = 0.05;
const isNearEdge = (p: Landmark) =>
  p.x < EDGE_MARGIN || p.x > 1 - EDGE_MARGIN ||
  p.y < EDGE_MARGIN || p.y > 1 - EDGE_MARGIN;

type FState = 'up' | 'down' | 'mid' | 'occ';

function fingerState(tip: Landmark, pip: Landmark, mcp: Landmark): FState {
  if (isNearEdge(tip) || isNearEdge(pip)) return 'occ';
  if (tip.y < pip.y - 0.01 && pip.y < mcp.y + 0.02) return 'up';
  if (tip.y > pip.y - 0.03) return 'down';
  return 'mid';
}

// Relaxed match: 'occ' satisfies any required direction.
const req = (s: FState, r: 'up' | 'down') => s === r || s === 'occ';

// ── Recognition helpers ───────────────────────────────────────────────────────

// True when hand is inverted: wrist is visually above the middle MCP (fingers point down).
// Used to detect P and Q, which are signed with the hand rotated downward.
function isHandInverted(lm: Landmark[]): boolean {
  return lm[WRIST].y < lm[MIDDLE_MCP].y - 0.04;
}

// Count how many of index/middle/ring MCPs are visually above the thumb tip.
// In image coords, "above" means smaller y. When thumb is tucked under N fingers,
// N MCP joints will have smaller y (higher position) than the thumb tip.
// M = 3 fingers over thumb; N = 2 fingers over thumb.
function fingersOverThumb(lm: Landmark[]): number {
  return [lm[INDEX_MCP], lm[MIDDLE_MCP], lm[RING_MCP]]
    .filter(mcp => mcp.y < lm[THUMB_TIP].y + 0.01).length;
}

// ── Two-hand HELP/SOS (unchanged) ────────────────────────────────────────────
function classifyHelp(lm0: Landmark[], lm1: Landmark[]): { detected: boolean; score: number } {
  const isFlat = (lm: Landmark[]) =>
    up(lm[INDEX_TIP], lm[INDEX_PIP], lm[INDEX_MCP]) &&
    up(lm[MIDDLE_TIP], lm[MIDDLE_PIP], lm[MIDDLE_MCP]) &&
    up(lm[RING_TIP], lm[RING_PIP], lm[RING_MCP]) &&
    up(lm[PINKY_TIP], lm[PINKY_PIP], lm[PINKY_MCP]);

  const isFist = (lm: Landmark[]) =>
    down(lm[INDEX_TIP], lm[INDEX_PIP]) &&
    down(lm[MIDDLE_TIP], lm[MIDDLE_PIP]) &&
    down(lm[RING_TIP], lm[RING_PIP]) &&
    down(lm[PINKY_TIP], lm[PINKY_PIP]);

  const h0flat = isFlat(lm0), h0fist = isFist(lm0);
  const h1flat = isFlat(lm1), h1fist = isFist(lm1);

  if (!((h0flat && h1fist) || (h1flat && h0fist))) return { detected: false, score: 0 };

  const flatLm = h0flat ? lm0 : lm1;
  const fistLm = h0fist ? lm0 : lm1;
  const refSize = (handSize(lm0) + handSize(lm1)) / 2;

  const palmMid: Landmark = {
    x: (flatLm[INDEX_MCP].x + flatLm[PINKY_MCP].x) / 2,
    y: (flatLm[INDEX_MCP].y + flatLm[PINKY_MCP].y) / 2,
    z: 0,
  };
  const proximity = dist(fistLm[WRIST], palmMid) / refSize;
  if (proximity > 1.2) return { detected: false, score: 0 };
  if (fistLm[WRIST].y > flatLm[WRIST].y + 0.15) return { detected: false, score: 0 };

  return { detected: true, score: Math.max(Math.round(92 - proximity * 14), 75) };
}

// ── Single-hand ASL classifier ────────────────────────────────────────────────
//
// Returns { letter, score, occCount }.
// occCount is the number of fingers whose state was 'occ' (edge-occluded).
// score is pre-penalised (8 pts per occluded finger); if it falls below
// MIN_SCORE the function returns '?' so the caller never sees a low-confidence
// letter.

const MIN_SCORE           = 58;
const OCC_PENALTY_FINGER  = 8;   // deducted per occluded finger

function classify(lm: Landmark[]): { letter: string; score: number; occCount: number } {
  // Core palm anchors must be on-screen; if not, skip entirely
  if (isNearEdge(lm[WRIST]) || isNearEdge(lm[MIDDLE_MCP])) {
    return { letter: '?', score: 0, occCount: 4 };
  }

  const iS = fingerState(lm[INDEX_TIP],  lm[INDEX_PIP],  lm[INDEX_MCP]);
  const mS = fingerState(lm[MIDDLE_TIP], lm[MIDDLE_PIP], lm[MIDDLE_MCP]);
  const rS = fingerState(lm[RING_TIP],   lm[RING_PIP],   lm[RING_MCP]);
  const pS = fingerState(lm[PINKY_TIP],  lm[PINKY_PIP],  lm[PINKY_MCP]);

  const occCount = [iS, mS, rS, pS].filter(s => s === 'occ').length;

  // Refuse to classify if more than half the non-thumb fingers are hidden
  if (occCount > 2) return { letter: '?', score: 0, occCount };

  const penalty = occCount * OCC_PENALTY_FINGER;

  // Helper: apply penalty; return 0 (→ no match) if result falls below threshold
  const sc = (base: number) => {
    const v = base - penalty;
    return v >= MIN_SCORE ? v : 0;
  };

  const thumbSide = Math.abs(lm[THUMB_TIP].x - lm[THUMB_MCP].x) > 0.06;
  const thumbUp2  = lm[THUMB_TIP].y < lm[THUMB_IP].y - 0.02;
  const tiClose   = nd(lm[THUMB_TIP], lm[INDEX_TIP],  lm) < 0.13;
  const imSpread  = nd(lm[INDEX_TIP], lm[MIDDLE_TIP], lm) > 0.11;

  // True when the hand is rotated so fingers point down (needed for P and Q)
  const handInverted = isHandInverted(lm);

  let s: number;

  // ── A: fist, thumb extends sideways (not upward) ──────────────────────────
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down') && thumbSide && !thumbUp2) {
    s = sc(92); if (s) return { letter: 'A', score: s, occCount };
  }

  // ── B: all four fingers up, thumb tucked across palm ─────────────────────
  if (req(iS,'up') && req(mS,'up') && req(rS,'up') && req(pS,'up') && !thumbSide) {
    s = sc(90); if (s) return { letter: 'B', score: s, occCount };
  }

  // ── C: all 4 fingers in 'mid' (open curved curl) ──────────────────────────
  // Gap between thumb and index tips > 0.13 separates C from O (which pinches).
  // 'occ' does NOT match 'mid', so all four must be genuinely tracked.
  if (iS === 'mid' && mS === 'mid' && rS === 'mid' && pS === 'mid') {
    const cGap = nd(lm[THUMB_TIP], lm[INDEX_TIP], lm);
    if (cGap > 0.13) {
      s = sc(78); if (s) return { letter: 'C', score: s, occCount };
    }
  }

  // ── D: index up, middle/ring/pinky down, thumb curves back to middle/ring ─
  // The thumb forms the rounded back of the D; !thumbSide keeps G/L from firing.
  if (req(iS,'up') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const thumbCurvesBack = nd(lm[THUMB_TIP], lm[MIDDLE_TIP], lm) < 0.16 ||
                            nd(lm[THUMB_TIP], lm[RING_TIP],   lm) < 0.16;
    if (thumbCurvesBack) {
      s = sc(87); if (s) return { letter: 'D', score: s, occCount };
    }
  }

  // ── Z: index up, others down, thumb NOT near middle (static approx.) ──────
  // Z is a motion letter; this catches the static pointing hold position.
  // Placed after D so D fires first when the thumb IS curving to the middle.
  if (req(iS,'up') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const noThumbCurve = nd(lm[THUMB_TIP], lm[MIDDLE_TIP], lm) > 0.18 &&
                         nd(lm[THUMB_TIP], lm[RING_TIP],   lm) > 0.18;
    if (noThumbCurve) {
      s = sc(65); if (s) return { letter: 'Z', score: s, occCount };
    }
  }

  // ── E: flat fist, thumb tucked fully under all fingers ────────────────────
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide && lm[THUMB_TIP].y > lm[INDEX_MCP].y) {
    s = sc(84); if (s) return { letter: 'E', score: s, occCount };
  }

  // ── F: thumb+index pinch, three fingers up ────────────────────────────────
  if (tiClose && iS !== 'up' && req(mS,'up') && req(rS,'up') && req(pS,'up')) {
    s = sc(87); if (s) return { letter: 'F', score: s, occCount };
  }

  // ── G: index points sideways, thumb at same height ────────────────────────
  if (req(iS,'up') && mS !== 'up' && rS !== 'up' && pS !== 'up' && thumbSide && Math.abs(lm[INDEX_TIP].y - lm[THUMB_TIP].y) < 0.09) {
    s = sc(79); if (s) return { letter: 'G', score: s, occCount };
  }

  // ── H: index+middle extended horizontally (sideways), ring/pinky down ─────
  // Distinguish from U: horizontal spread of index exceeds its vertical rise.
  // Allows 'mid' for fingers that point sideways (y-only state may return 'mid').
  if ((iS === 'up' || iS === 'mid') && (mS === 'up' || mS === 'mid') &&
      rS !== 'up' && pS !== 'up' && !thumbSide) {
    const indexDx  = Math.abs(lm[INDEX_TIP].x - lm[INDEX_MCP].x);
    const indexDy  = lm[INDEX_MCP].y - lm[INDEX_TIP].y; // positive = tip above MCP
    const isHoriz  = indexDx > indexDy * 0.7;            // more sideways than upward
    const tipClose = nd(lm[INDEX_TIP], lm[MIDDLE_TIP], lm) < 0.13;
    if (isHoriz && tipClose) {
      s = sc(81); if (s) return { letter: 'H', score: s, occCount };
    }
  }

  // ── J: pinky up and angled outward (hook position), others down ───────────
  // J is a motion letter; this approximates the static end-of-stroke hook.
  // If the pinky points mostly upward rather than sideways → I fires instead.
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'up') && !thumbSide) {
    const pinkyDx     = Math.abs(lm[PINKY_TIP].x - lm[PINKY_MCP].x);
    const pinkyDy     = lm[PINKY_MCP].y - lm[PINKY_TIP].y; // positive = tip above MCP
    const pinkyAngled = pinkyDx > pinkyDy * 0.55;           // more sideways than upward
    if (pinkyAngled) {
      s = sc(68); if (s) return { letter: 'J', score: s, occCount };
    }
  }

  // ── I: pinky straight up, other three down, no thumb extension ───────────
  // !thumbSide guards against Y (pinky up + thumbSide).
  // Comes after J so angled-pinky cases route to J first.
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'up') && !thumbSide) {
    s = sc(91); if (s) return { letter: 'I', score: s, occCount };
  }

  // ── K: index+middle up, thumb pointing up between them ───────────────────
  if (req(iS,'up') && req(mS,'up') && rS !== 'up' && pS !== 'up' && thumbSide && lm[THUMB_TIP].y < lm[INDEX_MCP].y) {
    s = sc(77); if (s) return { letter: 'K', score: s, occCount };
  }

  // ── L: index up, thumb out and up (90° L-shape) ──────────────────────────
  if (req(iS,'up') && mS !== 'up' && rS !== 'up' && pS !== 'up' && thumbSide && thumbUp2) {
    s = sc(93); if (s) return { letter: 'L', score: s, occCount };
  }

  // ── M: fist, thumb tucked under 3 fingers (index, middle, ring) ───────────
  // fingersOverThumb >= 3: all three MCPs sit above the thumb tip in the frame,
  // confirming the thumb is tucked deeply under three fingers.
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const fot = fingersOverThumb(lm);
    if (fot >= 3 && lm[THUMB_TIP].y > lm[WRIST].y + 0.08) {
      s = sc(80); if (s) return { letter: 'M', score: s, occCount };
    }
  }

  // ── N: fist, thumb tucked under 2 fingers (index, middle) ─────────────────
  // fingersOverThumb === 2: only index and middle MCPs are above the thumb tip.
  // Placed after M so the 3-finger case wins when the thumb goes deeper.
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const fot = fingersOverThumb(lm);
    if (fot === 2 && lm[THUMB_TIP].y > lm[WRIST].y + 0.05) {
      s = sc(78); if (s) return { letter: 'N', score: s, occCount };
    }
  }

  // ── O: fingers tightly curled into a circle, thumb pinches index tip ──────
  // Tighter than C: adjacent tips very close, all fingers curved (none 'up').
  // tiClose confirms the thumb-to-index pinch that seals the O shape.
  if (tiClose && iS !== 'up' && mS !== 'up' && rS !== 'up' && pS !== 'up') {
    const adjacentClose = nd(lm[INDEX_TIP],  lm[MIDDLE_TIP], lm) < 0.10 &&
                          nd(lm[MIDDLE_TIP], lm[RING_TIP],   lm) < 0.12;
    if (adjacentClose) {
      s = sc(86); if (s) return { letter: 'O', score: s, occCount };
    }
  }

  // ── P: hand inverted, index+middle point downward, thumb extends sideways ─
  // Wrist is above middle MCP (inverted hold); index and middle tips fall below
  // their own PIP joints (gravity direction for a downward-pointing hand).
  if (handInverted && thumbSide) {
    const indexDown  = lm[INDEX_TIP].y  > lm[INDEX_PIP].y  + 0.01;
    const middleDown = lm[MIDDLE_TIP].y > lm[MIDDLE_PIP].y + 0.01;
    if (indexDown && middleDown) {
      s = sc(79); if (s) return { letter: 'P', score: s, occCount };
    }
  }

  // ── Q: hand inverted, index+thumb both point down, tips close (Q loop) ────
  // Similar to G but rotated downward; !thumbSide distinguishes it from P.
  if (handInverted && !thumbSide) {
    const indexDown = lm[INDEX_TIP].y > lm[INDEX_PIP].y + 0.01;
    const thumbDown = lm[THUMB_TIP].y > lm[THUMB_IP].y  + 0.01;
    const qtClose   = nd(lm[THUMB_TIP], lm[INDEX_TIP], lm) < 0.22;
    if (indexDown && thumbDown && qtClose && mS !== 'up') {
      s = sc(76); if (s) return { letter: 'Q', score: s, occCount };
    }
  }

  // ── R: index+middle crossed, tips very close (< 0.05) ────────────────────
  // Requires near-overlap to confirm the cross; V spreads tips apart (> 0.11).
  if (req(iS,'up') && req(mS,'up') && rS !== 'up' && pS !== 'up' && !thumbSide) {
    if (nd(lm[INDEX_TIP], lm[MIDDLE_TIP], lm) < 0.05) {
      s = sc(81); if (s) return { letter: 'R', score: s, occCount };
    }
  }

  // ── T: fist, thumb inserted between index and middle, tip peeking forward ─
  // Thumb tip sits at the MCP/PIP level (below index PIP, above wrist).
  // Checked before S so this tighter spatial constraint wins over the looser one.
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const thumbAtKnuckle = lm[THUMB_TIP].y < lm[INDEX_PIP].y + 0.02 &&
                           lm[THUMB_TIP].y > lm[INDEX_MCP].y - 0.04 &&
                           nd(lm[THUMB_TIP], lm[INDEX_MCP], lm) < 0.20;
    if (thumbAtKnuckle) {
      s = sc(78); if (s) return { letter: 'T', score: s, occCount };
    }
  }

  // ── S: fist, thumb wrapped across the front of the folded fingers ─────────
  // Thumb is forward-facing (not sideways), covering the knuckle row.
  // notPinching ensures the thumb is across the fist rather than touching a tip.
  if (req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const thumbAcrossFront = lm[THUMB_TIP].y > lm[WRIST].y + 0.05 &&
                             lm[THUMB_TIP].y < lm[INDEX_PIP].y + 0.04;
    const notPinching = nd(lm[THUMB_TIP], lm[INDEX_TIP], lm) > 0.10;
    if (thumbAcrossFront && notPinching) {
      s = sc(82); if (s) return { letter: 'S', score: s, occCount };
    }
  }

  // ── U: index+middle up vertically together, ring/pinky down ──────────────
  // Vertical: tip rises significantly above MCP (larger dy than dx).
  // Distinguish from H: for U the vertical rise exceeds the horizontal spread.
  if (req(iS,'up') && req(mS,'up') && rS !== 'up' && pS !== 'up' && !thumbSide) {
    const indexDx    = Math.abs(lm[INDEX_TIP].x - lm[INDEX_MCP].x);
    const indexDy    = lm[INDEX_MCP].y - lm[INDEX_TIP].y; // positive = tip above MCP
    const isVertical = indexDy > indexDx * 0.6;
    const tipClose   = nd(lm[INDEX_TIP], lm[MIDDLE_TIP], lm) < 0.12;
    if (isVertical && tipClose) {
      s = sc(84); if (s) return { letter: 'U', score: s, occCount };
    }
  }

  // ── V: index+middle up, spread apart ─────────────────────────────────────
  if (req(iS,'up') && req(mS,'up') && rS !== 'up' && pS !== 'up' && !thumbSide && imSpread) {
    s = sc(89); if (s) return { letter: 'V', score: s, occCount };
  }

  // ── W: index+middle+ring up ───────────────────────────────────────────────
  if (req(iS,'up') && req(mS,'up') && req(rS,'up') && pS !== 'up' && !thumbSide) {
    s = sc(87); if (s) return { letter: 'W', score: s, occCount };
  }

  // ── X: index finger hooked (crooked), all other fingers folded ────────────
  // 'mid' = PIP raised but tip curls inward (the hook shape).
  // pipRaised + tipCurling confirm a real hook, not a loose transitional frame
  // from C or O that could also produce an index 'mid' state.
  if ((iS === 'mid' || iS === 'occ') && req(mS,'down') && req(rS,'down') && req(pS,'down') && !thumbSide) {
    const pipRaised  = lm[INDEX_PIP].y < lm[INDEX_MCP].y - 0.01; // PIP above MCP
    const tipCurling = lm[INDEX_TIP].y > lm[INDEX_PIP].y - 0.02; // tip not above PIP
    if (pipRaised && tipCurling) {
      s = sc(76); if (s) return { letter: 'X', score: s, occCount };
    }
  }

  // ── Y: thumb out sideways + pinky up, index/middle/ring down ─────────────
  // thumbSide is the key differentiator from I (pinky up, no thumb extension).
  if (thumbSide && req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'up')) {
    s = sc(91); if (s) return { letter: 'Y', score: s, occCount };
  }

  return { letter: '?', score: 0, occCount };
}

// ── Temporal smoothing constants ──────────────────────────────────────────────
const MAJORITY_BUFFER_SIZE          = 20;
const MAJORITY_THRESHOLD            = 0.55;  // for clean (non-occluded) detections
const OCCLUDED_MAJORITY_THRESHOLD   = 0.68;  // stricter when hand is partially hidden
const MIN_BUFFER_FRAMES             = 6;     // frames needed before emitting a letter

const HOLD_SECONDS = 1.8;
const FPS          = 30;
const HOLD_FRAMES  = HOLD_SECONDS * FPS;
const GRACE_FRAMES = 8;

const MOTION_HISTORY_SIZE = 30;
const GESTURE_COOLDOWN    = 45;
const ILY_HOLD_FRAMES     = Math.round(1.0 * FPS);

// ── Motion history ────────────────────────────────────────────────────────────
interface MotionFrame {
  wristX:   number;
  wristY:   number;
  isFist:   boolean;
  indexUp:  boolean;
  middleUp: boolean;
}

function updateMotionHistory(lm: Landmark[], history: MotionFrame[]): MotionFrame[] {
  const iS = fingerState(lm[INDEX_TIP],  lm[INDEX_PIP],  lm[INDEX_MCP]);
  const mS = fingerState(lm[MIDDLE_TIP], lm[MIDDLE_PIP], lm[MIDDLE_MCP]);
  const rS = fingerState(lm[RING_TIP],   lm[RING_PIP],   lm[RING_MCP]);
  const pS = fingerState(lm[PINKY_TIP],  lm[PINKY_PIP],  lm[PINKY_MCP]);
  const frame: MotionFrame = {
    wristX:   lm[WRIST].x,
    wristY:   lm[WRIST].y,
    isFist:   req(iS,'down') && req(mS,'down') && req(rS,'down') && req(pS,'down'),
    indexUp:  req(iS,'up'),
    middleUp: req(mS,'up'),
  };
  const next = [...history, frame];
  if (next.length > MOTION_HISTORY_SIZE) next.shift();
  return next;
}

// Peak-based oscillation counter — returns number of significant direction reversals
function countOscillations(vals: number[], minDelta: number): number {
  let dir = 0, base = vals[0], changes = 0;
  for (let i = 1; i < vals.length; i++) {
    const d = vals[i] - base;
    if (dir !== 1  && d < -minDelta) { if (dir === -1) changes++; dir =  1; base = vals[i]; }
    if (dir !== -1 && d >  minDelta) { if (dir ===  1) changes++; dir = -1; base = vals[i]; }
  }
  return changes;
}

function detectYesGesture(history: MotionFrame[]): boolean {
  if (history.length < 14) return false;
  const fistFrames = history.filter(f => f.isFist);
  if (fistFrames.length < history.length * 0.65) return false;
  const ys = fistFrames.map(f => f.wristY);
  if (ys.length < 10) return false;
  return countOscillations(ys, 0.025) >= 3;
}

function detectNoGesture(history: MotionFrame[]): boolean {
  if (history.length < 14) return false;
  const fingerFrames = history.filter(f => f.indexUp && f.middleUp);
  if (fingerFrames.length < history.length * 0.55) return false;
  const xs = fingerFrames.map(f => f.wristX);
  if (xs.length < 10) return false;
  return countOscillations(xs, 0.025) >= 3;
}

function detectILoveYouGesture(lm: Landmark[]): boolean {
  const iS = fingerState(lm[INDEX_TIP],  lm[INDEX_PIP],  lm[INDEX_MCP]);
  const mS = fingerState(lm[MIDDLE_TIP], lm[MIDDLE_PIP], lm[MIDDLE_MCP]);
  const rS = fingerState(lm[RING_TIP],   lm[RING_PIP],   lm[RING_MCP]);
  const pS = fingerState(lm[PINKY_TIP],  lm[PINKY_PIP],  lm[PINKY_MCP]);
  const thumbSide = Math.abs(lm[THUMB_TIP].x - lm[THUMB_MCP].x) > 0.06;
  return thumbSide && req(iS,'up') && mS !== 'up' && rS !== 'up' && req(pS,'up');
}

// ── Component ─────────────────────────────────────────────────────────────────
export interface ASLDetectorRef {
  sentence: string;
  clearSentence: () => void;
  deleteLastChar: () => void;
  addSpace: () => void;
  setSentenceText: (text: string) => void;
}

interface ASLDetectorProps {
  landmarkColor?: string;
  displayMode?: "camera" | "mediapipe" | "both";
  onLetterChange?: (letter: string, score: number) => void;
  onSentenceChange?: (sentence: string) => void;
  onProgressChange?: (progress: number) => void;
  onCameraReady?: (ready: boolean) => void;
  onCameraError?: () => void;
}

const ASLDetector = forwardRef<ASLDetectorRef, ASLDetectorProps>(function ASLDetector(
  {
    landmarkColor = "#ffb3c6",
    displayMode = "both",
    onLetterChange,
    onSentenceChange,
    onProgressChange,
    onCameraReady,
    onCameraError,
  },
  ref
) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sentenceRef      = useRef("");
  const lockedLetterRef  = useRef("");
  const holdCountRef     = useRef(0);
  const graceCountRef      = useRef(0);
  const motionHistoryRef   = useRef<MotionFrame[]>([]);
  const gestureCooldownRef = useRef(0);
  const ilyHoldRef         = useRef(0);

  // Buffer now stores {letter, occ} per frame so we can apply the right threshold
  const detBuf = useRef<Array<{ letter: string; occ: boolean }>>([]);

  const [sentence, setSentenceState] = useState("");
  const setSentence = (updater: string | ((prev: string) => string)) => {
    setSentenceState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      sentenceRef.current = next;
      onSentenceChange?.(next);
      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    sentence: sentenceRef.current,
    clearSentence:  () => setSentence(""),
    deleteLastChar: () => setSentence(p => p.slice(0, -1)),
    addSpace:       () => setSentence(p => p.endsWith(' ') ? p : p + ' '),
    setSentenceText: (text: string) => setSentence(text),
  }));

  const drawLandmarks = useCallback((
    ctx: CanvasRenderingContext2D,
    lm: Landmark[],
    w: number,
    h: number,
    color: string
  ) => {
    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17],
    ];
    ctx.strokeStyle = color + "88";
    ctx.lineWidth = 2;
    for (const [a, b] of connections) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * w, lm[a].y * h);
      ctx.lineTo(lm[b].x * w, lm[b].y * h);
      ctx.stroke();
    }
    for (const p of lm) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, []);

  const landmarkColorRef = useRef(landmarkColor);
  useEffect(() => { landmarkColorRef.current = landmarkColor; }, [landmarkColor]);

  const displayModeRef = useRef(displayMode);
  useEffect(() => { displayModeRef.current = displayMode; }, [displayMode]);

  useEffect(() => {
    let hands: any, camera: any, stopped = false;

    const load = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch {
        onCameraError?.();
        return;
      }
      if (stopped) return;

      const s1 = Object.assign(document.createElement("script"), {
        src: "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
        crossOrigin: "anonymous",
      });
      const s2 = Object.assign(document.createElement("script"), {
        src: "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        crossOrigin: "anonymous",
      });
      document.head.append(s1, s2);
      await new Promise<void>((res) => { s2.onload = () => res(); });
      if (stopped) return;

      // @ts-ignore
      hands = new window.Hands({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results: any) => {
        const canvas = canvasRef.current;
        const video  = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext("2d")!;
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;

        const mode  = displayModeRef.current;
        const color = landmarkColorRef.current;

        if (mode === "camera" || mode === "both") {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const allRaw: any[][] = results.multiHandLandmarks ?? [];

        if (allRaw.length === 0) {
          detBuf.current = [];
          motionHistoryRef.current = [];
          ilyHoldRef.current = 0;
          onLetterChange?.("—", 0);
          holdCountRef.current  = 0;
          graceCountRef.current = 0;
          lockedLetterRef.current = "";
          onProgressChange?.(0);
          return;
        }

        // Mirror x — canvas is displayed flipped
        const handsLm: Landmark[][] = allRaw.map(hand =>
          hand.map((p: any) => ({ x: 1 - p.x, y: p.y, z: p.z }))
        );

        if (mode === "mediapipe" || mode === "both") {
          for (const lm of handsLm) drawLandmarks(ctx, lm, canvas.width, canvas.height, color);
        }

        // ── Classify ───────────────────────────────────────────────────────────
        let det: string;
        let sc:  number;
        let occ: boolean;

        if (handsLm.length >= 2) {
          const { detected, score: helpScore } = classifyHelp(handsLm[0], handsLm[1]);
          if (detected) {
            det = "HELP"; sc = helpScore; occ = false;
          } else {
            const r = classify(handsLm[0]);
            det = r.letter; sc = r.score; occ = r.occCount > 0;
          }
        } else {
          const r = classify(handsLm[0]);
          det = r.letter; sc = r.score; occ = r.occCount > 0;
        }

        // ── Temporal majority buffer ───────────────────────────────────────────
        detBuf.current.push({ letter: det, occ });
        if (detBuf.current.length > MAJORITY_BUFFER_SIZE) detBuf.current.shift();

        const bufLen = detBuf.current.length;

        // Count letter occurrences (ignoring '?')
        const counts: Record<string, number> = {};
        for (const entry of detBuf.current) {
          if (entry.letter !== '?') counts[entry.letter] = (counts[entry.letter] ?? 0) + 1;
        }
        const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

        // How many of the buffered frames were occluded?
        const occFrames = detBuf.current.filter(e => e.occ).length;
        const mostlyOccluded = occFrames / bufLen > 0.4;
        const threshold = mostlyOccluded ? OCCLUDED_MAJORITY_THRESHOLD : MAJORITY_THRESHOLD;

        // Don't emit a letter until the buffer has enough frames
        const stableLetter =
          bufLen >= MIN_BUFFER_FRAMES &&
          topEntry &&
          topEntry[1] / bufLen >= threshold
            ? topEntry[0]
            : '?';

        const bufConf = topEntry ? Math.round((topEntry[1] / bufLen) * 100) : 0;

        // Display: show the raw detection only when the buffer is still filling;
        // once stable, prefer the smoothed letter.  When uncertain → neutral "—".
        const displayLetter = stableLetter !== '?'
          ? stableLetter
          : (det !== '?' && sc > 0 ? det : '—');
        const displayScore  = bufLen >= MIN_BUFFER_FRAMES ? bufConf : sc;

        // ── Gesture detection ──────────────────────────────────────────────────
        motionHistoryRef.current = updateMotionHistory(handsLm[0], motionHistoryRef.current);
        if (gestureCooldownRef.current > 0) gestureCooldownRef.current--;

        // ILY: static hold-to-commit; only count when cooldown is clear
        const ilyActive = detectILoveYouGesture(handsLm[0]);
        if (!ilyActive) {
          if (ilyHoldRef.current > 0) onProgressChange?.(0);
          ilyHoldRef.current = 0;
        } else if (gestureCooldownRef.current === 0) {
          ilyHoldRef.current++;
        } else {
          ilyHoldRef.current = 0; // don't count during post-commit cooldown
        }

        // ILY overrides letter display while actively held
        const ilyInProgress = ilyActive && gestureCooldownRef.current === 0 && ilyHoldRef.current > 0;
        if (ilyInProgress) {
          const ilyPct = Math.min((ilyHoldRef.current / ILY_HOLD_FRAMES) * 100, 100);
          onLetterChange?.('ILY', Math.round(ilyPct));
          onProgressChange?.(ilyPct);
        } else {
          onLetterChange?.(displayLetter, displayScore);
        }

        // Commit ILY
        if (ilyInProgress && ilyHoldRef.current >= ILY_HOLD_FRAMES) {
          setSentence(p => p + 'ILY');
          ilyHoldRef.current = 0;
          detBuf.current = [];
          gestureCooldownRef.current = GESTURE_COOLDOWN;
          onProgressChange?.(0);
          return;
        }

        // Commit YES / NO (dynamic oscillation gestures)
        if (!ilyActive && gestureCooldownRef.current === 0) {
          if (detectYesGesture(motionHistoryRef.current)) {
            setSentence(p => p + 'YES');
            motionHistoryRef.current = [];
            detBuf.current = [];
            holdCountRef.current = 0;
            lockedLetterRef.current = '';
            gestureCooldownRef.current = GESTURE_COOLDOWN;
            onProgressChange?.(0);
            return;
          }
          if (detectNoGesture(motionHistoryRef.current)) {
            setSentence(p => p + 'NO');
            motionHistoryRef.current = [];
            detBuf.current = [];
            holdCountRef.current = 0;
            lockedLetterRef.current = '';
            gestureCooldownRef.current = GESTURE_COOLDOWN;
            onProgressChange?.(0);
            return;
          }
        }

        // ── Letter hold-to-commit (unchanged, suppressed while ILY in progress) ──
        if (!ilyInProgress) {
          if (stableLetter !== '?') {
            graceCountRef.current = 0;
            if (stableLetter === lockedLetterRef.current) {
              holdCountRef.current++;
              const pct = Math.min((holdCountRef.current / HOLD_FRAMES) * 100, 100);
              onProgressChange?.(pct);
              if (holdCountRef.current >= HOLD_FRAMES) {
                setSentence(p => p + stableLetter);
                holdCountRef.current = 0;
                lockedLetterRef.current = "";
                detBuf.current = [];
                onProgressChange?.(0);
              }
            } else {
              lockedLetterRef.current = stableLetter;
              holdCountRef.current = 1;
              onProgressChange?.(0);
            }
          } else {
            graceCountRef.current++;
            if (graceCountRef.current > GRACE_FRAMES) {
              holdCountRef.current  = 0;
              lockedLetterRef.current = "";
              onProgressChange?.(0);
            }
          }
        }
      });

      // @ts-ignore
      camera = new window.Camera(videoRef.current, {
        onFrame: async () => { await hands.send({ image: videoRef.current }); },
        width: 640, height: 480,
      });
      await camera.start();
      if (stopped) { camera.stop(); return; }
      onCameraReady?.(true);
    };

    load().catch(console.error);
    return () => {
      stopped = true;
      hands?.close?.();
      camera?.stop?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay muted playsInline
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </>
  );
});

export default ASLDetector;
