<script lang="ts">
  import logo from "$lib/assets/images/logo.png";
</script>

<style lang="scss">
$ironArachneGreen: #76e841;
$tan: #5c5031;
$gold: #fad037;

header {
  background: rgb(0, 0, 0);
  background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(89, 89, 89, 1) 100%);
  border-bottom: 1px solid black;
  padding: 0.5rem 0;
  img {
    width: 100%;
    max-width: 512px;
  }
  p {
    display: inline-block;
    color: white;
    font-size: 0.8rem;
    margin: 0 0.5rem;
  }
}

nav {
  background: rgb(16, 17, 25);
  border-top: 1px solid $gold;
  border-bottom: 1px solid $tan;
  padding: 0;
  ul {
    margin: 0;
    padding: 0;
    li {
      display: inline-block;
      padding: 0;
      margin: 0;
      a {
        display: inline-block;
        background: rgb(36, 14, 0);
        background: linear-gradient(
          0deg,
          rgba(36, 14, 0, 1) 0%,
          rgba(48, 48, 48, 1) 35%,
          rgba(106, 103, 92, 1) 100%
        );
        border: 1px solid $tan;
        color: $ironArachneGreen;
        padding: 0 0.25rem;
        margin: 0.25rem 0 0.25rem 0.25rem;
        text-decoration: none;
      }
      a:hover {
        color: white;
      }
    }
  }
}
</style>

<header>
  <img alt="Iron Arachne logo" src="{logo}" />
  <p>
    Tools for procedural generation of content for tabletop role-playing
    games
  </p>
</header>

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/navigation">Navigation</a></li>
    <li><a href="/changelog">Change Log</a></li>
  </ul>
</nav>
