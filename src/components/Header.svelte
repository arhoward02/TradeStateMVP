<script>
  import { authStore } from '../stores/auth';

  $: user = $authStore.user;
  $: displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Account';
  $: avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  async function handleLogout() {
    await authStore.logout();
    window.location.hash = '/login';
  }
</script>

<header class="header">
  <nav class="nav">
    <a href="#/dashboard" class="brand display-font">TradeState</a>

    <div class="links">
      <a href="#/dashboard">Dashboard</a>
      <a href="/study.html">Study Gallery</a>
      <a href="/leading-groups.html">Leading Groups</a>
    </div>

    <div class="account">
      {#if $authStore.isAuthenticated}
        <div class="user">
          <div class="meta">
            <p class="name">{displayName}</p>
            <p class="sub">Google account</p>
          </div>
          {#if avatarUrl}
            <img src={avatarUrl} alt="" class="avatar" />
          {:else}
            <div class="avatar placeholder"></div>
          {/if}
        </div>
        <button type="button" class="logout" on:click={handleLogout}>Logout</button>
      {/if}
    </div>
  </nav>
</header>

<style>
  .header {
    border-bottom: 1px solid #222;
    background: rgba(10, 10, 10, 0.9);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 30;
  }

  .nav {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 1.25rem;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .brand {
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: -0.03em;
    color: #fff;
    text-decoration: none;
    margin-right: auto;
  }

  .links {
    display: none;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .links {
      display: flex;
    }
  }

  .links a {
    color: #9a9a9a;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .links a:hover {
    color: #ff6b1a;
  }

  .account {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user {
    display: none;
    align-items: center;
    gap: 0.65rem;
  }

  @media (min-width: 768px) {
    .user {
      display: flex;
    }
  }

  .meta {
    text-align: right;
  }

  .name {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 500;
    color: #fff;
  }

  .sub {
    margin: 0;
    font-size: 0.7rem;
    color: #9a9a9a;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #2a2a2a;
  }

  .avatar.placeholder {
    background: #161616;
  }

  .logout {
    border: 1px solid #2a2a2a;
    background: transparent;
    color: #b0b0b0;
    border-radius: 8px;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .logout:hover {
    border-color: #ff6b1a;
    color: #ff6b1a;
  }
</style>
