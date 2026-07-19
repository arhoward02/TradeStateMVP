<script>
  import { onMount } from 'svelte';

  let reduceMotion = false;
  let isMobile = false;

  const faces = [
    { label: 'Tech', accent: true },
    { label: 'Energy', accent: false },
    { label: 'Health', accent: false },
    { label: 'Finance', accent: false },
    { label: 'Consumer', accent: false },
    { label: 'Materials', accent: false },
  ];

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isMobile = window.matchMedia('(max-width: 768px)').matches;
  });
</script>

<div class="cube-wrap" aria-hidden="true">
  <div
    class="scene"
    class:static={reduceMotion || isMobile}
  >
    <div class="cube">
      {#each faces as face, i}
        <div class="face face-{i}" class:accent={face.accent}>
          <span class="label">{face.label}</span>
          <span class="bars"></span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .cube-wrap {
    position: relative;
    width: 100%;
    max-width: 420px;
    aspect-ratio: 1;
    margin: 0 auto;
    perspective: 900px;
  }

  .scene {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    transform-style: preserve-3d;
  }

  .cube {
    position: relative;
    width: 160px;
    height: 160px;
    transform-style: preserve-3d;
    animation: tumble 28s linear infinite;
  }

  .scene.static .cube {
    animation: none;
    transform: rotateX(-22deg) rotateY(32deg);
  }

  .face {
    position: absolute;
    width: 160px;
    height: 160px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(17, 17, 17, 0.92);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    backface-visibility: visible;
  }

  .face.accent {
    border-color: rgba(255, 107, 26, 0.55);
    background: rgba(255, 107, 26, 0.08);
    box-shadow: inset 0 0 40px rgba(255, 107, 26, 0.12);
  }

  .label {
    font-family: 'Space Grotesk', Inter, sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #b0b0b0;
  }

  .face.accent .label {
    color: #ff6b1a;
  }

  .bars {
    width: 72px;
    height: 36px;
    background:
      linear-gradient(#9a9a9a, #9a9a9a) 0 100% / 10px 40% no-repeat,
      linear-gradient(#9a9a9a, #9a9a9a) 16px 100% / 10px 70% no-repeat,
      linear-gradient(#9a9a9a, #9a9a9a) 32px 100% / 10px 55% no-repeat,
      linear-gradient(#9a9a9a, #9a9a9a) 48px 100% / 10px 85% no-repeat,
      linear-gradient(#9a9a9a, #9a9a9a) 64px 100% / 10px 45% no-repeat;
    opacity: 0.45;
  }

  .face.accent .bars {
    background:
      linear-gradient(#ff6b1a, #ff6b1a) 0 100% / 10px 40% no-repeat,
      linear-gradient(#ff6b1a, #ff6b1a) 16px 100% / 10px 70% no-repeat,
      linear-gradient(#ff6b1a, #ff6b1a) 32px 100% / 10px 55% no-repeat,
      linear-gradient(#ff6b1a, #ff6b1a) 48px 100% / 10px 85% no-repeat,
      linear-gradient(#ff6b1a, #ff6b1a) 64px 100% / 10px 45% no-repeat;
    opacity: 0.85;
  }

  .face-0 { transform: rotateY(0deg) translateZ(80px); }
  .face-1 { transform: rotateY(90deg) translateZ(80px); }
  .face-2 { transform: rotateY(180deg) translateZ(80px); }
  .face-3 { transform: rotateY(-90deg) translateZ(80px); }
  .face-4 { transform: rotateX(90deg) translateZ(80px); }
  .face-5 { transform: rotateX(-90deg) translateZ(80px); }

  @keyframes tumble {
    0% { transform: rotateX(-18deg) rotateY(0deg) rotateZ(0deg); }
    25% { transform: rotateX(12deg) rotateY(90deg) rotateZ(4deg); }
    50% { transform: rotateX(-10deg) rotateY(180deg) rotateZ(-2deg); }
    75% { transform: rotateX(16deg) rotateY(270deg) rotateZ(3deg); }
    100% { transform: rotateX(-18deg) rotateY(360deg) rotateZ(0deg); }
  }

  @media (max-width: 768px) {
    .cube-wrap {
      max-width: 280px;
    }
    .cube,
    .face {
      width: 120px;
      height: 120px;
    }
    .face-0 { transform: rotateY(0deg) translateZ(60px); }
    .face-1 { transform: rotateY(90deg) translateZ(60px); }
    .face-2 { transform: rotateY(180deg) translateZ(60px); }
    .face-3 { transform: rotateY(-90deg) translateZ(60px); }
    .face-4 { transform: rotateX(90deg) translateZ(60px); }
    .face-5 { transform: rotateX(-90deg) translateZ(60px); }
  }
</style>
