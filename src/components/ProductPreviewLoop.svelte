<script>
  import { onMount, onDestroy } from 'svelte';

  const scenes = [
    {
      id: 'screener',
      title: 'Leading Groups',
      subtitle: 'Industry Ranks',
      rows: [
        { name: 'Software', rank: '02', tag: 'LEADING', up: true },
        { name: 'Semiconductors', rank: '05', tag: 'HEATING UP', up: true },
        { name: 'Biotech', rank: '11', tag: 'REEMERGING', up: true },
        { name: 'Energy', rank: '18', tag: '', up: false },
      ],
    },
    {
      id: 'scan',
      title: 'Scan running',
      subtitle: 'Claude reading screenshots…',
      progress: 72,
    },
    {
      id: 'chart',
      title: 'Alert fired',
      subtitle: 'SMH crossed leadership threshold',
      alert: '+12 RS · LEADING',
    },
  ];

  const boardCols = [
    {
      title: 'Leaders',
      cards: [
        { id: 'LG-02', name: 'Software', tag: 'LEADING' },
        { id: 'LG-05', name: 'Semiconductors', tag: 'HEAT' },
      ],
    },
    {
      title: 'Watch',
      cards: [
        { id: 'LG-11', name: 'Biotech', tag: 'REEMERGE' },
        { id: 'LG-14', name: 'Retail', tag: '' },
      ],
    },
    {
      title: 'Laggards',
      cards: [
        { id: 'LG-22', name: 'Energy', tag: '' },
        { id: 'LG-28', name: 'Banks', tag: '' },
        { id: 'LG-31', name: 'Utilities', tag: '' },
      ],
    },
  ];

  let index = 0;
  let reduceMotion = false;
  let timer;

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      timer = setInterval(() => {
        index = (index + 1) % scenes.length;
      }, 3200);
    }
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  $: scene = scenes[index];
</script>

