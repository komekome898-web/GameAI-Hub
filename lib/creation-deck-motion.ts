/** Adopted mobile deck spec v1.2. Units: cards, milliseconds, cards/second. */
export const deckMotion = { intent: 8, ratio: 1.3, step: .56, flick: .45, windowMs: 80, staleMs: 100, tau: 70, epsilon: .004 } as const;
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
  const first = recent[0];
  if (recent.length < 2 || !first || last.time - first.time < 16) return 0;
  return (last.pos - first.pos) * 1000 / (last.time - first.time);
}
export function releaseTarget(pos: number, startPos: number, speed: number) {
  const nearest = Math.round(pos);
  return nearest === Math.round(startPos) && Math.abs(speed) > deckMotion.flick ? nearest + Math.sign(speed) : nearest;
}
export function settleStep(pos: number, target: number, dt: number) {
  const next = pos + (target - pos) * (1 - Math.exp(-Math.max(0, dt) / deckMotion.tau));
  return Math.abs(target - next) < deckMotion.epsilon ? target : next;
}
export function cardPose(distance: number, stepPx: number) {
  const depth = Math.min(1, Math.abs(distance));
  return { x: distance * stepPx, scale: 1 - .06 * depth, angle: -Math.max(-1, Math.min(1, distance)) * 7,
    shade: .18 * depth, opacity: Math.max(0, Math.min(1, (1.5 - Math.abs(distance)) / .3)) };
}
