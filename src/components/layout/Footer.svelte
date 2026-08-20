<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<footer>
  <p>
    The source code for this site is available on <a
      href="https://github.com/ironarachne/ironarachne">GitHub</a
    >.
  </p>
  <p>Follow me on <a rel="me" href="https://floss.social/@skysong">Mastodon</a>.</p>
  <!--
    `__APP_VERSION__` is package.json's version, substituted at build time by vite.config.js. That
    is deliberately not scripts/site_version.sh's `git describe` output: release notes carry
    package.json versions, so this is the string a visitor can actually match against one, which is
    the whole point of showing it. The link is what turns the number into an answer.
  -->
  <p>Version {__APP_VERSION__} — <a href={resolve('/release-notes')}>what's new</a></p>
</footer>

<style>
  footer {
    font-size: 0.75rem;
    margin-top: 1rem;
  }

  footer::before {
    content: '';
    display: inline-block;
    background: var(--crimson);
    width: 100%;
    height: 2px;
  }
</style>
