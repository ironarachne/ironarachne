<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
@import '$lib/styles/global.scss';
@import '$lib/styles/cyberpunk.scss';
@import '$lib/styles/fantasy.scss';
@import '$lib/styles/scifi.scss';

section.navigation {
  background: none;
  color: black;

  a {
    display: inline-block;
    margin-bottom: 0.5rem;
    width: 100%;
    text-decoration: none;
    padding: 0.4rem 0;
    text-align: center;
    transition: all 0.15s ease;
  }

  .button-group {
    padding: 0.25rem;
    margin-top: 0.5rem;
  }

  .cyberpunk {
    border-radius: 12px;
    text-shadow: 0 0 2px #86ff00;

    a {
      background: black;
      border-radius: 7px 1px 7px 1px;
      border: 1px solid $ironArachneGreen;
      box-shadow: none;
      color: #d8f6b0;
      font-family: 'azonix', sans-serif;
    }

    a.active {
      background: $ironArachneGreen;
      color: black;
    }

    border-right: 1px solid #111;
  }

  .fantasy {
    border-radius: 12px;
    background: url('$lib/assets/images/stone-texture.png');

    h2,
    h3,
    h4 {
      color: $gold;
      text-shadow: 3px 0 0 black, 0 3px 0 black, -3px 0 0 black, 0 -3px 0 black;
    }

    a {
      background-color: rgb(155, 90, 55);
      background-image: url('$lib/assets/images/stone-texture.png');
      background-blend-mode: screen;
      border-radius: 0;
      border: 1px solid rgb(67, 66, 66);
      box-shadow: 1px 1px 1px black;
      text-shadow: -1px -1px 0 black, 1px 1px 0 #aaa;
      color: $gold;
    }

    a.active {
      background: rgb(255, 209, 0);
      background: linear-gradient(
        180deg,
        rgba(255, 209, 0, 1) 0%,
        rgba(255, 240, 138, 1) 63%,
        rgba(255, 209, 0, 1) 100%
      );
      text-shadow: none;
      color: black;
    }
  }

  .normal {
    a {
      background: rgb(182, 151, 88);
      background: linear-gradient(
        180deg,
        rgba(182, 151, 88, 1) 0%,
        rgba(128, 118, 37, 1) 53%,
        rgba(121, 110, 9, 1) 56%,
        rgba(89, 89, 89, 1) 100%
      );
      border: 0 solid #000;
      border-radius: 3px;
      color: white;
      display: inline-block;
      margin-bottom: 0.5rem;
      width: 100%;
      text-decoration: none;
      padding: 0.4rem 0;
      text-align: center;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.29), inset 1px 1px 1px rgba(255, 255, 255, 0.44);
      transition: all 0.15s ease;
    }

    a:hover {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.29), inset 0 0 2px rgba(0, 0, 0, 0.5);
    }

    a:active {
      box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.8);
    }

    a.active {
      background: rgb(255, 209, 0);
      background: linear-gradient(
        180deg,
        rgba(255, 209, 0, 1) 0%,
        rgba(255, 240, 138, 1) 63%,
        rgba(255, 209, 0, 1) 100%
      );
      color: black;
    }

    a.active:hover {
      box-shadow: none;
    }
  }

  .scifi {
    border-radius: 12px;

    a {
      background: rgb(51, 57, 136);
      background: linear-gradient(
        180deg,
        rgba(51, 57, 136, 1) 0%,
        rgba(41, 74, 187, 1) 50%,
        rgba(51, 57, 136, 1) 100%
      );
      box-shadow: 0 0 3px rgba(0, 180, 255, 1);
      color: white;
      font-family: 'alienleague', sans-serif;
    }

    a.active {
      background: rgb(255, 209, 0);
      background: linear-gradient(
        180deg,
        rgba(255, 209, 0, 1) 0%,
        rgba(255, 240, 138, 1) 63%,
        rgba(255, 209, 0, 1) 100%
      );
      box-shadow: 0 0 5px rgba(255, 255, 0, 1);
      color: black;
    }

    border-right: 1px solid #111;
  }

  h3 {
    border-bottom: 1px solid #000;
  }

  ul {
    li {
      list-style: none;
      margin-left: 0;
    }
  }
}
</style>

<svelte:head>
  <title>Navigation | Iron Arachne</title>
</svelte:head>

<section class="navigation">
  <h1>Navigation</h1>

  <div class="fantasy button-group">
    <h2>Fantasy</h2>

    <h3>Generic</h3>

    <ul>
      <li>
        <a href="/culture">Culture</a>
      </li>
      <li>
        <a href="/fantasy/dungeon">Dungeon</a>
      </li>
      <li>
        <a href="/fantasy/equipment">Equipment Lists</a>
      </li>
      <li>
        <a href="/fantasy/family">Family</a>
      </li>
      <li>
        <a href="/heraldry">Heraldry</a>
      </li>
      <li>
        <a href="/fantasy/weapon">Magic Weapon</a>
      </li>
      <li>
        <a href="/fantasy/organization">Organization</a>
      </li>
      <li>
        <a href="/region">Region</a>
      </li>
      <li>
        <a href="/fantasy/religion">Religion</a>
      </li>
    </ul>

    <h3>Advanced Dungeons &amp; Dragons</h3>

    <ul>
      <li>
        <a href="/fantasy/adnd/character">AD&amp;D 2e Character</a>
      </li>
    </ul>

    <h3>Dungeon Crawl Classics</h3>

    <ul>
      <li>
        <a href="/fantasy/dcc/character">DCC Character</a>
      </li>
    </ul>
  </div>

  <div class="scifi button-group">
    <h2>Sci-Fi</h2>

    <h3>Generic</h3>

    <ul>
      <li>
        <a href="/arms-manufacturer">Arms Manufacturer</a>
      </li>
      <li>
        <a href="/planet">Planet</a>
      </li>
      <li>
        <a href="/spooky-ship">Spooky Ship</a>
      </li>
      <li>
        <a href="/star-nation">Star Nation</a>
      </li>
      <li>
        <a href="/star-system">Star System</a>
      </li>
    </ul>

    <h3>Stars Without Number</h3>

    <ul>
      <li>
        <a href="/swn/character">SWN Character</a>
      </li>
      <li>
        <a href="/swn/starship">SWN Starship</a>
      </li>
    </ul>

    <h3>Uncharted Worlds</h3>

    <ul>
      <li>
        <a href="/unchartedworlds/character">UW Character</a>
      </li>
    </ul>
  </div>

  <div class="cyberpunk button-group">
    <h2>Cyberpunk</h2>

    <ul>
      <li>
        <a href="/chopshop">Chop Shop</a>
      </li>
      <li>
        <a href="/drug">Drug</a>
      </li>
    </ul>
  </div>

  <div class="normal button-group">
    <h2>General Tools</h2>

    <ul>
      <li>
        <a href="/language">Language</a>
      </li>
      <li>
        <a href="/species-stats">Species Height/Weight Calculator</a>
      </li>
      <li>
        <a href="/word-generator-cheat-sheet">Word Generator Cheat Sheet</a>
      </li>
    </ul>
  </div>
</section>
