<template>
  <section class="sidebar">
    <h2>Navigation</h2>

    <ul>
      <li><router-link to="/home">Home</router-link></li>
    </ul>

    <h3>Fantasy</h3>

    <ul>
      <li><router-link to="/culture">Culture</router-link></li>
      <li><router-link to="/region">Region</router-link></li>
      <li><router-link to="/heraldry">Heraldry</router-link></li>
      <li><router-link to="/fantasy/organization">Organization</router-link></li>
    </ul>

    <h3>Sci-Fi</h3>

    <ul>
      <li><router-link to="/starsystem">Star System</router-link></li>
      <li>
        <router-link to="/unchartedworlds/character"
          >Uncharted Worlds Character</router-link
        >
      </li>
    </ul>

    <h3>Cyberpunk</h3>

    <ul>
      <li><router-link to="/chopshop">Chop Shop</router-link></li>
    </ul>
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
  a {
    background: $tan;
    border-radius: 0px;
    border: 0px solid #000;
    border-radius: 3px;
    color: $ironarachnegreen;
    display: inline-block;
    font-size: 0.9rem;
    line-height: 0.9rem;
    margin: 0;
    margin-bottom: 0.5rem;
    width: 100%;
    text-decoration: none;
    padding: 0.5rem;
    text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.22);
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
    background: $gold;
    color: black;
  }
  h2 {
    font-size: 1.2rem;
    line-height: 1.2rem;
  }
  h3,
  h4 {
    font-size: 1rem;
  }
  border-right: 1px solid #eee;
  margin-right: 1.5rem;
  ul {
    li {
      list-style: none;
      margin-left: 0;
    }
  }
}
</style>