<div class="stage">
  <!-- Fading board layer (Linear-style dissolve into black) -->
  <div class="board-fade" aria-hidden="true">
    <div class="board">
      {#each boardCols as col}
        <div class="col">
          <p class="col-title">{col.title}</p>
          {#each col.cards as card}
            <div class="card">
              <span class="id">{card.id}</span>
              <span class="card-name">{card.name}</span>
              {#if card.tag}
                <span class="card-tag">{card.tag}</span>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <!-- Sharp foreground window — stays crisp like Linear's chat overlay -->
  <div class="focus">
    <div class="window">
      <div class="chrome">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="url">tradestate.io / leading-groups</span>
      </div>
      <div class="body">
        {#key scene.id}
          <div class="scene-in">
            <div class="scene-head">
              <p class="eyebrow">{scene.subtitle}</p>
              <h3>{scene.title}</h3>
            </div>

            {#if scene.rows}
              <ul class="rows">
                {#each scene.rows as row}
                  <li>
                    <span class="rank">{row.rank}</span>
                    <span class="name">{row.name}</span>
                    {#if row.tag}
                      <span class="tag" class:up={row.up}>{row.tag}</span>
                    {/if}
                  </li>
                {/each}
              </ul>
            {:else if scene.progress != null}
              <div class="scan">
                <div class="bar"><div class="fill" style="width: {scene.progress}%"></div></div>
                <p class="hint">Parsing Industry Ranks + Theme Tracker</p>
              </div>
            {:else}
              <div class="chart-scene">
                <svg viewBox="0 0 280 100" class="spark">
                  <path d="M8 72 L48 60 L88 66 L128 40 L168 48 L208 22 L248 28 L272 12" fill="none" stroke="#ff6b1a" stroke-width="2" stroke-linecap="round" />
                  <circle cx="208" cy="22" r="4" fill="#ff6b1a" />
                </svg>
                <div class="alert-pill">{scene.alert}</div>
              </div>
            {/if}
          </div>
        {/key}
      </div>
    </div>
  </div>
</div>

<style>
  .stage {
    position: relative;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    min-height: 420px;
  }

  /*
    Linear stage mask:
    - Top stays nearly solid
    - Left softens only slightly
    - Right has a long dissolve into black
    - Bottom drops away into the void
  */
  .board-fade {
    position: absolute;
    inset: 0 -8% -12% 4%;
    pointer-events: none;
    -webkit-mask-image:
      linear-gradient(
        to right,
        #000 0%,
        #000 38%,
        rgba(0, 0, 0, 0.55) 58%,
        rgba(0, 0, 0, 0.18) 78%,
        transparent 100%
      ),
      linear-gradient(
        to bottom,
        #000 0%,
        #000 42%,
        rgba(0, 0, 0, 0.45) 68%,
        transparent 100%
      );
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(
        to right,
        #000 0%,
        #000 38%,
        rgba(0, 0, 0, 0.55) 58%,
        rgba(0, 0, 0, 0.18) 78%,
        transparent 100%
      ),
      linear-gradient(
        to bottom,
        #000 0%,
        #000 42%,
        rgba(0, 0, 0, 0.45) 68%,
        transparent 100%
      );
    mask-composite: intersect;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, minmax(180px, 1fr));
    gap: 14px;
    padding: 28px 24px 80px 40px;
    min-height: 400px;
  }

  .col-title {
    margin: 0 0 10px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9a9a9a;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 12px 14px;
    margin-bottom: 10px;
    border-radius: 10px;
    border: 1px solid #2a2a2a;
    background: #141414;
  }

  .id {
    font-size: 10px;
    color: #9a9a9a;
    letter-spacing: 0.04em;
  }

  .card-name {
    font-size: 13px;
    color: #fff;
  }

  .card-tag {
    align-self: flex-start;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #ff6b1a;
    border: 1px solid rgba(255, 107, 26, 0.35);
    border-radius: 999px;
    padding: 2px 7px;
  }

  .focus {
    position: relative;
    z-index: 2;
    width: min(420px, 92%);
    margin: 36px 0 0 0;
  }

  .window {
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.03),
      0 28px 80px rgba(0, 0, 0, 0.65);
  }

  .chrome {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 14px;
    border-bottom: 1px solid #222;
    background: #0d0d0d;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2a2a2a;
  }

  .url {
    margin-left: 10px;
    font-size: 11px;
    color: #9a9a9a;
    letter-spacing: 0.02em;
  }

  .body {
    min-height: 220px;
    padding: 22px 24px 28px;
  }

  .scene-in {
    animation: sceneFade 0.55s ease;
  }

  @keyframes sceneFade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .eyebrow {
    margin: 0 0 4px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #9a9a9a;
  }

  h3 {
    margin: 0 0 18px;
    font-family: 'Space Grotesk', Inter, sans-serif;
    font-size: 20px;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rows li {
    display: grid;
    grid-template-columns: 28px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid #222;
    border-radius: 8px;
    background: #0a0a0a;
  }

  .rank {
    font-size: 12px;
    color: #9a9a9a;
    font-variant-numeric: tabular-nums;
  }

  .name {
    font-size: 14px;
    color: #fff;
  }

  .tag {
    font-size: 10px;
    letter-spacing: 0.08em;
    color: #9a9a9a;
  }

  .tag.up {
    color: #ff6b1a;
  }

  .scan {
    padding-top: 28px;
  }

  .bar {
    height: 4px;
    border-radius: 999px;
    background: #222;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: #ff6b1a;
    border-radius: 999px;
    transition: width 0.6s ease;
  }

  .hint {
    margin-top: 14px;
    font-size: 13px;
    color: #9a9a9a;
  }

  .chart-scene {
    position: relative;
    padding-top: 8px;
  }

  .spark {
    width: 100%;
    height: auto;
    opacity: 0.95;
  }

  .alert-pill {
    position: absolute;
    right: 8px;
    top: 18px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 107, 26, 0.15);
    border: 1px solid rgba(255, 107, 26, 0.45);
    color: #ff6b1a;
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  @media (max-width: 768px) {
    .board {
      grid-template-columns: repeat(2, minmax(140px, 1fr));
      padding-left: 16px;
    }

    .focus {
      margin-top: 24px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scene-in {
      animation: none;
    }
  }
</style>
