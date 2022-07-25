<script lang="ts">
  import ArmsManufacturer from "./ArmsManufacturer.svelte";
  import ChangeLog from "./ChangeLog.svelte";
  import ChopShop from "./ChopShop.svelte";
  import Culture from "./Culture.svelte";
  import DCCCharacter from "./DCCCharacter.svelte";
  import Drug from "./Drug.svelte";
  import Dungeon from "./Dungeon.svelte";
  import FantasyEquipment from "./FantasyEquipment.svelte";
  import FantasyFamily from "./FantasyFamily.svelte";
  import FantasyMerchant from "./FantasyMerchant.svelte";
  import FantasyOrganization from "./FantasyOrganization.svelte";
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Heraldry from "./Heraldry.svelte";
  import Home from "./Home.svelte";
  import Language from "./Language.svelte";
  import MagicWeapon from "./MagicWeapon.svelte";
  import Planet from "./Planet.svelte";
  import Region from "./Region.svelte";
  import Religion from "./Religion.svelte";
  import Router from "svelte-spa-router";
  import Sidebar from "./Sidebar.svelte";
  import SpeciesStatsTool from "./SpeciesStats.svelte";
  import SpookyShip from "./SpookyShip.svelte";
  import StarNation from "./StarNation.svelte";
  import StarSystem from "./StarSystem.svelte";
  import SWNCharacter from "./SWNCharacter.svelte";
  import SWNStarship from "./SWNStarship.svelte";
  import UWCharacter from "./UWCharacter.svelte";
  import WordGeneratorCheatSheet from "./WordGeneratorCheatSheet.svelte";

  const routes = {
    "/": Home,
    "/arms-manufacturer": ArmsManufacturer,
    "/changelog": ChangeLog,
    "/chopshop": ChopShop,
    "/culture": Culture,
    "/drug": Drug,
    "/fantasy/dcc/character": DCCCharacter,
    "/fantasy/dungeon": Dungeon,
    "/fantasy/equipment": FantasyEquipment,
    "/fantasy/family": FantasyFamily,
    "/fantasy/merchant": FantasyMerchant,
    "/fantasy/organization": FantasyOrganization,
    "/fantasy/religion": Religion,
    "/fantasy/weapon": MagicWeapon,
    "/heraldry": Heraldry,
    "/language": Language,
    "/planet": Planet,
    "/region": Region,
    "/species-stats": SpeciesStatsTool,
    "/spooky-ship": SpookyShip,
    "/star-nation": StarNation,
    "/starsystem": StarSystem,
    "/swn/character": SWNCharacter,
    "/swn/starship": SWNStarship,
    "/unchartedworlds/character": UWCharacter,
    "/word-generator-cheat-sheet": WordGeneratorCheatSheet,
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
