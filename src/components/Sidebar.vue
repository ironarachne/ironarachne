<template>
  <section class="sidebar">
    <h2>Navigation</h2>

    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><h3>Generators</h3></li>
      <li><router-link to="/heraldry">Heraldry</router-link></li>
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
    color: white;
    font-size: 0.9rem;
    line-height: 0.9rem;
    margin: 0;
    width: 100%;
    text-decoration: none;
    padding: 0 0.5rem;
  }
  a.router-link-active {
    background: $gold;
    color: black;
  }
  h2 {
    font-size: 1.2rem;
    line-height: 1.2rem;
  }
  border-right: 1px solid #eee;
  margin-right: 1.5rem;
}
</style>
