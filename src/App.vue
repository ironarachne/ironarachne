<template>
  <div id="app">
    <Header/>
    <div class="primary">
      <Sidebar v-on:change-view="currentView = $event" v-bind:currentViewName="currentView" />
      <component v-bind:is="currentScreen" class="main"/>
    </div>
    <Footer/>
  </div>
</template>

<script>
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import HomeScreen from './components/HomeScreen.vue'
import HeraldryScreen from './components/HeraldryScreen.vue'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    Sidebar,
    HomeScreen,
    HeraldryScreen,
  },
  data: function() {
    return {
      currentView: 'Home'
    }
  },
  computed: {
    currentScreen: function() {
      return this.currentView + 'Screen'
    }
  }
}
</script>

<style lang="scss">
$ironarachnegreen: #76E841;
$tan: #5C5031;
$gold: #FAD037;

#app {
  div.primary {
    display: grid;
    grid-template-columns: 200px auto;
  }
  
  section.main {
    button {
      background: rgb(92, 86, 73);
      background: linear-gradient(165deg, rgba(92, 86, 73, 1) 0%, rgba(10, 10, 10, 1) 100%);
      border: 3px solid $tan;
      border-radius: 3px;
      color: #fff;
      font-size: 1rem;
      line-height: 1rem;
      margin: 0.1rem;
      padding: 0.5rem 1rem;
    }
    
    button:active {
      background: rgb(92, 86, 73);
      background: linear-gradient(339deg, rgba(92, 86, 73, 1) 0%, rgba(10, 10, 10, 1) 100%);
      color: $ironarachnegreen;
      transform: translateY(2px);
    }
  }
}
</style>
