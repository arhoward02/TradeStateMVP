<script>
  export let variant = 'candles'; // candles | sectors | chart | orderbook

  const titles = {
    candles: 'Price action',
    sectors: 'Sector stack',
    chart: 'Trend line',
    orderbook: 'Depth',
  };
</script>

<div class="glow-icon" title={titles[variant] || ''}>
  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {#if variant === 'candles'}
      <g class="layer a">
        <path d="M16 18v8M16 42v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        <rect x="12" y="26" width="8" height="16" rx="1" stroke="currentColor" stroke-width="1.4" />
      </g>
      <g class="layer b">
        <path d="M32 12v10M32 40v12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        <rect x="28" y="22" width="8" height="18" rx="1" stroke="currentColor" stroke-width="1.4" />
      </g>
      <g class="layer c">
        <path d="M48 20v6M48 38v10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        <rect x="44" y="26" width="8" height="12" rx="1" stroke="currentColor" stroke-width="1.4" />
      </g>
    {:else if variant === 'sectors'}
      <g class="layer a">
        <rect x="10" y="38" width="44" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" opacity="0.45" />
      </g>
      <g class="layer b">
        <rect x="14" y="26" width="36" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" opacity="0.7" />
      </g>
      <g class="layer c">
        <rect x="18" y="14" width="28" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4" />
      </g>
    {:else if variant === 'chart'}
      <g class="layer a">
        <path d="M10 48h44M10 12v36" stroke="currentColor" stroke-width="1.2" opacity="0.35" />
      </g>
      <g class="layer b">
        <path d="M14 40 L26 28 L36 34 L50 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <g class="layer c">
        <circle cx="50" cy="16" r="2.5" fill="currentColor" />
      </g>
    {:else}
      <g class="layer a">
        <path d="M12 16h18M12 24h14M12 32h20M12 40h12M12 48h16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.55" />
      </g>
      <g class="layer b">
        <path d="M52 16h-14M52 24h-10M52 32h-18M52 40h-8M52 48h-12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <g class="layer c">
        <path d="M32 12v40" stroke="currentColor" stroke-width="1.2" opacity="0.35" />
      </g>
    {/if}
  </svg>
</div>

<style>
  .glow-icon {
    width: 56px;
    height: 56px;
    color: rgba(255, 255, 255, 0.55);
    display: grid;
    place-items: center;
  }

  .glow-icon svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .layer {
    transition: transform 0.45s ease, opacity 0.45s ease, filter 0.45s ease;
    transform-origin: center;
  }

  .glow-icon:hover {
    color: #ff6b1a;
  }

  .glow-icon:hover .layer.a {
    transform: translateY(-2px) rotate(-2deg);
    filter: drop-shadow(0 0 6px rgba(255, 107, 26, 0.35));
  }

  .glow-icon:hover .layer.b {
    transform: translateY(1px);
    filter: drop-shadow(0 0 8px rgba(255, 107, 26, 0.45));
  }

  .glow-icon:hover .layer.c {
    transform: translateY(-3px) translateX(1px);
    filter: drop-shadow(0 0 6px rgba(255, 107, 26, 0.4));
  }

  @media (prefers-reduced-motion: reduce) {
    .layer {
      transition: none;
    }
    .glow-icon:hover .layer.a,
    .glow-icon:hover .layer.b,
    .glow-icon:hover .layer.c {
      transform: none;
      filter: none;
    }
  }
</style>
