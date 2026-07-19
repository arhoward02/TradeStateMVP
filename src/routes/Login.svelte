<script>
  import { authStore } from '../stores/auth';
  import { onMount } from 'svelte';
  import SectorCube from '../components/SectorCube.svelte';
  import ProductPreviewLoop from '../components/ProductPreviewLoop.svelte';
  import GlowIcon from '../components/GlowIcon.svelte';
  import NodeGlow from '../components/NodeGlow.svelte';

  let loading = false;
  let error = null;
  let taglineVisible = false;
  let subheadlineVisible = false;

  const features = [
    {
      variant: 'orderbook',
      title: 'Bank-Level Security',
      body: 'OAuth 2.0 authentication with enterprise-grade encryption',
    },
    {
      variant: 'chart',
      title: 'Real-Time Data',
      body: 'Live market data and instant trade execution',
    },
    {
      variant: 'candles',
      title: 'Advanced Analytics',
      body: 'Deep insights into your trading performance',
    },
    {
      variant: 'sectors',
      title: 'Easy Integration',
      body: 'Connect multiple brokerages in one dashboard',
    },
  ];

  onMount(() => {
    const unsubscribe = authStore.subscribe((state) => {
      if (!state.loading && state.isAuthenticated) {
        window.location.hash = '/dashboard';
      }
    });

    const t1 = setTimeout(() => { taglineVisible = true; }, 280);
    const t2 = setTimeout(() => { subheadlineVisible = true; }, 700);

    return () => {
      unsubscribe();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  });

  async function handleLogin() {
    loading = true;
    error = null;
    try {
      await authStore.loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      error = err.message || 'Failed to start Google login';
      loading = false;
    }
  }

  function scrollToLogin() {
    document.querySelector('#login-section')?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<div class="page">
  <!-- Raycast-style floating toolbar -->
  <nav class="toolbar">
    <a href="#/" class="toolbar-brand display-font">TradeState</a>
    <div class="toolbar-links">
      <a href="/leading-groups.html">Leading Groups</a>
      <a href="/study.html">Study Gallery</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-grid">
      <div class="hero-copy">
        <div class="live-row">
          <span class="live-dot"></span>
          <span class="live-label">Live market intelligence</span>
        </div>

        <h1 class="display-font brand">TradeState</h1>

        <p class="tagline tagline-text {taglineVisible ? 'tagline-visible' : ''}">
          Where your physiology meets your P&amp;L
        </p>

        <p class="subhead subheadline-text {subheadlineVisible ? 'subheadline-visible' : ''}">
          Real-time biometric insights integrated with your trading performance.
        </p>

        <div class="cta-row">
          <span class="race">
            <button type="button" class="btn-primary btn-beta" on:click={scrollToLogin}>
              Join Beta Now
            </button>
          </span>
        </div>
      </div>

      <div class="hero-visual">
        <NodeGlow weight={1.4} stars_enabled={false} glow_scale={0.55}>
          <SectorCube />
        </NodeGlow>
      </div>
    </div>
  </section>

  <!-- Product preview -->
  <section class="section-pad preview-section">
    <div class="section-inner">
      <div class="section-head">
        <h2 class="display-font">See it in motion</h2>
        <p>A live walkthrough of scanning leaders, themes, and alerts.</p>
      </div>
      <NodeGlow weight={1.6} bordered>
        <ProductPreviewLoop />
      </NodeGlow>
    </div>
  </section>

  <!-- Features -->
  <section class="section-pad">
    <div class="section-inner">
      <div class="section-head">
        <h2 class="display-font">Built for serious traders</h2>
        <p>Everything you need to trade smarter.</p>
      </div>

      <div class="feature-grid">
        {#each features as feature}
          <div class="feature-card">
            <GlowIcon variant={feature.variant} />
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="section-pad stats-section">
    <div class="section-inner stats-row">
      <div>
        <div class="stat-num display-font">10,000+</div>
        <p>Active Traders</p>
      </div>
      <div>
        <div class="stat-num display-font">$50M+</div>
        <p>Trading Volume</p>
      </div>
      <div>
        <div class="stat-num display-font">99.9%</div>
        <p>Uptime</p>
      </div>
    </div>
  </section>

  <!-- Login -->
  <section id="login-section" class="section-pad">
    <div class="login-frame">
      <NodeGlow weight={1.3} bordered>
        <div class="login-card glass-card">
        <h2 class="display-font">Sign in</h2>
        <p class="login-sub">Log in with Google to save your trade journal to the cloud.</p>

        {#if error}
          <div class="error">{error}</div>
        {/if}

        <button type="button" class="btn-primary w-full" on:click={handleLogin} disabled={loading}>
          {#if loading}
            Connecting…
          {:else}
            <svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          {/if}
        </button>

        <ul class="perks">
          <li>Secure Google sign-in via Supabase</li>
          <li>Trade journal backed up to the cloud</li>
          <li>No credit card required</li>
        </ul>
        </div>
      </NodeGlow>
    </div>
  </section>

  <footer class="footer">
    <span class="display-font">TradeState</span>
    <span>© 2026 TradeState. All rights reserved.</span>
  </footer>
</div>

<style>
  .page {
    position: relative;
    min-height: 100vh;
    background: #0a0a0a;
    overflow-x: hidden;
  }

  .hero {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 6rem 1.5rem 4rem;
  }

  .hero-grid {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    display: grid;
    gap: 3rem;
    align-items: center;
  }

  @media (min-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1.1fr 0.9fr;
      gap: 4rem;
    }
  }

  .live-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.5rem;
  }

  .live-label {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9a9a9a;
  }

  .brand {
    margin: 0 0 1.25rem;
    font-size: clamp(3.5rem, 9vw, 6.5rem);
    font-weight: 700;
    line-height: 0.92;
    letter-spacing: -0.04em;
    color: #fff;
  }

  .tagline {
    margin: 0 0 0.75rem;
    max-width: 28rem;
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    font-weight: 500;
    color: #b0b0b0;
    line-height: 1.35;
  }

  .subhead {
    margin: 0;
    max-width: 28rem;
    font-size: 1rem;
    line-height: 1.6;
    color: #9a9a9a;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2.25rem;
  }

  /* ----- Raycast-style floating toolbar ----- */
  .toolbar {
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 1.75rem;
    width: min(960px, calc(100vw - 2rem));
    height: 46px;
    padding: 0 1rem;
    background: rgba(19, 19, 22, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .toolbar-brand {
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: -0.02em;
    text-decoration: none;
  }

  .toolbar-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .toolbar-links a {
    color: #a1a1a6;
    font-size: 0.82rem;
    font-weight: 500;
    text-decoration: none;
    padding: 0.35rem 0.7rem;
    border-radius: 8px;
    transition: color 0.15s ease, text-shadow 0.15s ease;
  }

  .toolbar-links a:hover {
    color: #fff;
    text-shadow: 0 0 14px rgba(255, 255, 255, 0.5);
  }

  /* ----- Racetrack light around the beta CTA ----- */
  .race {
    position: relative;
    display: inline-flex;
    padding: 1.5px;
    border-radius: 9999px;
    overflow: hidden;
    isolation: isolate;
  }

  /* Oversized spinning conic gradient: faint static track + one bright comet
     lapping the border like a racecar. Only the 1.5px ring is visible. */
  .race::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 340%;
    aspect-ratio: 1 / 1;
    z-index: -1;
    transform: translate(-50%, -50%) rotate(0turn);
    background: conic-gradient(
      from 0deg,
      rgba(255, 107, 26, 0.12) 0deg,
      rgba(255, 107, 26, 0.12) 300deg,
      rgba(255, 107, 26, 0.45) 332deg,
      rgba(255, 122, 41, 0.95) 356deg,
      rgba(255, 107, 26, 0.12) 360deg
    );
    animation: raceLap 3.2s linear infinite;
  }

  @keyframes raceLap {
    to {
      transform: translate(-50%, -50%) rotate(1turn);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .race::before {
      animation: none;
    }
  }

  /* 50% smaller beta CTA, pill-shaped to match the track.
     Hollow, Raycast-style: near-black inside, just the words —
     the racetrack comet is the only border. */
  .btn-beta {
    padding: 0.45rem 0.9rem;
    font-size: 0.8rem;
    border-radius: 9999px;
    background: #0b0b0b;
    color: #f5f5f5;
    font-weight: 500;
  }

  .btn-beta:hover {
    background: #131313;
    color: #fff;
  }

  .hero-visual {
    position: relative;
    z-index: 1;
  }

  .section-inner {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin: 0 auto;
  }

  .section-head {
    text-align: center;
    margin-bottom: 3rem;
  }

  .section-head h2 {
    margin: 0 0 0.75rem;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #fff;
  }

  .section-head p {
    margin: 0;
    color: #9a9a9a;
    font-size: 1.05rem;
  }

  .preview-section {
    padding-top: 2rem;
    overflow: hidden;
  }

  .preview-section .section-inner {
    max-width: 1100px;
  }

  .feature-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .feature-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .feature-card h3 {
    margin: 1rem 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }

  .feature-card p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: #9a9a9a;
  }

  .stats-row {
    display: grid;
    gap: 2.5rem;
    text-align: center;
    border-top: 1px solid #222;
    border-bottom: 1px solid #222;
    padding: 3rem 0;
  }

  @media (min-width: 768px) {
    .stats-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .stat-num {
    font-size: 2.5rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #fff;
  }

  .stats-row p {
    margin: 0.4rem 0 0;
    color: #9a9a9a;
    font-size: 0.95rem;
  }

  /* Constrains the bordered star-anchor frame to hug the card (card width + frame padding). */
  .login-frame {
    max-width: calc(420px + 2.5rem);
    margin: 0 auto;
  }

  .login-card {
    position: relative;
    z-index: 1;
    max-width: 420px;
    margin: 0 auto;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    text-align: center;
  }

  .login-card h2 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    letter-spacing: -0.03em;
  }

  .login-sub {
    margin: 0 0 1.75rem;
    color: #9a9a9a;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .error {
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    background: rgba(255, 82, 102, 0.12);
    border: 1px solid rgba(255, 82, 102, 0.35);
    color: #ff8a96;
    font-size: 0.875rem;
  }

  .w-full {
    width: 100%;
  }

  .g-icon {
    width: 18px;
    height: 18px;
  }

  .perks {
    list-style: none;
    margin: 1.75rem 0 0;
    padding: 1.5rem 0 0;
    border-top: 1px solid #222;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .perks li {
    position: relative;
    padding-left: 1.1rem;
    font-size: 0.875rem;
    color: #b0b0b0;
  }

  .perks li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.45em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff6b1a;
  }

  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    max-width: 1120px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 3rem;
    border-top: 1px solid #222;
    color: #9a9a9a;
    font-size: 0.875rem;
  }

  .footer .display-font {
    color: #fff;
    font-weight: 600;
  }
</style>
