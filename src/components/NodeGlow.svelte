<!--
  Raycast-style card backlight + corner star sparks.

  - .star-anchor:        explicit reference rect for star positioning. Its
                         measured rect (union of its children, since the flow
                         div can stretch wider than the visible card) is the
                         ONLY source of truth for star placement.
  - .node-glow__blob:    CSS radial-gradient glow, centered behind the card,
                         kept tight to the card's footprint.
  - .node-glow__stars:   canvas with a small, corner-weighted set of sparks
                         (~15-25 total), spawned only around the 4 corners
                         with sharp exponential falloff.

  Stacking is structural: blob (z:0) -> stars (z:1) -> content (z:2), so
  stars never paint over the card except where a spark intentionally sits
  right on a corner.
-->
<script>
  import { onMount, onDestroy } from 'svelte';

  /** Relative star density multiplier for this card (clamped to 15-25 total). */
  export let weight = 1;

  /** Render the star-anchor rect as a subtle 1px low-opacity container. */
  export let bordered = false;

  /** Set false to disable the star cluster entirely (glow only). */
  export let stars_enabled = true;

  /** Glow size relative to the anchor rect (1.16 = old default, <1 shrinks inside it). */
  export let glow_scale = 1.16;

  // Canvas bleed past the anchor rect — must cover MAX_CORNER_DIST + star size.
  const PAD = 110;
  // Sparks live within ~60-100px of a corner; falloff is exponential so
  // density collapses fast as you leave the corner.
  const MAX_CORNER_DIST = 100;
  const FALLOFF_MEAN = 30;

  // Corner spawn weights: top corners noticeably hotter than bottom,
  // matching the Raycast reference.
  const CORNERS = [
    { sx: -1, sy: -1, w: 1.25 }, // top-left
    { sx: 1, sy: -1, w: 1.45 }, // top-right
    { sx: 1, sy: 1, w: 0.65 }, // bottom-right
    { sx: -1, sy: 1, w: 0.65 }, // bottom-left
  ];
  const CORNER_TOTAL = CORNERS.reduce((s, c) => s + c.w, 0);

  let wrapper;
  let anchor;
  let canvas;
  let blob;
  let ctx;
  let raf = 0;
  let stars = [];
  let reduceMotion = false;
  let resizeObserver;
  let layoutTimer;

  function gaussian() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function pickCorner() {
    let r = Math.random() * CORNER_TOTAL;
    for (const c of CORNERS) {
      r -= c.w;
      if (r <= 0) return c;
    }
    return CORNERS[CORNERS.length - 1];
  }

  /** Exponential falloff: most sparks sit right at the corner, few reach 100px. */
  function cornerDistance() {
    const d = -Math.log(1 - Math.random()) * FALLOFF_MEAN;
    return Math.min(d, MAX_CORNER_DIST);
  }

  // Subtle Raycast-window palette for frame stars: white, cool grey-blue, faint warm.
  const FRAME_COLORS = [
    [255, 255, 255],
    [214, 220, 232],
    [190, 198, 214],
    [255, 226, 200],
  ];

  /**
   * Frame mode: tiny stars in a thin band strictly OUTSIDE the border,
   * distributed along the whole perimeter (like Raycast's window).
   */
  function sampleFrameStar(hw, hh) {
    const w2 = hw * 2;
    const h2 = hh * 2;
    const perim = 2 * (w2 + h2);
    let t = Math.random() * perim;
    let x;
    let y;
    let nx;
    let ny;
    if (t < w2) {
      x = -hw + t; y = -hh; nx = 0; ny = -1;
    } else if ((t -= w2) < h2) {
      x = hw; y = -hh + t; nx = 1; ny = 0;
    } else if ((t -= h2) < w2) {
      x = hw - t; y = hh; nx = 0; ny = 1;
    } else {
      t -= w2;
      x = -hw; y = hh - t; nx = -1; ny = 0;
    }
    // Always outside the border: 2px minimum, exponential falloff, ~45px max.
    const dist = 2 + Math.min(-Math.log(1 - Math.random()) * 13, 43);
    return { x: x + nx * dist, y: y + ny * dist };
  }

  function buildFrameStars(cardW, cardH) {
    const hw = cardW / 2;
    const hh = cardH / 2;
    const perim = 2 * (cardW + cardH);
    const n = Math.min(Math.max(Math.round((perim / 55) * weight), 30), 75);
    const list = [];
    for (let i = 0; i < n; i++) {
      const s = sampleFrameStar(hw, hh);
      const color = FRAME_COLORS[Math.floor(Math.random() * FRAME_COLORS.length)];
      list.push({
        x: s.x + hw + PAD,
        y: s.y + hh + PAD,
        r: 0.35 + Math.random() * 0.75,
        base: 0.18 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        // Slow cycles so flashes feel occasional, not strobing.
        speed: 0.15 + Math.random() * 0.35,
        color,
        flash: Math.random() < 0.16,
      });
    }
    stars = list;
  }

  /**
   * Spawn one spark near a corner of the anchor rect (local coords, origin =
   * rect center). Direction is a cone aimed diagonally outward from the
   * corner, so it reads as sparks kicked off the corner — a few land just
   * inside, overlapping the card edge.
   */
  function sampleStar(hw, hh) {
    const corner = pickCorner();
    const dist = cornerDistance();
    // Outward diagonal for this corner, with gaussian angular spread.
    const baseAngle = Math.atan2(corner.sy, corner.sx);
    const angle = baseAngle + gaussian() * 0.85;
    return {
      x: corner.sx * hw + Math.cos(angle) * dist,
      y: corner.sy * hh + Math.sin(angle) * dist,
      // 1 at the corner, 0 at max distance — drives size/brightness.
      core: 1 - dist / MAX_CORNER_DIST,
    };
  }

  function buildStars(cardW, cardH) {
    if (bordered) {
      buildFrameStars(cardW, cardH);
      return;
    }
    const hw = cardW / 2;
    const hh = cardH / 2;
    const n = Math.round(Math.min(Math.max(20 * weight, 15), 25));
    const list = [];
    for (let i = 0; i < n; i++) {
      const s = sampleStar(hw, hh);
      const core = s.core;
      list.push({
        // Shift into canvas-local (top-left origin) coordinates.
        x: s.x + hw + PAD,
        y: s.y + hh + PAD,
        // 1-3px diameter, brighter/bigger near the corner.
        r: 0.5 + Math.random() * 1 + core * 0.5,
        base: 0.3 + Math.random() * 0.35 + core * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        warm: core > 0.5 && Math.random() < 0.35,
      });
    }
    stars = list;
  }

  function paint(time) {
    if (!ctx || !canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      let alpha;
      let color;
      if (s.color) {
        // Frame star: mostly steady and faint; flashers spike briefly per cycle.
        alpha = s.base;
        if (!reduceMotion && s.flash) {
          const pulse = Math.pow(Math.max(0, Math.sin(time * s.speed * 2 + s.phase)), 18);
          alpha = s.base + pulse * 0.75;
        } else if (!reduceMotion) {
          alpha = s.base + Math.sin(time * s.speed + s.phase) * 0.06;
        }
        alpha = Math.max(0.08, Math.min(1, alpha));
        color = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha})`;
      } else {
        const a = reduceMotion ? s.base : s.base + Math.sin(time * s.speed + s.phase) * 0.15;
        alpha = Math.max(0.3, Math.min(1, a));
        color = s.warm ? `rgba(255,196,158,${alpha})` : `rgba(255,255,255,${alpha})`;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  /**
   * The star anchor is a plain block div, so in flow layouts it can stretch
   * wider than the visible card group (e.g. a centered max-width card).
   * The true reference rect is the union of its direct children's rects.
   */
  function measureAnchorRect() {
    if (!anchor) return null;
    // When the container itself is visible, it IS the reference rect —
    // stars should hug its border corners, not the content inside it.
    if (bordered) return anchor.getBoundingClientRect();
    const kids = anchor.children;
    if (!kids.length) return anchor.getBoundingClientRect();
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const kid of kids) {
      const r = kid.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      left = Math.min(left, r.left);
      top = Math.min(top, r.top);
      right = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    }
    if (!Number.isFinite(left)) return anchor.getBoundingClientRect();
    return { left, top, width: right - left, height: bottom - top };
  }

  function measureAndBuild() {
    if (!wrapper) return;
    const rect = measureAnchorRect();
    if (!rect) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const cardW = rect.width;
    const cardH = rect.height;
    if (cardW < 4 || cardH < 4) return;

    // Offset of the anchor rect within the wrapper.
    const offsetX = rect.left - wrapperRect.left;
    const offsetY = rect.top - wrapperRect.top;

    // Glow stays centered behind the card but barely extends past its edges.
    // (Frame mode has no blob — its glow is a box-shadow on the border itself.)
    if (blob) {
      const blobW = cardW * glow_scale;
      const blobH = cardH * glow_scale;
      blob.style.left = `${offsetX + (cardW - blobW) / 2}px`;
      blob.style.top = `${offsetY + (cardH - blobH) / 2}px`;
      blob.style.width = `${blobW}px`;
      blob.style.height = `${blobH}px`;
    }

    if (!canvas) return;
    const cssW = cardW + PAD * 2;
    const cssH = cardH + PAD * 2;
    canvas.style.left = `${offsetX - PAD}px`;
    canvas.style.top = `${offsetY - PAD}px`;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildStars(cardW, cardH);
    if (reduceMotion) paint(0);
  }

  function scheduleLayout() {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(measureAndBuild, 80);
  }

  function tick(t) {
    paint(t / 1000);
    raf = requestAnimationFrame(tick);
  }

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measureAndBuild();
        if (!reduceMotion && stars_enabled) raf = requestAnimationFrame(tick);
      });
    });

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleLayout);
      resizeObserver.observe(wrapper);
    }
    window.addEventListener('resize', scheduleLayout);
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    clearTimeout(layoutTimer);
    resizeObserver?.disconnect();
    if (typeof window !== 'undefined') window.removeEventListener('resize', scheduleLayout);
  });
</script>

<div class="node-glow" bind:this={wrapper}>
  {#if !bordered}
    <div bind:this={blob} class="node-glow__blob" aria-hidden="true"></div>
  {/if}
  {#if stars_enabled}
    <canvas bind:this={canvas} class="node-glow__stars" aria-hidden="true"></canvas>
  {/if}
  <div class="node-glow__content">
    <div class="star-anchor" class:star-anchor--bordered={bordered} bind:this={anchor}>
      <slot />
    </div>
  </div>
</div>

<style>
  .node-glow {
    position: relative;
  }

  /*
   * Tight backlight anchored to the card's own footprint (sized in JS from
   * the star-anchor rect). Fades out quickly so it barely passes the edges.
   */
  .node-glow__blob {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 62% 62% at 50% 50%,
      rgba(255, 107, 26, 0.48) 0%,
      rgba(255, 100, 28, 0.26) 45%,
      rgba(255, 107, 26, 0.08) 75%,
      rgba(255, 107, 26, 0) 100%
    );
    filter: blur(16px);
    animation: nodeGlowPulse 7s ease-in-out infinite;
  }

  /* Above the glow, below the card — sized to anchor rect + bleed, positioned via JS. */
  .node-glow__stars {
    position: absolute;
    z-index: 1;
    pointer-events: none;
  }

  .node-glow__content {
    position: relative;
    z-index: 2;
  }

  /* Invisible bounding reference for star positioning. */
  .star-anchor {
    position: relative;
  }

  /*
   * Frame mode: subtly visible border whose light spills OUTWARD only —
   * box-shadow follows the rounded-rect shape and never washes the inside.
   * Light grey, fading out within ~45px of the border (Raycast window style).
   */
  .star-anchor--bordered {
    padding: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 18px;
    box-shadow:
      0 0 14px rgba(214, 220, 232, 0.1),
      0 0 45px rgba(206, 212, 226, 0.09);
  }

  @keyframes nodeGlowPulse {
    0%, 100% { opacity: 0.82; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
  }

  @media (prefers-reduced-motion: reduce) {
    .node-glow__blob {
      animation: none;
      opacity: 0.9;
    }
  }
</style>
