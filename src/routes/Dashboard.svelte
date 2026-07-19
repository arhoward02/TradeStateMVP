<script>
  import { authStore } from '../stores/auth';
  import Header from '../components/Header.svelte';

  $: user = $authStore.user;
  $: displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Trader';
</script>

<div class="page">
  <Header />

  <main>
    <header class="welcome">
      <h1 class="display-font">Welcome, {displayName}</h1>
      <p>Your trade journal is saved securely to the cloud.</p>
    </header>

    <div class="grid">
      <a href="/study.html" class="tool-card">
        <p class="eyebrow">Trade Journal</p>
        <h2>Study Gallery</h2>
        <p class="desc">Log stock + index chart studies with tags and notes.</p>
      </a>

      <a href="/leading-groups.html" class="tool-card">
        <p class="eyebrow">Market Breadth</p>
        <h2>Leading Groups</h2>
        <p class="desc">Paste Deepvue ranks + themes to find top leaders.</p>
      </a>

      <div class="tool-card static">
        <p class="eyebrow">Account</p>
        <h2>Google</h2>
        <p class="desc">{user?.email || 'Signed in'}</p>
      </div>
    </div>

    <div class="coming">
      <h3 class="display-font">More features coming soon</h3>
      <p>Portfolio tracking, analytics, and biometric insights are on the way.</p>
    </div>
  </main>
</div>

<style>
  .page {
    min-height: 100vh;
    background: #0a0a0a;
    color: #fff;
  }

  main {
    max-width: 1120px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem 4rem;
  }

  .welcome h1 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    letter-spacing: -0.03em;
  }

  .welcome p {
    margin: 0;
    color: #9a9a9a;
  }

  .grid {
    display: grid;
    gap: 1rem;
    margin: 2rem 0;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .tool-card {
    display: block;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #222;
    background: #111;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.25s ease, transform 0.25s ease;
  }

  a.tool-card:hover {
    border-color: #ff6b1a;
    transform: translateY(-2px);
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #ff6b1a;
  }

  .tool-card h2 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .desc {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #9a9a9a;
  }

  .coming {
    margin-top: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    border: 1px solid #222;
    border-radius: 12px;
    background: #111;
  }

  .coming h3 {
    margin: 0 0 0.5rem;
    font-size: 1.35rem;
    letter-spacing: -0.02em;
  }

  .coming p {
    margin: 0;
    color: #9a9a9a;
  }
</style>
