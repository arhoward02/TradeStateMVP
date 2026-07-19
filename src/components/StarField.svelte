<script>
  import { onMount, onDestroy } from 'svelte';

  /**
   * Raycast-inspired star clusters — canvas draws ONLY the dots.
   * Each star is a plain circle with its own randomized size/opacity and its
   * own independent sine-wave "glisten" timer, ticked via requestAnimationFrame.
   * The colored backlight behind each node is a separate CSS layer (NodeGlow),
   * not drawn here — canvas work stays cheap: clear + draw N tiny circles per frame.
   */
  export let nodeSelector = '[data-star-node]';

  let canvas;
  let raf = 0;
  let stars = [];
  let reduceMotion = false;
  let ctx;
  let resizeObserver;
  let layoutTimer;

  function gaussian() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function measureNodes() {
    if (!canvas) return [];
    const root = canvas.getBoundingClientRect();
    return Array.from(document.querySelectorAll(nodeSelector)).map((el) => {
      const r = el.getBoundingClientRect();
      const weight = Number(el.getAttribute('data-star-weight') || 1);
      return {
        x: r.left - root.left + r.width / 2,
        y: r.top - root.top + r.height * 0.58,
        w: Math.max(r.width, 80),
        h: Math.max(r.height, 80),
        weight: Number.isFinite(weight) ? Math.max(weight, 0.3) : 1,
      };
    }).filter((n) => n.w > 8 && n.h > 8);
  }

  /** Sample a point inside a soft ellipse — densest at center, thins at edges. */
  function sampleInGlow(node) {
    const rx = Math.min(Math.max(node.w * 0.72, 160), 420);
    const ry = Math.min(Math.max(node.h * 0.55, 130), 300);

    let dx = gaussian() * 0.42;
    let dy = gaussian() * 0.42;
    const m = Math.sqrt(dx * dx + dy * dy);
    if (m > 1.15) {
      dx = (dx / m) * (0.7 + Math.random() * 0.35);
      dy = (dy / m) * (0.7 + Math.random() * 0.35);
    }

    return {
      x: node.x + dx * rx,
      y: node.y + dy * ry,
      core: Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy)),
    };
  }

  function starsForNode(node) {
    const area = Math.min(node.w, 520) * Math.min(node.h, 400);
    const base = Math.round((area / 900) * 1.15 * node.weight);
    return Math.min(Math.max(base, 90), 280);
  }

  function initStars(w, h) {
    const nodes = measureNodes();
    const list = [];

    for (const node of nodes) {
      const count = starsForNode(node);
      for (let i = 0; i < count; i++) {
        const s = sampleInGlow(node);
        const core = s.core;
        const spark = Math.random() < 0.08 + core * 0.12;
        list.push({
          x: Math.min(w + 8, Math.max(-8, s.x)),
          y: Math.min(h + 8, Math.max(-8, s.y)),
          r: spark ? Math.random() * 1.2 + 0.7 : Math.random() * 0.55 + 0.35,
          base: spark
            ? 0.45 + core * 0.4
            : 0.08 + core * 0.45 + Math.random() * 0.12,
          // Independent glisten timer per star — this is the whole "twinkle" effect.
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.4,
          warm: core > 0.35 && Math.random() < 0.4,
        });
      }
    }

    stars = list;
  }

  function paintStars(time) {
    if (!ctx) return;
    for (const s of stars) {
      const a = reduceMotion
        ? s.base
        : s.base + Math.sin(time * s.speed + s.phase) * 0.18;
      const alpha = Math.max(0.04, Math.min(0.95, a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.warm
        ? `rgba(255, 190, 150,${alpha})`
        : `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w < 2 || h < 2) return;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars(w, h);
    if (reduceMotion) {
      ctx.clearRect(0, 0, w, h);
      paintStars(0);
    }
  }

  function scheduleLayout() {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(resize, 80);
  }

  function tick(t) {
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    paintStars(t / 1000);
    raf = requestAnimationFrame(tick);
  }

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resize();
        if (!reduceMotion) raf = requestAnimationFrame(tick);
      });
    });

    window.addEventListener('resize', scheduleLayout);

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleLayout);
      document.querySelectorAll(nodeSelector).forEach((el) => resizeObserver.observe(el));
    }
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    clearTimeout(layoutTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', scheduleLayout);
    }
    resizeObserver?.disconnect();
  });
</script>

<canvas
  bind:this={canvas}
  class="starfield"
  aria-hidden="true"
></canvas>

<style>
  .starfield {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
</style>
