import Vue from "vue";
import VueRouter from "vue-router";
import HomeScreen from "./components/HomeScreen.vue";
import ChopShopGenerator from "./components/ChopShopGenerator.vue";
import CultureGenerator from "./components/CultureGenerator.vue";
import DrugGenerator from "./components/DrugGenerator.vue";
import FantasyEquipmentLists from "./components/FantasyEquipmentLists.vue";
import FantasyOrgGenerator from "./components/FantasyOrgGenerator.vue";
import HeraldryGenerator from "./components/HeraldryGenerator.vue";
import HeraldryScreen from "./components/HeraldryScreen.vue";
import MagicWeaponGenerator from "./components/MagicWeaponGenerator.vue";
import PlanetGenerator from "./components/PlanetGenerator.vue";
import RegionGenerator from "./components/RegionGenerator.vue";
import ReligionGenerator from "./components/ReligionGenerator.vue";
import SpeciesStatsTool from "./components/SpeciesStatsTool.vue";
import StarSystemGenerator from "./components/StarSystemGenerator.vue";
import SWNCharacterGenerator from "./components/SWNCharacterGenerator.vue";
import SWNStarshipGenerator from "./components/SWNStarshipGenerator.vue";
import TavernGenerator from "./components/TavernGenerator.vue";
import UWCharacterGenerator from "./components/UWCharacterGenerator.vue";
import App from "./App.vue";
import "./assets/reset.scss";
import "./assets/main.scss";

Vue.use(VueRouter);
Vue.config.productionTip = false;

const routes = [
  { path: "/", redirect: "/home" },
  { path: "/home", component: HomeScreen },
  { path: "/culture", component: CultureGenerator },
  { path: "/fantasy/equipment", component: FantasyEquipmentLists },
  { path: "/fantasy/organization", component: FantasyOrgGenerator },
  { path: "/fantasy/religion", component: ReligionGenerator },
  { path: "/fantasy/weapon", component: MagicWeaponGenerator },
  { path: "/heraldry", component: HeraldryScreen },
  {
    path: "/heraldry/:seed",
    name: "heraldry-generator",
    component: HeraldryGenerator,
  },
  { path: "/region", component: RegionGenerator },
  { path: "/tavern", component: TavernGenerator },
  { path: "/chopshop", component: ChopShopGenerator },
  { path: "/drug", component: DrugGenerator },
  { path: "/planet", component: PlanetGenerator },
  { path: "/species-stats", component: SpeciesStatsTool },
  { path: "/starsystem", component: StarSystemGenerator },
  { path: "/swn/character", component: SWNCharacterGenerator },
  { path: "/swn/starship", component: SWNStarshipGenerator },
  { path: "/unchartedworlds/character", component: UWCharacterGenerator },
];

const router = new VueRouter({
  routes,
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
