<template>
  <div id="app">
    <Header />
    <div class="primary">
      <Sidebar />
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";

export default {
  name: "App",
  components: {
    Header,
    Footer,
    Sidebar,
  },
};
</script>
