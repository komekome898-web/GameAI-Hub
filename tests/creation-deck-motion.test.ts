import { describe, it, expect } from 'vitest';
import { ringDelta, ringIndex, intentAxis, releaseTarget, settleStep, velocity, cardPose } from '@/lib/creation-deck-motion';

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
    expect(cardPose(1.2, 170).opacity).toBeCloseTo(1);
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
  it.each([
    [7, 0, 'pending'], [8, 8, 'pending'], [9, 10, 'pending'],
    [12, 10, 'dragging'], [-12, -10, 'dragging'], [10, 12, 'vertical'],
  ] as const)('resolves (%i,%i) with symmetric confidence as %s', (dx, dy, expected) => {
    expect(intentAxis(dx, dy)).toBe(expected);
  });
  it('assists short flicks, but never adds a third card to a 2.2-card drag', () => {
    expect(releaseTarget(.18, 0, 1)).toBe(1);
    expect(releaseTarget(-.18, 0, -1)).toBe(-1);
    expect(releaseTarget(.18, 0, 0)).toBe(0);
    expect(releaseTarget(2.2, 0, 4)).toBe(2);
    expect(releaseTarget(-2.2, 0, -4)).toBe(-2);
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
