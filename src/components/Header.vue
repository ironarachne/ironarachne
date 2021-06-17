<template>
  <header>
    <img src="images/logo-glyphonly-green.svg"/>
    <div>
      <h1>Iron Arachne</h1>
      <p>
        Tools for procedural generation of content for tabletop role-playing
        games
      </p>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  props: {},
};
</script>

<style scoped lang="scss">
$ironarachnegreen: #76e841;
$tan: #5c5031;
$gold: #fad037;

header {
  background: rgb(0, 0, 0);
  background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(89, 89, 89, 1) 100%);
  border-bottom: 1px solid black;
  font-size: 1.75rem;
  line-height: 1.75rem;
  padding: 0.5rem 0;
  display: grid;
  grid-template-columns: 64px auto;
  column-gap: 1rem;
}

header > img {
  width: 64px;
  align-self: center;
  justify-self: center;
}

header p {
  color: white;
  font-size: 0.8rem;
  margin: 0;
}

h1 {
  color: $ironarachnegreen;
  font-weight: 700;
  text-shadow: 2px 2px 1px #000;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: #220;
  font-size: 2.5rem;
  line-height: 2.5rem;
  margin: 0;
  align-self: center;
}
</style>
