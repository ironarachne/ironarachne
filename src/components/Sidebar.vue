<template>
  <section class="sidebar">
    <div class="normal button-group">
      <h2>Navigation</h2>

      <ul>
        <li><router-link to="/home">Home</router-link></li>
      </ul>
    </div>

    <div class="fantasy button-group">
      <h3>Fantasy</h3>

      <ul>
        <li><router-link to="/culture">Culture</router-link></li>
        <li><router-link to="/region">Region</router-link></li>
        <li><router-link to="/heraldry">Heraldry</router-link></li>
        <li><router-link to="/fantasy/organization">Organization</router-link></li>
        <li><router-link to="/fantasy/equipment">Equipment Lists</router-link></li>
      </ul>
    </div>

    <div class="scifi button-group">
      <h3>Sci-Fi</h3>

      <h4>Generic</h4>

      <ul>
        <li><router-link to="/starsystem">Star System</router-link></li>
      </ul>

      <h4>Stars Without Number</h4>

      <ul>
        <li><router-link to="/swn/character">SWN Character</router-link></li>
        <li><router-link to="/swn/starship">SWN Starship</router-link></li>
      </ul>

      <h4>Uncharted Worlds</h4>

      <ul>
        <li><router-link to="/unchartedworlds/character">UW Character</router-link></li>
      </ul>
    </div>

    <div class="cyberpunk button-group">
      <h3>Cyberpunk</h3>

      <ul>
        <li><router-link to="/chopshop">Chop Shop</router-link></li>
        <li><router-link to="/drug">Drug</router-link></li>
      </ul>
    </div>

    <div class="normal button-group">
      <h3>General Tools</h3>

      <ul>
        <li><router-link to="/species-stats">Species Height/Weight Calculator</router-link></li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: "Sidebar",
};
</script>

<style scoped lang="scss">
$ironarachnegreen: #76e841;
$tan: #5c5031;
$gold: #fad037;

section.sidebar {
  background: rgb(235,232,217);
  background: linear-gradient(90deg, rgba(235,232,217,1) 0%, rgba(204,201,183,1) 100%);
  color: black;
  a {
    display: inline-block;
    font-size: 0.6rem;
    line-height: 0.9rem;
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
    border-top-left-radius: 12px;
    text-shadow: 0 0 2px #86FF00;
    a {
      background: black;
      border-radius: 7px 1px 7px 1px;
      border: 1px solid $ironarachnegreen;
      box-shadow: none;
      color: #D8F6B0;
      font-size: 1rem;
      font-family: 'azonix';
    }
    a.router-link-active {
      background: $ironarachnegreen;
      color: black;
    }
    border-right: 1px solid #111;
  }

  .fantasy {
    background: url('/images/stone-texture.png');
    color: $gold;
    h3 {
      font-size: 1.5rem;
      text-shadow: 3px 0 0 black, 0 3px 0 black, -3px 0 0 black, 0 -3px 0 black;
    }
    a {
      background-color: rgb(155,90,55);
      background-image: url('/images/stone-texture.png');
      background-blend-mode: screen;
      border-radius: 0;
      border: 1px solid rgb(67,66,66);
      box-shadow: 1px 1px 1px black;
      text-shadow: -1px -1px 0 black, 1px 1px 0 #aaa;
      color: $gold;
      font-family: 'eczar';
      font-size: 0.9rem;
    }
    a.router-link-active {
      background: rgb(255,209,0);
      background: linear-gradient(180deg, rgba(255,209,0,1) 0%, rgba(255,240,138,1) 63%, rgba(255,209,0,1) 100%);
      text-shadow: none;
      color: black;
    }
  }

  .normal {
    a {
      background: rgb(182,151,88);
      background: linear-gradient(180deg, rgba(182,151,88,1) 0%, rgba(128,118,37,1) 53%, rgba(121,110,9,1) 56%, rgba(89,89,89,1) 100%);
      border: 0px solid #000;
      border-radius: 3px;
      color: white;
      display: inline-block;
      font-size: 0.6rem;
      line-height: 0.9rem;
      margin-bottom: 0.5rem;
      width: 100%;
      text-decoration: none;
      padding: 0.4rem 0;
      text-align: center;
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.29),
        inset 1px 1px 1px rgba(255, 255, 255, 0.44);
      transition: all 0.15s ease;
    }
    a:hover {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.29),
        inset 0px 0px 2px rgba(0, 0, 0, 0.5);
    }
    a:active {
      box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 0.8);
    }
    a.router-link-active {
      background: rgb(255,209,0);
      background: linear-gradient(180deg, rgba(255,209,0,1) 0%, rgba(255,240,138,1) 63%, rgba(255,209,0,1) 100%);
      color: black;
    }
    a.router-link-active:hover {
      box-shadow: none;
    }
  }

  .scifi {
    border-top-left-radius: 12px;
    h3 {
      font-size: 1.5rem;
    }
    h4 {
      font-size: 0.9rem;
    }
    a {
      background: rgb(51,57,136);
      background: linear-gradient(180deg, rgba(51,57,136,1) 0%, rgba(41,74,187,1) 50%, rgba(51,57,136,1) 100%);
      box-shadow: 0px 0px 3px rgba(0,180,255,1);
      color: white;
      font-family: 'alienleague';
      font-size: 1rem;
    }
    a.router-link-active {
      background: rgb(255,209,0);
      background: linear-gradient(180deg, rgba(255,209,0,1) 0%, rgba(255,240,138,1) 63%, rgba(255,209,0,1) 100%);
      box-shadow: 0px 0px 5px rgba(255,255,0,1);
      color: black;
    }
    border-right: 1px solid #111;
  }

  h2 {
    font-size: 1.2rem;
    line-height: 1.2rem;
  }
  h3 {
    font-size: 1rem;
    text-align: center;
  }
  h4 {
    font-size: 0.75rem;
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
