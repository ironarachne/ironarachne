<script lang="ts">
  import {location} from 'svelte-spa-router'
</script>

<section class="sidebar">
  <div class="normal button-group">
    <h2>Navigation</h2>

    <ul>
      <li>
        <a href="#/" class:active={$location === '/'}>Home</a>
      </li>
      <li>
        <a href="#/changelog" class:active={$location === '/changelog'}>Change Log</a>
      </li>
      <li><a href="https://www.reddit.com/r/ironarachne/">r/ironarachne subreddit</a></li>
    </ul>
  </div>

  <div class="fantasy button-group">
    <h3>Fantasy</h3>

    <ul>
      <li>
        <a href="#/culture" class:active={$location === '/culture'}>Culture</a>
      </li>
      <li>
        <a href="#/fantasy/equipment" class:active={$location === '/fantasy/equipment'}>Equipment Lists</a>
      </li>
      <li>
        <a href="#/fantasy/family" class:active={$location === '/fantasy/family'}>Family</a>
      </li>
      <li>
        <a href="#/heraldry" class:active={$location === '/heraldry'}>Heraldry</a>
      </li>
      <li>
        <a href="#/fantasy/weapon" class:active={$location === '/fantasy/weapon'}>Magic Weapon</a>
      </li>
      <li>
        <a href="#/fantasy/organization" class:active={$location === '/fantasy/organization'}>Organization</a>
      </li>
      <li>
        <a href="#/region" class:active={$location === '/region'}>Region</a>
      </li>
      <li>
        <a href="#/fantasy/religion" class:active={$location === '/fantasy/religion'}>Religion</a>
      </li>
    </ul>
  </div>

  <div class="scifi button-group">
    <h3>Sci-Fi</h3>

    <h4>Generic</h4>

    <ul>
      <li>
        <a href="#/arms-manufacturer" class:active={$location === '/arms-manufacturer'}>Arms Manufacturer</a>
      </li>
      <li>
        <a href="#/planet" class:active={$location === '/planet'}>Planet</a>
      </li>
      <li>
        <a href="#/spooky-ship" class:active={$location === '/spooky-ship'}>Spooky Ship</a>
      </li>
      <li>
        <a href="#/starsystem" class:active={$location === '/starsystem'}>Star System</a>
      </li>
    </ul>

    <h4>Stars Without Number</h4>

    <ul>
      <li>
        <a href="#/swn/character" class:active={$location === '/swn/character'}>SWN Character</a>
      </li>
      <li>
        <a href="#/swn/starship" class:active={$location === '/swn/starship'}>SWN Starship</a>
      </li>
    </ul>

    <h4>Uncharted Worlds</h4>

    <ul>
      <li>
        <a href="#/unchartedworlds/character" class:active={$location === '/unchartedworlds/character'}>UW Character</a>
      </li>
    </ul>
  </div>

  <div class="cyberpunk button-group">
    <h3>Cyberpunk</h3>

    <ul>
      <li>
        <a href="#/chopshop" class:active={$location === '/chopshop'}>Chop Shop</a>
      </li>
      <li>
        <a href="#/drug" class:active={$location === '/drug'}>Drug</a>
      </li>
    </ul>
  </div>

  <div class="normal button-group">
    <h3>General Tools</h3>

    <ul>
      <li>
        <a href="#/species-stats" class:active={$location === '/species-stats'}>Species Height/Weight Calculator</a>
      </li>
    </ul>
  </div>
</section>
