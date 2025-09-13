<script lang="ts">
  import logo from "$lib/assets/images/logo-glyphonly-green.svg";
</script>

<style lang="scss">
@import "$lib/styles/global.scss";

header {
  padding: 0.5rem 0;
  img {
    width: 100%;
    max-width: 64px;
  }
  p {
    display: inline-block;
    color: white;
    font-size: 0.8rem;
    margin: 0 0.5rem;
  }
}

.logo {
  display: flex;
  align-items: center;
  span {
    background-image: linear-gradient(
      180deg,
      $ironArachneGreen 0%,
      $ironArachneGreen 30%,
      $tan 100%
    );
    background-clip: text;
    font-family: "cinzel", system-ui, Helvetica, sans-serif;
    font-size: 3.5rem;
    font-weight: 700;
    padding-left: 0.5rem;
    -webkit-text-fill-color: transparent;
  }
  span::before {
    background-image: linear-gradient(
      $gold 46%,
      rgb(125, 142, 167) 49%,
      black 80%
    );
    color: black;
    content: attr(data-text);
    position: absolute;
    padding-left: 0rem;
    background-clip: text;
    -webkit-text-stroke: 3px transparent;
    z-index: -1;
  }
}

nav {
  background: $slate;
  border-radius: 12px;
  padding: 0.25rem;
  display: flex;
  flex-wrap: wrap;

  a {
    display: inline-block;
    background: rgb(36, 14, 0);
    background: linear-gradient(
      0deg,
      $granite 0%,
      $tan 100%
    );
    border: 1px solid $tan;
    border-radius: 6px;
    color: $ironArachneGreen;
    font-family: "cinzel", system-ui, Helvetica, sans-serif;
    padding: 0 0.25rem;
    margin: 0.25rem 0 0.25rem 0.25rem;
    text-decoration: none;

    &:hover {
      background: $granite;
      color: white;
    }

    &::first-letter {
      color: white;
    }
  }
}
</style>

<header>
  <div class="logo">
    <img alt="Iron Arachne logo glyph" src="{logo}" />
    <span data-text="Iron Arachne">Iron Arachne</span>
  </div>

  <p>
    Tools for procedural generation of content for tabletop role-playing
    games
  </p>
</header>

<nav>
  <a href="/">Home</a>
  <a href="/characters">Characters</a>
  <a href="/factions">Factions</a>
  <a href="/locations">Locations</a>
  <a href="/objects">Objects</a>
  <a href="/utilities">Utilities</a>
  <a href="/changelog">Change Log</a>
</nav>
