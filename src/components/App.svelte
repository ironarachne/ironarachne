<script lang="ts">
  import ChopShop from "./ChopShop.svelte";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Home from "./Home.svelte";
  import Router from "svelte-spa-router";
  import Sidebar from "./Sidebar.svelte";
  import Culture from "./Culture.svelte";
  import Drug from "./Drug.svelte";
  import FantasyEquipment from "./FantasyEquipment.svelte";
  import FantasyOrganization from "./FantasyOrganization.svelte";
  import Heraldry from "./Heraldry.svelte";
  import MagicWeapon from "./MagicWeapon.svelte";
  import Planet from "./Planet.svelte";
  import Region from "./Region.svelte";
  import Religion from "./Religion.svelte";
  import SpeciesStatsTool from "./SpeciesStats.svelte";
  import StarSystem from "./StarSystem.svelte";
  import SWNCharacter from "./SWNCharacter.svelte";
  import SWNStarship from "./SWNStarship.svelte";
  import UWCharacter from "./UWCharacter.svelte";

  const routes = {
    "/": Home,
    "/chopshop": ChopShop,
    "/culture": Culture,
    "/drug": Drug,
    "/fantasy/equipment": FantasyEquipment,
    "/fantasy/organization": FantasyOrganization,
    "/fantasy/religion": Religion,
    "/fantasy/weapon": MagicWeapon,
    "/heraldry": Heraldry,
    "/planet": Planet,
    "/region": Region,
    "/species-stats": SpeciesStatsTool,
    "/starsystem": StarSystem,
    "/swn/character": SWNCharacter,
    "/swn/starship": SWNStarship,
    "/unchartedworlds/character": UWCharacter,
  };
</script>

<div id="app">
  <Header />
  <div class="primary">
    <Sidebar />
    <Router {routes} />
  </div>
  <Footer />
</div>
