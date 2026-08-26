<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<footer>
  <!--
    This used to be the home page's third paragraph. The home page is now the top of an
    application rather than a personal index, and a first-person introduction above the fold
    competes with what the site is for — but it is worth keeping, and decision 5 in
    docs/app-shell.md refuses an About page as a sixth destination. The footer is where it lands.
  -->
  <p>
    Iron Arachne is written by Ben, who also writes about it at
    <a href="https://benovermyer.com">benovermyer.com</a>.
  </p>
  <p>
    The source code for this site is available on <a
      href="https://github.com/ironarachne/ironarachne">GitHub</a
    >.
  </p>
  <p>Follow me on <a rel="me" href="https://floss.social/@skysong">Mastodon</a>.</p>
  <!--
    Attribution for the icon set, which is licensed for commercial use on the condition that
    SunGraphica is credited. The credit is a licence term, not a courtesy: it belongs somewhere
    that appears on every page, which is what the footer is. See docs/icons.md.
  -->
  <p>
    Icons by <a href="https://www.gamedevmarket.net/member/sgasset">SunGraphica</a>.
  </p>
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
