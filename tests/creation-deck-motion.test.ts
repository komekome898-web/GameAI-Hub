import { describe, it, expect } from 'vitest';
import { ringDelta, ringIndex, intentAxis, coastStep, releaseSpeed, crossedSeam, settleStep, velocity, cardPose } from '@/lib/creation-deck-motion';

describe('continuous circular deck contract', () => {
  it('keeps shortest distances continuous across turns and hides the wrap seam', () => {
    for (const count of [3, 4, 5]) for (const pos of [-61.2, -.2, 0, .2, 63.2]) {
      for (let i = 0; i < count; i++) {
        const d = ringDelta(i, pos, count);
        expect(d).toBeGreaterThanOrEqual(-count / 2);
        expect(d).toBeLessThan(count / 2);
        expect(ringDelta(i, pos + 20 * count, count)).toBeCloseTo(d, 10);
      }
    }
    expect(ringDelta(2, 0, 4)).toBe(-2);
    expect(ringIndex(-1, 3)).toBe(2);
    expect(cardPose(1.5, 170).opacity).toBe(0);
    expect(cardPose(1, 170).opacity).toBe(1);
    expect(cardPose(1.25, 170).opacity).toBe(0);
    expect(cardPose(-1.45, 170).opacity).toBe(0);
  });
  it('uses bounded recent motion without rejecting a short sampling interval', () => {
    expect(velocity([{pos: 0, time: 0}, {pos: .18, time: 80}], 90)).toBeCloseTo(2.25);
    expect(velocity([{pos: 0, time: 0}, {pos: .18, time: 80}], 230)).toBe(0);
    expect(velocity([{pos: .18, time: 80}], 90)).toBe(0);
    expect(velocity([{pos: 0, time: 70}, {pos: .18, time: 80}], 90)).toBeCloseTo(11.25);
  });
  it('keeps a bounded preceding sample for sparse motion, without inventing long-hold velocity', () => {
    expect(velocity([{pos: 0, time: 0}, {pos: .18, time: 90}], 95)).toBeCloseTo(2);
    expect(velocity([{pos: 0, time: 0}, {pos: .18, time: 500}], 500)).toBe(0);
    expect(velocity([{pos: 0, time: 0}, {pos: .18, time: 80}, {pos: .181, time: 240}], 240)).toBe(0);
    expect(velocity([{pos: 0, time: 0}, {pos: .02, time: 8}], 8)).toBe(0);
    expect(velocity([{pos: .18, time: 200}, {pos: .181, time: 216}], 216)).toBe(0);
  });
  it('uses the latest direction on a fresh reversal, while rejecting reverse jitter', () => {
    expect(velocity([{pos: 0, time: 0}, {pos: 1, time: 50}, {pos: .8, time: 60}], 61)).toBeCloseTo(-12.5);
    expect(velocity([{pos: 0, time: 0}, {pos: -1, time: 50}, {pos: -.8, time: 60}], 61)).toBeCloseTo(12.5);
    expect(velocity([{pos: 0, time: 0}, {pos: 1, time: 50}, {pos: .999, time: 60}], 61)).toBe(0);
  });
  it.each([
    [7, 0, 'pending'], [8, 8, 'pending'], [9, 10, 'pending'],
    [12, 10, 'dragging'], [-12, -10, 'dragging'], [10, 12, 'vertical'],
  ] as const)('resolves (%i,%i) with symmetric confidence as %s', (dx, dy, expected) => {
    expect(intentAxis(dx, dy)).toBe(expected);
  });
  it('carries speed across multiple cards, including after a long drag', () => {
    expect(releaseSpeed(50)).toBe(10);
    expect(releaseSpeed(-50)).toBe(-10);
    expect(coastStep(.9, 0, 150).pos).toBe(.9);
    const slow = coastStep(2.2, 1, 2000), fast = coastStep(2.2, 10, 2000);
    expect(slow.pos).toBeCloseTo(2.424);
    expect(fast.pos).toBeCloseTo(5.304);
    expect(fast.done).toBe(true);
    expect(coastStep(-2.2, -10, 2000).pos).toBeCloseTo(-5.304);
  });
  it('integrates coast equally at60/120Hz and across a delayed frame', () => {
    const run = (hz: number) => {
      let pos = .2, speed = 10;
      for (let i = 0; i < hz * 2; i++) { const next = coastStep(pos, speed, 1000 / hz); pos = next.pos; speed = next.speed; if (next.done) break; }
      return pos;
    };
    expect(run(60)).toBeCloseTo(run(120), 10);
    expect(run(60)).toBeCloseTo(coastStep(.2, 10, 2000).pos, 10);
    expect(crossedSeam(2, .4, .6, 3)).toBe(true);
    expect(crossedSeam(2, .4, 6.6, 3)).toBe(true);
    expect(crossedSeam(2, .1, .2, 3)).toBe(false);
  });
  it('settles equivalently at 60/120Hz and stops exactly at the integer target', () => {
    const simulate = (hz: number) => {
      let pos = .2;
      for (let i = 0; i < hz / 5; i++) pos = settleStep(pos, 1, 1000 / hz);
      return pos;
    };
    expect(simulate(60)).toBeCloseTo(simulate(120), 10);
    expect(settleStep(.999, 1, 16)).toBe(1);
    expect(settleStep(.2, 1, -16)).toBe(.2);
  });
});
