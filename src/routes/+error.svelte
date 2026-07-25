<script>
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
</script>

<div class="error-container">
  <h1>{$page.status}: {$page.error?.message ?? 'Unknown Error'}</h1>

  <p>
    Something went wrong. It's possible the page you're looking for doesn't exist, or there was an
    internal error.
  </p>

  <p><a href={resolve('/')}>Return to Home</a></p>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    gap: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  a {
    text-decoration: underline;
  }
</style>
