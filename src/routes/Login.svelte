<script>
  import { initiateLogin } from '../lib/auth/tradovate';
  import { authStore } from '../stores/auth';
  import { onMount } from 'svelte';
  
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
  });
  
  let loading = false;
  let error = null;
  
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
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
  <!-- Animated Gradient Mesh Background -->
  <div class="mesh-gradient-bg"></div>

  <!-- Animated Heartbeat EKG Lines -->
  <div class="chart-lines">
    <!-- Heartbeat Line 1 -->
    <div class="chart-line" style="top: 20%;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d="M 0 50 L 200 50 L 220 50 L 225 30 L 235 70 L 245 20 L 255 50 L 270 50 L 400 50 L 420 50 L 425 35 L 435 65 L 445 25 L 455 50 L 470 50 L 600 50 L 620 50 L 625 32 L 635 68 L 645 22 L 655 50 L 670 50 L 800 50 L 820 50 L 825 33 L 835 67 L 845 23 L 855 50 L 870 50 L 1000 50 L 1020 50 L 1025 34 L 1035 66 L 1045 24 L 1055 50 L 1070 50 L 1200 50" />
      </svg>
    </div>
    
    <!-- Heartbeat Line 2 -->
    <div class="chart-line line-2" style="top: 50%; animation-delay: 3s;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d="M 0 50 L 180 50 L 200 50 L 205 28 L 215 72 L 225 18 L 235 50 L 250 50 L 380 50 L 400 50 L 405 30 L 415 70 L 425 20 L 435 50 L 450 50 L 580 50 L 600 50 L 605 29 L 615 71 L 625 19 L 635 50 L 650 50 L 780 50 L 800 50 L 805 31 L 815 69 L 825 21 L 835 50 L 850 50 L 980 50 L 1000 50 L 1005 27 L 1015 73 L 1025 17 L 1035 50 L 1050 50 L 1200 50" />
      </svg>
    </div>
    
    <!-- Heartbeat Line 3 -->
    <div class="chart-line line-3" style="top: 75%; animation-delay: 6s;">
      <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d="M 0 50 L 190 50 L 210 50 L 215 32 L 225 68 L 235 22 L 245 50 L 260 50 L 390 50 L 410 50 L 415 33 L 425 67 L 435 23 L 445 50 L 460 50 L 590 50 L 610 50 L 615 31 L 625 69 L 635 21 L 645 50 L 660 50 L 790 50 L 810 50 L 815 34 L 825 66 L 835 24 L 845 50 L 860 50 L 990 50 L 1010 50 L 1015 29 L 1025 71 L 1035 19 L 1045 50 L 1060 50 L 1200 50" />
      </svg>
    </div>
  </div>

  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center justify-center px-6">
    <div class="max-w-6xl mx-auto text-center relative z-10">
      <div class="fade-in delay-100">
        <h1 class="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          <span class="gradient-text">TradeState</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-700 font-medium mb-8 max-w-2xl mx-auto">
          Where your physiology meets your P&L
        </p>
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

      <!-- Scroll Indicator -->
      <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 scroll-indicator">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  <section class="relative py-16 px-6">
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

