<script>
  import { initiateLogin } from '../lib/auth/tradovate';
  import { authStore } from '../stores/auth';
  import { onMount } from 'svelte';
  
  let loading = false;
  let error = null;
  let taglineVisible = false;
  let subheadlineVisible = false;
  let metrics = [
    { symbol: 'BTC', price: 43250.50, change: 1.2 },
    { symbol: 'SPY', price: 478.32, change: 0.5 },
    { symbol: 'QQQ', price: 412.18, change: -0.3 },
    { symbol: 'ETH', price: 2650.75, change: 2.1 },
    { symbol: 'AAPL', price: 195.42, change: 0.8 },
    { symbol: 'TSLA', price: 248.67, change: -1.5 }
  ];
  let currentMetricIndex = 0;
  let currentGraphIndex = 0;
  
  // Graph data structures
  const graphs = [
    {
      id: 'pnl-hrv',
      title: 'PnL vs HRV',
      xAxis: 'HRV',
      yAxis: 'P&L ($)',
      path: 'M 40 160 L 80 140 L 120 120 L 160 100 L 200 80 L 240 70 L 280 65 L 320 60 L 360 55',
      fillPath: 'M 40 160 L 80 140 L 120 120 L 160 100 L 200 80 L 240 70 L 280 65 L 320 60 L 360 55 L 360 200 L 40 200 Z',
      gradientId: 'gradientPnlHrv',
      gradientColors: ['rgba(6, 182, 212, 0.8)', 'rgba(34, 211, 238, 0.3)', 'rgba(6, 182, 212, 0)'],
      lineColor: '#06b6d4',
      dataPoints: [
        { x: 80, y: 140, label: 'HRV: 45', value: '$2,500' },
        { x: 200, y: 80, label: 'HRV: 30', value: '$8,200' },
        { x: 320, y: 60, label: 'HRV: 20', value: '$12,400' }
      ],
      description: 'Lower HRV correlates with better P&L'
    },
    {
      id: 'sleep-hrv',
      title: 'Sleep Score vs HRV',
      xAxis: 'HRV',
      yAxis: 'Sleep Score',
      path: 'M 40 180 L 80 160 L 120 140 L 160 120 L 200 100 L 240 85 L 280 75 L 320 70 L 360 65',
      fillPath: 'M 40 180 L 80 160 L 120 140 L 160 120 L 200 100 L 240 85 L 280 75 L 320 70 L 360 65 L 360 200 L 40 200 Z',
      gradientId: 'gradientSleepHrv',
      gradientColors: ['rgba(168, 85, 247, 0.8)', 'rgba(192, 132, 252, 0.3)', 'rgba(168, 85, 247, 0)'],
      lineColor: '#a855f7',
      dataPoints: [
        { x: 100, y: 150, label: 'HRV: 50', value: 'Score: 72' },
        { x: 200, y: 100, label: 'HRV: 35', value: 'Score: 88' },
        { x: 320, y: 70, label: 'HRV: 25', value: 'Score: 92' }
      ],
      description: 'Higher HRV improves sleep quality'
    },
    {
      id: 'stress-pnl',
      title: 'Stress vs PnL',
      xAxis: 'Stress Level',
      yAxis: 'P&L ($)',
      path: 'M 40 60 L 80 70 L 120 85 L 160 100 L 200 110 L 240 125 L 280 140 L 320 155 L 360 170',
      fillPath: 'M 40 60 L 80 70 L 120 85 L 160 100 L 200 110 L 240 125 L 280 140 L 320 155 L 360 170 L 360 200 L 40 200 Z',
      gradientId: 'gradientStressPnl',
      gradientColors: ['rgba(251, 146, 60, 0.8)', 'rgba(249, 115, 22, 0.3)', 'rgba(251, 146, 60, 0)'],
      lineColor: '#fb923c',
      dataPoints: [
        { x: 80, y: 70, label: 'Stress: Low', value: '$11,500' },
        { x: 200, y: 110, label: 'Stress: Med', value: '$6,200' },
        { x: 320, y: 155, label: 'Stress: High', value: '$1,800' }
      ],
      description: 'Lower stress leads to better performance'
    }
  ];
  
  // Check if already authenticated
  onMount(() => {
    if ($authStore.isAuthenticated) {
      window.location.hash = '/dashboard';
    }

    // Create gradient mesh orbs
    createGradientOrbs();

    // Create particle system
    createParticleSystem();

    // Create pulsing circles
    createPulsingCircles();

    // Setup scroll animations
    setupScrollAnimations();
    
    // Setup stats counter animation
    const statsObserver = new IntersectionObserver(animateStats, {
      threshold: 0.5
    });
    
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      statsObserver.observe(statsSection);
    }

    // Animate tagline
    setTimeout(() => {
      taglineVisible = true;
    }, 300);

    // Animate subheadline
    setTimeout(() => {
      subheadlineVisible = true;
    }, 800);

    // Setup parallax effect
    setupParallax();

    // Rotate metrics ticker
    const metricsInterval = setInterval(() => {
      currentMetricIndex = (currentMetricIndex + 1) % metrics.length;
    }, 3000);
    
    // Setup graph cycling
    const graphInterval = setInterval(() => {
      currentGraphIndex = (currentGraphIndex + 1) % graphs.length;
    }, 7000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(graphInterval);
    };
  });
  
  async function handleLogin() {
    loading = true;
    error = null;
    try {
      // Clear any old OAuth state before starting new flow
      sessionStorage.removeItem('oauth_state');
      await initiateLogin();
    } catch (err) {
      console.error('Login error:', err);
      error = err.message || 'Failed to initiate login';
      loading = false;
    }
  }

  function createGradientOrbs() {
    const container = document.querySelector('.mesh-gradient-bg');
    if (!container) return;

    // Create 3 large gradient orbs for mesh effect
    const orbCount = 3;
    for (let i = 0; i < orbCount; i++) {
      const orb = document.createElement('div');
      orb.className = `gradient-orb orb-${i + 1}`;
      container.appendChild(orb);
    }
  }

  function createParticleSystem() {
    const container = document.querySelector('.mesh-gradient-bg');
    if (!container) return;

    const particleCount = 30;
    const sizes = ['particle-small', 'particle-medium', 'particle-large'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      particle.className = `particle ${size}`;
      
      // Random starting position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      
      container.appendChild(particle);
    }
  }

  function createPulsingCircles() {
    const container = document.querySelector('.mesh-gradient-bg');
    if (!container) return;

    const circleCount = 5;
    const sizes = [100, 150, 200];
    
    for (let i = 0; i < circleCount; i++) {
      const circle = document.createElement('div');
      circle.className = 'pulsing-circle';
      
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      circle.style.width = size + 'px';
      circle.style.height = size + 'px';
      circle.style.left = Math.random() * 80 + 10 + '%';
      circle.style.top = Math.random() * 80 + 10 + '%';
      circle.style.animationDelay = Math.random() * 4 + 's';
      
      container.appendChild(circle);
    }
  }

  let statsAnimated = false;

  function animateCounter(element, target, suffix = '', duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      if (suffix === '%') {
        element.textContent = current.toFixed(1) + suffix;
      } else if (target >= 1000000) {
        element.textContent = '$' + (current / 1000000).toFixed(0) + 'M+';
      } else {
        element.textContent = (current / 1000).toFixed(0) + 'K+';
      }
    }, 16);
  }

  function animateStats(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        
        // Animate each stat
        const tradersEl = document.querySelector('.counter-traders');
        const volumeEl = document.querySelector('.counter-volume');
        const uptimeEl = document.querySelector('.counter-uptime');
        
        if (tradersEl) animateCounter(tradersEl, 10000, '', 2000);
        if (volumeEl) animateCounter(volumeEl, 50000000, '', 2000);
        if (uptimeEl) animateCounter(uptimeEl, 99.9, '%', 2000);
      }
    });
  }

  function setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  function scrollToLogin() {
    document.querySelector('#login-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }

  function setupParallax() {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-layer');
      parallaxElements.forEach((el, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }

  function formatPrice(price) {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  function getChangeColor(change) {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  }

  function getChangeSymbol(change) {
    return change >= 0 ? '+' : '';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg-secondary to-dark-bg-tertiary relative overflow-hidden">
  <!-- Animated Gradient Mesh Background -->
  <div class="mesh-gradient-bg"></div>

  <!-- Animated Live Drawing Heartbeat EKG Lines -->
  <div class="chart-lines">
    <!-- Heartbeat Line 1 - Single continuous path with spike -->
    <div class="heartbeat-container" style="top: 30%;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width: 100%; height: 100px;">
        <defs>
          <linearGradient id="ekgGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(6, 182, 212, 0);stop-opacity:0" />
            <stop offset="10%" style="stop-color:rgba(6, 182, 212, 0.5);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgba(6, 182, 212, 1);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(6, 182, 212, 1);stop-opacity:1" />
            <stop offset="90%" style="stop-color:rgba(34, 211, 238, 0.5);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(34, 211, 238, 0);stop-opacity:0" />
          </linearGradient>
        </defs>
        <path class="ekg-path" 
              d="M 0 50 L 550 50 L 570 50 L 580 20 L 595 80 L 610 10 L 625 50 L 650 50 L 1200 50" 
              fill="none" 
              stroke="url(#ekgGradient1)" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round" />
      </svg>
    </div>
    
    <!-- Heartbeat Line 2 -->
    <div class="heartbeat-container line-2" style="top: 55%;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width: 100%; height: 100px; animation-delay: 4s;">
        <defs>
          <linearGradient id="ekgGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(168, 85, 247, 0);stop-opacity:0" />
            <stop offset="10%" style="stop-color:rgba(168, 85, 247, 0.5);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgba(168, 85, 247, 1);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(168, 85, 247, 1);stop-opacity:1" />
            <stop offset="90%" style="stop-color:rgba(192, 132, 252, 0.5);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(192, 132, 252, 0);stop-opacity:0" />
          </linearGradient>
        </defs>
        <path class="ekg-path" 
              d="M 0 50 L 555 50 L 575 50 L 585 22 L 600 78 L 615 12 L 630 50 L 655 50 L 1200 50" 
              fill="none" 
              stroke="url(#ekgGradient2)" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round" />
      </svg>
    </div>
    
    <!-- Heartbeat Line 3 -->
    <div class="heartbeat-container line-3" style="top: 75%;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width: 100%; height: 100px; animation-delay: 8s;">
        <defs>
          <linearGradient id="ekgGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(34, 211, 238, 0);stop-opacity:0" />
            <stop offset="10%" style="stop-color:rgba(34, 211, 238, 0.5);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgba(34, 211, 238, 1);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(34, 211, 238, 1);stop-opacity:1" />
            <stop offset="90%" style="stop-color:rgba(6, 182, 212, 0.5);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(6, 182, 212, 0);stop-opacity:0" />
          </linearGradient>
        </defs>
        <path class="ekg-path" 
              d="M 0 50 L 560 50 L 580 50 L 590 24 L 605 76 L 620 14 L 635 50 L 660 50 L 1200 50" 
              fill="none" 
              stroke="url(#ekgGradient3)" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round" />
      </svg>
    </div>
  </div>

  <!-- Tech Grid Overlay -->
  <div class="tech-grid-overlay"></div>

  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center justify-center px-6 py-24">
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Column: Content (Asymmetric Layout) -->
        <div class="text-left lg:pl-8 relative">
          <!-- Code Accent -->
          <div class="code-accent mb-6">
            <span class="text-sm font-mono text-dark-text-muted">{'const trading = {'}</span>
          </div>

          <!-- Live Metrics Ticker -->
          <div class="live-metrics-ticker mb-8">
            <div class="inline-flex items-center space-x-3 px-4 py-2 glass-card rounded-lg">
              <div class="live-badge">
                <span class="live-dot"></span>
                <span class="text-xs font-mono text-dark-text-muted ml-2">LIVE</span>
              </div>
              <div class="flex items-center space-x-4">
                {#key currentMetricIndex}
                  <div class="metric-item">
                    <span class="text-xs font-mono text-dark-text-muted">{metrics[currentMetricIndex].symbol}</span>
                    <span class="text-sm font-semibold text-dark-text ml-2">
                      {'$' + formatPrice(metrics[currentMetricIndex].price)}
                    </span>
                    <span class="text-xs font-mono ml-2 {getChangeColor(metrics[currentMetricIndex].change)}">
                      {getChangeSymbol(metrics[currentMetricIndex].change)}{metrics[currentMetricIndex].change.toFixed(2)}%
                    </span>
                  </div>
                {/key}
              </div>
            </div>
          </div>

          <!-- Hero Title with Display Font -->
          <div class="fade-in delay-100">
            <h1 class="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.95] tracking-tight">
              <span class="gradient-text display-font">TradeState</span>
            </h1>
            
            <!-- Animated Tagline -->
            <div class="mb-6">
              <p class="text-xl md:text-2xl lg:text-3xl text-dark-text-secondary font-medium mb-4 max-w-xl tagline-text {taglineVisible ? 'tagline-visible' : ''}">
                Where your physiology meets your P&L
              </p>
              
              <!-- Subheadline Value Proposition -->
              <p class="text-base md:text-lg text-dark-text-muted max-w-xl subheadline-text {subheadlineVisible ? 'subheadline-visible' : ''}">
                Real-time biometric insights integrated with your trading performance. 
                <span class="font-mono text-accent-cyan">Optimize. Analyze. Dominate.</span>
              </p>
            </div>

            <!-- CTA Button -->
            <div class="mt-10">
              <button
                on:click={scrollToLogin}
                class="btn-glow inline-flex items-center space-x-3"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get Started Free</span>
              </button>
            </div>
          </div>

          <!-- Code Accent Bottom -->
          <div class="code-accent mt-8">
            <span class="text-sm font-mono text-dark-text-muted">};</span>
          </div>
        </div>

        <!-- Right Column: Chart Preview -->
        <div class="relative lg:pr-8 parallax-layer">
          <div class="chart-preview-container">
            <!-- Mini Chart Preview -->
            <div class="mini-chart-wrapper">
              {#each graphs as graph, index}
                <div class="graph-transition {index === currentGraphIndex ? 'graph-visible' : 'graph-hidden'}" style="position: {index === currentGraphIndex ? 'relative' : 'absolute'}; top: 0; left: 0; width: 100%; height: 100%;">
                  <svg class="mini-chart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id={graph.gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:{graph.gradientColors[0]};stop-opacity:1" />
                        <stop offset="50%" style="stop-color:{graph.gradientColors[1]};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:{graph.gradientColors[2]};stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    
                    <!-- Grid lines -->
                    <g opacity="0.2" stroke="#94a3b8" stroke-width="0.5">
                      <line x1="40" y1="20" x2="40" y2="180" />
                      <line x1="40" y1="180" x2="360" y2="180" />
                      {#each Array(5) as _, i}
                        <line x1="40" y1={20 + i * 40} x2="360" y2={20 + i * 40} />
                      {/each}
                    </g>
                    
                    <!-- Chart fill -->
                    <path 
                      class="chart-fill" 
                      d={graph.fillPath}
                      fill={'url(#' + graph.gradientId + ')'}
                    />
                    
                    <!-- Chart line -->
                    <path 
                      class="chart-line" 
                      d={graph.path}
                      fill="none"
                      stroke={graph.lineColor}
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    
                    <!-- Data points -->
                    {#each graph.dataPoints as point}
                      <circle 
                        cx={point.x} 
                        cy={point.y} 
                        r="4" 
                        fill={graph.lineColor}
                        class="data-point"
                        style="animation-delay: {graph.dataPoints.indexOf(point) * 0.3 + 0.5}s"
                      />
                    {/each}
                    
                    <!-- Axis labels -->
                    <text x="200" y="195" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10">
                      {graph.xAxis}
                    </text>
                    <text x="15" y="100" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="10" transform="rotate(-90 15 100)">
                      {graph.yAxis}
                    </text>
                    
                    <!-- Title -->
                    <text x="200" y="15" text-anchor="middle" fill="#f1f5f9" font-family="sans-serif" font-size="12" font-weight="600">
                      {graph.title}
                    </text>
                  </svg>
                  
                  <!-- Data point labels -->
                  <div class="chart-data-overlay">
                    {#each graph.dataPoints as point}
                      <div class="data-point" style="left: {point.x - 30}px; top: {point.y - 40}px;">
                        <div class="text-xs font-mono text-dark-text-muted">{point.label}</div>
                        <div class="text-xs font-semibold" style="color: {graph.lineColor}">{point.value}</div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
              
              <!-- Status Indicator -->
              <div class="absolute top-4 right-4 z-10">
                <div class="live-badge">
                  <span class="live-dot"></span>
                  <span class="text-xs font-mono text-dark-text-muted ml-2">REAL-TIME</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 scroll-indicator">
        <svg class="w-6 h-6 text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  <section class="relative py-16 px-6 stats-section">
    <div class="max-w-6xl mx-auto">
      <div class="glass-card rounded-2xl p-8 animate-on-scroll">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="counter counter-traders">10,000+</div>
            <p class="text-dark-text-muted mt-2">Active Traders</p>
          </div>
          <div class="border-l border-r border-dark-text-muted/20">
            <div class="counter counter-volume">$50M+</div>
            <p class="text-dark-text-muted mt-2">Trading Volume</p>
          </div>
          <div>
            <div class="counter counter-uptime">99.9%</div>
            <p class="text-dark-text-muted mt-2">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="relative py-16 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12 animate-on-scroll">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">
          <span class="gradient-text-alt">Powerful Features</span>
        </h2>
        <p class="text-xl text-dark-text-muted">Everything you need to trade smarter</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Feature 1: Security -->
        <div class="feature-card animate-on-scroll delay-100">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-dark-text mb-2">Bank-Level Security</h3>
          <p class="text-dark-text-muted">OAuth 2.0 authentication with enterprise-grade encryption</p>
        </div>

        <!-- Feature 2: Real-time -->
        <div class="feature-card animate-on-scroll delay-200">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-dark-text mb-2">Real-Time Data</h3>
          <p class="text-dark-text-muted">Live market data and instant trade execution</p>
        </div>

        <!-- Feature 3: Analytics -->
        <div class="feature-card animate-on-scroll delay-300">
          <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-dark-text mb-2">Advanced Analytics</h3>
          <p class="text-dark-text-muted">Deep insights into your trading performance</p>
        </div>

        <!-- Feature 4: Integration -->
        <div class="feature-card animate-on-scroll delay-400">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-dark-text mb-2">Easy Integration</h3>
          <p class="text-dark-text-muted">Connect multiple brokerages in one dashboard</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Login Section -->
  <section id="login-section" class="relative py-24 px-6">
    <div class="max-w-md mx-auto">
      <div class="glass-card rounded-2xl p-8 shadow-2xl animate-on-scroll">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-dark-text mb-2">Start Trading</h2>
          <p class="text-dark-text-muted">Connect your Tradovate account to begin</p>
        </div>
        
        <!-- Login Button -->
        <div class="space-y-4">
          {#if error}
            <div class="p-3 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-lg">
              <p class="text-sm text-red-400">{error}</p>
            </div>
          {/if}
          
          <button
            on:click={handleLogin}
            disabled={loading}
            class="w-full btn-glow flex items-center justify-center space-x-3"
          >
            {#if loading}
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting...</span>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Connect with Tradovate</span>
            {/if}
          </button>
          
          <div class="text-center">
            <p class="text-xs text-dark-text-muted">
              By connecting, you agree to our <button class="text-accent-cyan hover:underline">Terms of Service</button> and <button class="text-accent-cyan hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>
        
        <!-- Benefits List -->
        <div class="mt-8 pt-6 border-t border-dark-text-muted/20">
          <ul class="space-y-3 text-sm text-dark-text-secondary">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure OAuth 2.0 authentication</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant access to your trading data</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Support Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-dark-text-muted">
          Need help? <button class="text-accent-cyan hover:text-accent-cyan-light font-semibold underline">Contact Support</button>
        </p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="relative py-12 px-6 border-t border-dark-text-muted/20">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="flex items-center space-x-2 mb-4 md:mb-0">
          <svg class="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-lg font-bold text-dark-text">TradeState</span>
        </div>
        <p class="text-sm text-dark-text-muted">© 2025 TradeState. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Additional component-specific styles */
  :global(.animate-on-scroll) {
    opacity: 0;
  }
</style>

