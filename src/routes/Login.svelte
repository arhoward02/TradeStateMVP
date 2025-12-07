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
  
  // Check if already authenticated
  onMount(() => {
    if ($authStore.isAuthenticated) {
      window.location.hash = '/dashboard';
    }

    // Create gradient mesh orbs
    createGradientOrbs();

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

    return () => clearInterval(metricsInterval);
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

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
  <!-- Animated Gradient Mesh Background -->
  <div class="mesh-gradient-bg"></div>

  <!-- Animated Live Drawing Heartbeat EKG Lines -->
  <div class="chart-lines">
    <!-- Heartbeat Line 1 - Single continuous path with spike -->
    <div class="heartbeat-container" style="top: 30%;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="width: 100%; height: 100px;">
        <defs>
          <linearGradient id="ekgGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(14, 165, 233, 0);stop-opacity:0" />
            <stop offset="10%" style="stop-color:rgba(14, 165, 233, 0.4);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgba(14, 165, 233, 0.9);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(14, 165, 233, 0.9);stop-opacity:1" />
            <stop offset="90%" style="stop-color:rgba(59, 130, 246, 0.4);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(59, 130, 246, 0);stop-opacity:0" />
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
            <stop offset="0%" style="stop-color:rgba(139, 92, 246, 0);stop-opacity:0" />
            <stop offset="10%" style="stop-color:rgba(139, 92, 246, 0.4);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgba(139, 92, 246, 0.9);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(139, 92, 246, 0.9);stop-opacity:1" />
            <stop offset="90%" style="stop-color:rgba(168, 85, 247, 0.4);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(168, 85, 247, 0);stop-opacity:0" />
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
            <stop offset="0%" style="stop-color:rgba(59, 130, 246, 0);stop-opacity:0" />
            <stop offset="10%" style="stop-color:rgba(59, 130, 246, 0.4);stop-opacity:1" />
            <stop offset="40%" style="stop-color:rgba(59, 130, 246, 0.9);stop-opacity:1" />
            <stop offset="60%" style="stop-color:rgba(59, 130, 246, 0.9);stop-opacity:1" />
            <stop offset="90%" style="stop-color:rgba(14, 165, 233, 0.4);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0);stop-opacity:0" />
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
            <span class="text-sm font-mono text-gray-400">{'const trading = {'}</span>
          </div>

          <!-- Live Metrics Ticker -->
          <div class="live-metrics-ticker mb-8">
            <div class="inline-flex items-center space-x-3 px-4 py-2 glass-card rounded-lg">
              <div class="live-badge">
                <span class="live-dot"></span>
                <span class="text-xs font-mono text-gray-600 ml-2">LIVE</span>
              </div>
              <div class="flex items-center space-x-4">
                {#key currentMetricIndex}
                  <div class="metric-item">
                    <span class="text-xs font-mono text-gray-500">{metrics[currentMetricIndex].symbol}</span>
                    <span class="text-sm font-semibold text-gray-900 ml-2">
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
              <p class="text-xl md:text-2xl lg:text-3xl text-gray-700 font-medium mb-4 max-w-xl tagline-text {taglineVisible ? 'tagline-visible' : ''}">
                Where your physiology meets your P&L
              </p>
              
              <!-- Subheadline Value Proposition -->
              <p class="text-base md:text-lg text-gray-600 max-w-xl subheadline-text {subheadlineVisible ? 'subheadline-visible' : ''}">
                Real-time biometric insights integrated with your trading performance. 
                <span class="font-mono text-primary-600">Optimize. Analyze. Dominate.</span>
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
            <span class="text-sm font-mono text-gray-400">};</span>
          </div>
        </div>

        <!-- Right Column: Chart Preview -->
        <div class="relative lg:pr-8 parallax-layer">
          <div class="chart-preview-container">
            <!-- Mini Chart Preview -->
            <div class="mini-chart-wrapper">
              <svg class="mini-chart" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(14, 165, 233, 0.3);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0);stop-opacity:1" />
                  </linearGradient>
                </defs>
                <path 
                  class="chart-line" 
                  d="M 0 150 Q 50 120, 100 100 T 200 80 T 300 60 T 400 40"
                  fill="none"
                  stroke="url(#chartGradient)"
                  stroke-width="3"
                />
                <path 
                  class="chart-fill" 
                  d="M 0 150 Q 50 120, 100 100 T 200 80 T 300 60 T 400 40 L 400 200 L 0 200 Z"
                  fill="url(#chartGradient)"
                />
              </svg>
              
              <!-- Status Indicator -->
              <div class="absolute top-4 right-4">
                <div class="live-badge">
                  <span class="live-dot"></span>
                  <span class="text-xs font-mono text-gray-600 ml-2">REAL-TIME</span>
                </div>
              </div>

              <!-- Chart Data Points -->
              <div class="chart-data-overlay">
                <div class="data-point" style="left: 20%; top: 30%;">
                  <span class="font-mono text-xs text-gray-500">$43,250</span>
                </div>
                <div class="data-point" style="left: 50%; top: 20%;">
                  <span class="font-mono text-xs text-gray-500">$47,832</span>
                </div>
                <div class="data-point" style="left: 80%; top: 10%;">
                  <span class="font-mono text-xs text-green-500">+12.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 scroll-indicator">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div class="counter">10,000+</div>
            <p class="text-gray-600 mt-2">Active Traders</p>
          </div>
          <div class="border-l border-r border-white/30">
            <div class="counter">$50M+</div>
            <p class="text-gray-600 mt-2">Trading Volume</p>
          </div>
          <div>
            <div class="counter">99.9%</div>
            <p class="text-gray-600 mt-2">Uptime</p>
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
        <p class="text-xl text-gray-600">Everything you need to trade smarter</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Feature 1: Security -->
        <div class="feature-card animate-on-scroll delay-100">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
          <p class="text-gray-600">OAuth 2.0 authentication with enterprise-grade encryption</p>
        </div>

        <!-- Feature 2: Real-time -->
        <div class="feature-card animate-on-scroll delay-200">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Real-Time Data</h3>
          <p class="text-gray-600">Live market data and instant trade execution</p>
        </div>

        <!-- Feature 3: Analytics -->
        <div class="feature-card animate-on-scroll delay-300">
          <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
          <p class="text-gray-600">Deep insights into your trading performance</p>
        </div>

        <!-- Feature 4: Integration -->
        <div class="feature-card animate-on-scroll delay-400">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
          <p class="text-gray-600">Connect multiple brokerages in one dashboard</p>
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
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Start Trading</h2>
          <p class="text-gray-600">Connect your Tradovate account to begin</p>
        </div>
        
        <!-- Login Button -->
        <div class="space-y-4">
          {#if error}
            <div class="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{error}</p>
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
            <p class="text-xs text-gray-500">
              By connecting, you agree to our <button class="text-primary-600 hover:underline">Terms of Service</button> and <button class="text-primary-600 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>
        
        <!-- Benefits List -->
        <div class="mt-8 pt-6 border-t border-white/30">
          <ul class="space-y-3 text-sm text-gray-700">
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
        <p class="text-sm text-gray-600">
          Need help? <button class="text-primary-600 hover:text-primary-700 font-semibold underline">Contact Support</button>
        </p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="relative py-12 px-6 border-t border-white/30">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="flex items-center space-x-2 mb-4 md:mb-0">
          <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-lg font-bold text-gray-900">TradeState</span>
        </div>
        <p class="text-sm text-gray-600">© 2025 TradeState. All rights reserved.</p>
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

