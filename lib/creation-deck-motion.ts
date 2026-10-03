/** Owner-approved inertia design2.0. Units: cards, milliseconds, cards/second. */
export const deckMotion = { intent: 8, ratio: 1.15, step: .56, minFlickTravel: .06, windowMs: 80, staleMs: 100, tau: 70, coastTau: 320, maxSpeed: 10, alignSpeed: .3, epsilon: .004 } as const;
export type MotionSample = { pos: number; time: number };
export const ringIndex = (pos: number, count: number) => count > 0 ? ((Math.round(pos) % count) + count) % count : 0;
/** Half-circle ties consistently take the negative side, including negative turns. */
export function ringDelta(index: number, pos: number, count: number) {
  return count > 0 ? (((index - pos + count / 2) % count) + count) % count - count / 2 : 0;
}
export function velocity(samples: MotionSample[], releasedAt: number) {
  const last = samples.at(-1);
  if (!last || releasedAt - last.time >= deckMotion.staleMs) return 0;
  const recent = samples.filter(sample => sample.time >= last.time - deckMotion.windowMs && sample.time <= last.time);
  // Retain one bounded predecessor when sparse delivery leaves only one recent
  // point. A long hold is not evidence of a recent flick.
  const segment = recent.length >= 2 ? recent : samples.slice(-2);
  let first = segment.at(-1), direction = 0;
  for (let i = segment.length - 2; i >= 0; i--) {
    const sign = Math.sign(segment[i + 1].pos - segment[i].pos);
    if (sign && direction && sign !== direction) break;
    if (sign) direction = sign;
    first = segment[i];
  }
  if (!first) return 0;
  const dt = last.time - first.time, travel = last.pos - first.pos;
  if (dt <= 0 || dt > deckMotion.staleMs || Math.abs(travel) < deckMotion.minFlickTravel) return 0;
  return travel * 1000 / Math.max(16, dt);
}
/** Symmetric confidence avoids committing a small diagonal wobble to vertical. */
export function intentAxis(dx: number, dy: number): 'pending' | 'dragging' | 'vertical' {
  if (Math.abs(dx) >= deckMotion.intent && Math.abs(dx) > Math.abs(dy) * deckMotion.ratio) return 'dragging';
  if (Math.abs(dy) >= deckMotion.intent && Math.abs(dy) > Math.abs(dx) * deckMotion.ratio) return 'vertical';
  return 'pending';
}
/** Analytic integration stops at the same displacement at any frame rate. */
export function coastStep(pos: number, speed: number, dt: number) {
  const stopAfter = Math.abs(speed) > deckMotion.alignSpeed
    ? deckMotion.coastTau * Math.log(Math.abs(speed) / deckMotion.alignSpeed) : 0;
  const elapsed = Math.min(Math.max(0, dt), stopAfter);
  const decay = Math.exp(-elapsed / deckMotion.coastTau);
  return { pos: pos + speed * deckMotion.coastTau / 1000 * (1 - decay),
    speed: speed * decay, done: dt >= stopAfter };
}
export const releaseSpeed = (speed: number) => Math.max(-deckMotion.maxSpeed, Math.min(deckMotion.maxSpeed, speed));
export function crossedSeam(index: number, from: number, to: number, count: number) {
  return count > 0 && Math.floor((index - from + count / 2) / count) !== Math.floor((index - to + count / 2) / count);
}
export function settleStep(pos: number, target: number, dt: number) {
  const next = pos + (target - pos) * (1 - Math.exp(-Math.max(0, dt) / deckMotion.tau));
  return Math.abs(target - next) < deckMotion.epsilon ? target : next;
}
export function cardPose(distance: number, stepPx: number) {
  const depth = Math.min(1, Math.abs(distance));
  return { x: distance * stepPx, scale: 1 - .06 * depth, angle: -Math.max(-1, Math.min(1, distance)) * 7,
    shade: .18 * depth, opacity: Math.max(0, Math.min(1, (1.25 - Math.abs(distance)) / .25)) };
}
