"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { cardPose, deckMotion, releaseTarget, ringDelta, ringIndex, settleStep, velocity, type MotionSample } from '@/lib/creation-deck-motion';

type Phase = 'idle' | 'pending' | 'vertical' | 'dragging' | 'settling';
type Contact = { id: number; x: number; y: number; dx: number; startPos: number; moved: number; interrupted: boolean; cardId?: string; samples: MotionSample[]; target: EventTarget | null };
type Controller = { move: (delta: number) => void; reveal: (id: string) => void; cancel: () => void };
const noop = () => {};

/** Owns a single animation clock. Article text, routes and categories stay outside. */
export function useCreationDeckMotion(stage: RefObject<HTMLOListElement | null>, ids: string[], enabled: boolean) {
  const [activeId, setActiveId] = useState(ids[0] ?? '');
  const committed = useRef(ids[0] ?? '');
  const api = useRef<Controller>({ move: noop, reveal: noop, cancel: noop });
  const idsKey = JSON.stringify(ids);

  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const keys: string[] = JSON.parse(idsKey);
    const cards = Array.from(element.children) as HTMLElement[];
    const count = keys.length;
    const retained = Math.max(0, keys.indexOf(committed.current));
    committed.current = keys[retained] ?? '';
    // Reconcile by ID after a data replacement; never retain an obsolete index.
    queueMicrotask(() => { if (!disposed) setActiveId(committed.current); });
    let disposed = false;
    let pos = retained, target = retained, phase: Phase = 'idle';
    let frame: number | undefined, lastTime = 0, stepPx = 170;
    let contact: Contact | null = null;
    let clickGuard: { id: number; until: number; cardId?: string; target: EventTarget | null } | null = null;
    const running = enabled && count >= 3;

    const render = () => {
      element.dataset.motion = phase;
      element.dataset.motionPos = String(pos);
      element.dataset.motionTarget = String(target);
      element.dataset.motionRaf = frame === undefined ? '0' : '1';
      cards.forEach((card, index) => {
        if (!running) {
          card.removeAttribute('data-distance');
          card.removeAttribute('style');
          return;
        }
        const d = ringDelta(index, pos, count), pose = cardPose(d, stepPx);
        card.dataset.distance = String(d);
        card.style.transform = `translateX(${pose.x}px) perspective(1200px) rotateY(${pose.angle}deg) scale(${pose.scale})`;
        card.style.opacity = String(pose.opacity);
        card.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        card.style.pointerEvents = pose.opacity > .05 ? 'auto' : 'none';
        card.style.setProperty('--deck-shade', String(pose.shade));
      });
    };
    const stop = () => { if (frame !== undefined) cancelAnimationFrame(frame); frame = undefined; };
    const finish = () => {
      stop(); pos = target;
      const index = ringIndex(pos, count);
      const cycles = count ? Math.floor(pos / count) * count : 0;
      pos -= cycles; target -= cycles;
      phase = 'idle';
      const id = keys[index] ?? '';
      if (committed.current !== id) { committed.current = id; setActiveId(id); }
      render();
    };
    const queue = () => {
      if (frame !== undefined || disposed) return;
      frame = requestAnimationFrame(tick);
      element.dataset.motionRaf = '1';
    };
    const tick = (time: number) => {
      frame = undefined;
      if (phase === 'dragging' && contact) pos = contact.startPos - contact.dx / stepPx;
      if (phase === 'settling') {
        pos = settleStep(pos, target, time - lastTime);
        lastTime = time;
        if (pos === target) { finish(); return; }
        queue();
      }
      render();
    };
    const settle = (next: number, immediate = false) => {
      stop(); target = next;
      if (immediate || Math.abs(pos - target) < deckMotion.epsilon) { finish(); return; }
      phase = 'settling'; lastTime = performance.now(); queue(); render();
    };
    const releaseCapture = (id: number) => {
      if (element.hasPointerCapture?.(id)) element.releasePointerCapture(id);
    };
    const guard = (current: Contact) => {
      clickGuard = { id: current.id, until: performance.now() + 400, cardId: current.cardId, target: current.target };
    };
    // A pending/vertical mouse contact has no capture. Observe its terminal
    // events outside the stage, but only for the lifetime of that contact.
    const watchContact = () => {
      window.addEventListener('pointerup', onUp, true);
      window.addEventListener('pointercancel', onCancel, true);
      window.addEventListener('blur', onWindowBlur);
    };
    const unwatchContact = () => {
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
      window.removeEventListener('blur', onWindowBlur);
    };
    const cancel = (immediate = false) => {
      if (contact) { const current = contact; guard(current); contact = null; unwatchContact(); releaseCapture(current.id); }
      const index = Math.max(0, keys.indexOf(committed.current));
      settle(Math.round(pos + ringDelta(index, pos, count)), immediate);
    };
    const measure = () => {
      const width = cards[0]?.offsetWidth;
      if (width) stepPx = width * deckMotion.step;
      render();
    };
    const cardId = (node: EventTarget | null) => node instanceof Element ? node.closest<HTMLElement>('[data-deck-id]')?.dataset.deckId : undefined;
    const onDown = (event: PointerEvent) => {
      if (contact || !event.isPrimary) { cancel(); return; }
      clickGuard = null;
      if (event.button !== 0 || (event.target instanceof Element && event.target.closest('button'))) return;
      const interrupted = phase !== 'idle';
      stop();
      contact = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, startPos: pos, moved: 0, interrupted,
        cardId: cardId(event.target), target: event.target, samples: [{ pos, time: event.timeStamp }] };
      watchContact();
      phase = 'pending'; render();
    };
    const sample = (event: PointerEvent, current: Contact) => {
      const dx = event.clientX - current.x, dy = event.clientY - current.y;
      current.moved = Math.max(current.moved, Math.hypot(dx, dy));
      if (dx !== current.dx) {
        current.samples.push({ pos: current.startPos - dx / stepPx, time: event.timeStamp });
        current.samples = current.samples.filter(point => point.time >= event.timeStamp - deckMotion.windowMs);
      }
      current.dx = dx;
      return { dx, dy };
    };
    const onMove = (event: PointerEvent) => {
      const current = contact;
      if (!current || event.pointerId !== current.id) return;
      const { dx, dy } = sample(event, current);
      if (phase === 'pending') {
        if (Math.abs(dy) >= deckMotion.intent && Math.abs(dy) >= Math.abs(dx)) phase = 'vertical';
        else if (Math.abs(dx) >= deckMotion.intent && Math.abs(dx) > Math.abs(dy) * deckMotion.ratio) {
          phase = 'dragging'; element.setPointerCapture(event.pointerId);
        }
      }
      if (phase === 'dragging') queue();
      element.dataset.motion = phase;
    };
    const onUp = (event: PointerEvent) => {
      const current = contact;
      if (!current || event.pointerId !== current.id) return;
      sample(event, current);
      const previousPhase = phase;
      contact = null;
      unwatchContact();
      releaseCapture(current.id);
      if (previousPhase === 'dragging') {
        guard(current); pos = current.startPos - current.dx / stepPx;
        settle(releaseTarget(pos, current.startPos, velocity(current.samples, event.timeStamp)));
      } else if (previousPhase === 'vertical') {
        guard(current); cancel();
      } else {
        const clicked = keys.indexOf(current.cardId ?? '');
        const safeTap = !current.interrupted && current.moved < deckMotion.intent && current.cardId === committed.current;
        if (!safeTap) guard(current);
        settle(clicked >= 0 ? Math.round(pos + ringDelta(clicked, pos, count)) : Math.round(pos));
      }
    };
    const onWindowBlur = () => { if (contact) cancel(true); };
    const onCancel = (event: PointerEvent) => { if (contact?.id === event.pointerId) cancel(); };
    const onLost = (event: PointerEvent) => { if (event.target === element && contact?.id === event.pointerId) cancel(); };
    const onClick = (event: MouseEvent) => {
      if (event.detail === 0) return; // keyboard activation never inherits a pointer guard
      const id = cardId(event.target);
      const pointerId = 'pointerId' in event ? event.pointerId : undefined;
      const matchesGuard = clickGuard && performance.now() <= clickGuard.until &&
        (pointerId === clickGuard.id || (pointerId === undefined && (id === clickGuard.cardId || event.target === clickGuard.target || event.target === element)));
      if (matchesGuard) { event.preventDefault(); event.stopPropagation(); clickGuard = null; return; }
      if (event.target instanceof Element && event.target.closest('button')) return;
      if (window.getSelection()?.toString()) { event.preventDefault(); return; }
      if (id && (id !== committed.current || phase !== 'idle')) {
        event.preventDefault(); event.stopPropagation();
        const index = keys.indexOf(id);
        if (index >= 0) settle(Math.round(pos + ringDelta(index, pos, count)));
      }
    };
    const reveal = (id: string) => {
      if (contact) return; // pointer focus on a neighbor is not keyboard selection
      const index = keys.indexOf(id);
      if (index >= 0) settle(index, true);
    };
    const onFocus = (event: FocusEvent) => { const id = cardId(event.target); if (id) reveal(id); };
    const onResize = () => { cancel(true); measure(); };
    const onVisibility = () => { if (document.visibilityState !== 'visible') cancel(true); };
    const onSecondPointer = (event: PointerEvent) => { if (contact && event.pointerId !== contact.id) cancel(); };
    const controller: Controller = { move: delta => { if (contact) cancel(true); settle(target + delta); }, reveal, cancel: () => cancel(true) };
    api.current = running ? controller : { move: noop, reveal: noop, cancel: noop };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (running) {
      if (cards[0]) observer?.observe(cards[0]);
      element.addEventListener('pointerdown', onDown);
      element.addEventListener('pointermove', onMove);
      element.addEventListener('lostpointercapture', onLost);
      element.addEventListener('click', onClick, true);
      element.addEventListener('focusin', onFocus);
      window.addEventListener('pointerdown', onSecondPointer, true);
      window.addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      disposed = true; stop(); unwatchContact();
      if (contact) { const id = contact.id; contact = null; releaseCapture(id); }
      observer?.disconnect();
      element.removeEventListener('pointerdown', onDown); element.removeEventListener('pointermove', onMove);
      element.removeEventListener('lostpointercapture', onLost); element.removeEventListener('click', onClick, true);
      element.removeEventListener('focusin', onFocus); window.removeEventListener('pointerdown', onSecondPointer, true);
      window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVisibility);
      cards.forEach(card => { card.removeAttribute('style'); card.removeAttribute('data-distance'); });
      element.dataset.motion = 'idle'; element.dataset.motionRaf = '0';
      api.current = { move: noop, reveal: noop, cancel: noop };
    };
  }, [stage, idsKey, enabled]);
  const move = useCallback((delta: number) => api.current.move(delta), []);
  const cancel = useCallback(() => api.current.cancel(), []);
  return { activeId, move, cancel };
}
