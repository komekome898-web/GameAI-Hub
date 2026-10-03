"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { cardPose, deckMotion, intentAxis, coastStep, crossedSeam, releaseSpeed, ringDelta, ringIndex, settleStep, velocity, type MotionSample } from '@/lib/creation-deck-motion';

type Phase = 'idle' | 'pending' | 'vertical' | 'dragging' | 'coasting' | 'settling';
type Contact = { id: number; x: number; y: number; dx: number; startPos: number; moved: number; interrupted: boolean; cardId?: string; samples: MotionSample[]; target: EventTarget | null; time: number; lastY: number };
type Controller = { move: (delta: number) => void; reveal: (id: string) => void; cancel: () => void };
const noop = () => {};

/** Owns a single animation clock. Article text, routes and categories stay outside. */
export function useCreationDeckMotion(stage: RefObject<HTMLOListElement | null>, ids: string[], enabled: boolean, initialId?: string) {
  const seed = initialId && ids.includes(initialId) ? initialId : ids[0] ?? '';
  const [activeId, setActiveId] = useState(seed);
  const committed = useRef(seed);
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
    let speed = 0, renderedPos = pos;
    const hiddenCards = new Set<number>();
    let measured = false, viewportWidth = 0, stageWidth = 0;
    let contact: Contact | null = null;
    let clickGuard: { id: number; until: number; cardId?: string; target: EventTarget | null } | null = null;
    const running = enabled && count >= 3;

    const render = () => {
      element.dataset.motion = phase;
      element.dataset.motionPos = String(pos);
      element.dataset.motionTarget = String(target);
      element.dataset.motionRaf = frame === undefined ? '0' : '1';
      element.dataset.motionSpeed = String(speed);
      let hiddenSeam = false;
      cards.forEach((card, index) => {
        if (!running) {
          card.removeAttribute('data-distance');
          card.removeAttribute('style');
          return;
        }
        const d = ringDelta(index, pos, count), pose = cardPose(d, stepPx);
        card.dataset.distance = String(d);
        card.style.transform = `translateX(${pose.x}px) perspective(1200px) rotateY(${pose.angle}deg) scale(${pose.scale})`;
        const crossed = crossedSeam(index, renderedPos, pos, count);
        if (crossed) hiddenCards.add(index);
        hiddenSeam ||= crossed;
        const hidden = hiddenCards.has(index);
        card.style.opacity = String(hidden ? 0 : pose.opacity);
        card.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        card.style.pointerEvents = !hidden && pose.opacity > .05 ? 'auto' : 'none';
        card.style.setProperty('--deck-shade', String(pose.shade));
      });
      renderedPos = pos;
      if (hiddenSeam) queue(); // reveal only on a subsequent animation frame
    };
    const stop = () => { if (frame !== undefined) cancelAnimationFrame(frame); frame = undefined; };
    const finish = () => {
      stop(); speed = 0; pos = target;
      const index = ringIndex(pos, count);
      const cycles = count ? Math.floor(pos / count) * count : 0;
      pos -= cycles; target -= cycles; renderedPos -= cycles;
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
      frame = undefined; hiddenCards.clear();
      if (phase === 'dragging' && contact) pos = contact.startPos - contact.dx / stepPx;
      if (phase === 'coasting') {
        const next = coastStep(pos, speed, time - lastTime);
        pos = next.pos; speed = next.speed; lastTime = time;
        if (next.done) { speed = 0; target = Math.round(pos); phase = 'settling'; }
        queue();
      }
      if (phase === 'settling') {
        pos = settleStep(pos, target, time - lastTime);
        lastTime = time;
        if (pos === target) { finish(); return; }
        queue();
      }
      render();
    };
    const settle = (next: number, immediate = false) => {
      stop(); speed = 0; target = next;
      if (immediate || Math.abs(pos - target) < deckMotion.epsilon) { finish(); return; }
      phase = 'settling'; lastTime = performance.now(); queue(); render();
    };
    const release = (nextSpeed: number) => {
      stop(); speed = releaseSpeed(nextSpeed);
      if (Math.abs(speed) <= deckMotion.alignSpeed) { settle(Math.round(pos)); return; }
      phase = 'coasting'; lastTime = performance.now(); queue(); render();
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
    };
    const unwatchContact = () => {
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
    };
    const cancel = (immediate = false) => {
      if (contact) { const current = contact; guard(current); contact = null; unwatchContact(); releaseCapture(current.id); }
      const index = Math.max(0, keys.indexOf(committed.current));
      settle(Math.round(pos + ringDelta(index, pos, count)), immediate);
    };
    const measure = () => {
      const nextStep = cards[0]?.offsetWidth ? cards[0].offsetWidth * deckMotion.step : stepPx;
      const nextViewport = window.innerWidth, nextStage = element.clientWidth;
      if (running && measured && (nextViewport !== viewportWidth || nextStage !== stageWidth || nextStep !== stepPx)) cancel(true);
      viewportWidth = nextViewport; stageWidth = nextStage; stepPx = nextStep; measured = true;
      render();
    };
    const cardId = (node: EventTarget | null) => node instanceof Element ? node.closest<HTMLElement>('[data-deck-id]')?.dataset.deckId : undefined;
    const onDown = (event: PointerEvent) => {
      if (contact || !event.isPrimary) { cancel(); return; }
      clickGuard = null;
      if (event.button !== 0 || (event.target instanceof Element && event.target.closest('button'))) return;
      const interrupted = phase !== 'idle';
      stop(); speed = 0;
      contact = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, startPos: pos, moved: 0, interrupted,
        cardId: cardId(event.target), target: event.target, time: event.timeStamp, lastY: event.clientY, samples: [{ pos, time: event.timeStamp }] };
      watchContact();
      phase = 'pending'; render();
    };
    const sample = (event: PointerEvent, current: Contact) => {
      // The same timestamp-ordered accumulator handles move and genuine final
      // displacement on up; stale terminal coordinates cannot rewind it.
      if (event.timeStamp < current.time || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY))
        return { dx: current.dx, dy: current.lastY - current.y };
      const dx = event.clientX - current.x, dy = event.clientY - current.y;
      current.moved = Math.max(current.moved, Math.hypot(dx, dy));
      if (dx !== current.dx || event.timeStamp - current.samples.at(-1)!.time >= deckMotion.staleMs) {
        current.samples.push({ pos: current.startPos - dx / stepPx, time: event.timeStamp });
        while (current.samples.length > 2 && current.samples[1].time < event.timeStamp - deckMotion.windowMs) current.samples.shift();
      }
      current.dx = dx; current.lastY = event.clientY; current.time = event.timeStamp;
      return { dx, dy };
    };
    const onMove = (event: PointerEvent) => {
      const current = contact;
      if (!current || event.pointerId !== current.id) return;
      const { dx, dy } = sample(event, current);
      if (phase === 'pending') {
        phase = intentAxis(dx, dy);
        if (phase === 'dragging') element.setPointerCapture(event.pointerId);
      }
      if (phase === 'dragging') queue();
      element.dataset.motion = phase;
    };
    const onUp = (event: PointerEvent) => {
      const current = contact;
      if (!current || event.pointerId !== current.id) return;
      const { dx, dy } = sample(event, current);
      // The final coordinates may be the first decisive movement. Never capture
      // a released pointer, and never revive vertical or cancelled contacts.
      const previousPhase = phase === 'pending' ? intentAxis(dx, dy) : phase;
      contact = null;
      unwatchContact();
      releaseCapture(current.id);
      if (previousPhase === 'dragging') {
        guard(current); pos = current.startPos - current.dx / stepPx;
        release(velocity(current.samples, Math.max(current.time, event.timeStamp)));
      } else if (previousPhase === 'vertical') {
        guard(current); cancel();
      } else {
        const clicked = keys.indexOf(current.cardId ?? '');
        const safeTap = !current.interrupted && current.moved < deckMotion.intent && current.cardId === committed.current;
        if (!safeTap) guard(current);
        settle(clicked >= 0 ? Math.round(pos + ringDelta(clicked, pos, count)) : Math.round(pos));
      }
    };
    const onWindowBlur = () => { if (contact || phase === 'coasting' || phase === 'settling') cancel(true); };
    const onCancel = (event: PointerEvent) => { if (contact?.id === event.pointerId) cancel(); };
    const onLost = (event: PointerEvent) => { if (event.target === element && contact?.id === event.pointerId) cancel(); };
    const onClick = (event: MouseEvent) => {
      if (event.detail === 0) return; // keyboard activation never inherits a pointer guard
      const id = cardId(event.target);
      const pointerId = 'pointerId' in event ? event.pointerId : undefined;
      const matchesGuard = clickGuard && performance.now() <= clickGuard.until &&
        (pointerId === clickGuard.id || id === clickGuard.cardId || event.target === clickGuard.target || event.target === element);
      if (matchesGuard) { event.preventDefault(); event.stopPropagation(); return; }
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
    const onFocus = (event: FocusEvent) => {
      const id = cardId(event.target);
      if (clickGuard && performance.now() <= clickGuard.until && id === clickGuard.cardId) return;
      if (id) reveal(id);
    };
    const onIndependentInput = () => { clickGuard = null; };
    const onResize = () => { measure(); };
    const onVisibility = () => { if (document.visibilityState !== 'visible') cancel(true); };
    const onSecondPointer = (event: PointerEvent) => { if (contact && event.pointerId !== contact.id) cancel(); };
    const controller: Controller = { move: delta => { if (contact) cancel(true); settle((phase === 'coasting' ? Math.round(pos) : target) + delta); }, reveal, cancel: () => cancel(true) };
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
      window.addEventListener('pointerdown', onIndependentInput, true);
      window.addEventListener('keydown', onIndependentInput, true);
      window.addEventListener('pointerdown', onSecondPointer, true);
      window.addEventListener('resize', onResize);
      window.addEventListener('blur', onWindowBlur);
      document.addEventListener('visibilitychange', onVisibility);
    }
    return () => {
      disposed = true; stop(); unwatchContact();
      if (contact) { const id = contact.id; contact = null; releaseCapture(id); }
      observer?.disconnect();
      element.removeEventListener('pointerdown', onDown); element.removeEventListener('pointermove', onMove);
      element.removeEventListener('lostpointercapture', onLost); element.removeEventListener('click', onClick, true);
      window.removeEventListener('pointerdown', onIndependentInput, true); window.removeEventListener('keydown', onIndependentInput, true);
      element.removeEventListener('focusin', onFocus); window.removeEventListener('pointerdown', onSecondPointer, true);
      window.removeEventListener('resize', onResize); window.removeEventListener('blur', onWindowBlur); document.removeEventListener('visibilitychange', onVisibility);
      cards.forEach(card => { card.removeAttribute('style'); card.removeAttribute('data-distance'); });
      element.dataset.motion = 'idle'; element.dataset.motionRaf = '0';
      api.current = { move: noop, reveal: noop, cancel: noop };
    };
  }, [stage, idsKey, enabled]);
  const move = useCallback((delta: number) => api.current.move(delta), []);
  const cancel = useCallback(() => api.current.cancel(), []);
  return { activeId, move, cancel };
}
