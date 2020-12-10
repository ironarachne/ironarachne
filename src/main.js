import Vue from "vue";
import VueRouter from "vue-router";
import HomeScreen from "./components/HomeScreen.vue";
import ChopShopGenerator from "./components/ChopShopGenerator.vue";
import CultureGenerator from "./components/CultureGenerator.vue";
import HeraldryGenerator from "./components/HeraldryGenerator.vue";
import HeraldryScreen from "./components/HeraldryScreen.vue";
import TavernGenerator from "./components/TavernGenerator.vue";
import App from "./App.vue";
import "./assets/reset.scss";
import "./assets/main.scss";

Vue.use(VueRouter);
Vue.config.productionTip = false;

const routes = [
  { path: "/", redirect: "/home" },
  { path: "/home", component: HomeScreen },
  { path: "/culture", component: CultureGenerator },
  { path: "/heraldry", component: HeraldryScreen },
  {
    path: "/heraldry/:seed",
    name: "heraldry-generator",
    component: HeraldryGenerator,
  },
  {
    path: "/tavern",
    component: TavernGenerator,
  },
  {
    path: "/chopshop",
    component: ChopShopGenerator,
  },
];

const router = new VueRouter({
  routes,
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
