<script>

import { metals } from "../modules/heraldry/tinctures";

</script>
<footer>
  <p>Copyright &copy; 2021 Ben Overmyer. All rights reserved.</p>
</footer>
{#if process.env.NODE_ENV === 'production'}
{@html `<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "ffbc969a542e49e3a8cea8dc23375a72"}'
></script>`}
{/if}
