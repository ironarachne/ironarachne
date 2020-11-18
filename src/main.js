import Vue from "vue";
import VueRouter from "vue-router";
import HomeScreen from "./components/HomeScreen.vue";
import HeraldryGenerator from "./components/HeraldryGenerator.vue";
import HeraldryScreen from "./components/HeraldryScreen.vue";
import App from "./App.vue";
import "./assets/reset.scss";
import "./assets/main.scss";

Vue.use(VueRouter);
Vue.config.productionTip = false;

const routes = [
  { path: "/", component: HomeScreen },
  { path: "/heraldry", component: HeraldryScreen },
  {
    path: "/heraldry/:seed",
    name: "heraldry-generator",
    component: HeraldryGenerator,
  },
];

const router = new VueRouter({
  routes,
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
