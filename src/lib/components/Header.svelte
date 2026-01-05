<script lang="ts">
  import glyph from '$lib/assets/images/logo-glyphonly-green.svg';
</script>

<header>
  <img alt="Iron Arachne logo glyph" src={glyph} />
  <div class="text">
    <div class="logo-text">
      <span data-text="Iron">Iron</span> <span data-text="Arachne">Arachne</span>
    </div>
    <p>Tools for procedural generation of content for tabletop role-playing games</p>
  </div>
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

<style lang="scss">
  @use '$lib/styles/global.scss';

  header {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    img {
      width: 100%;
      max-width: 128px;
    }
    p {
      text-align: center;
      display: inline-block;
      color: rgb(150, 150, 150);
      font-size: 0.8rem;
      margin: 0 0.5rem;
      font-style: italic;
    }
  }

  @media (max-width: 600px) {
    header {
      img {
        max-width: 80px;
      }
    }
    .logo-text {
      align-items: center;
      color: global.$ironArachneGreen;
      display: flex;
      font-size: 2.2rem;
      font-family: 'cinzel', system-ui, Helvetica, sans-serif;
      line-height: 2.2rem;
    }
  }

  @media (min-width: 601px) {
    .logo-text {
      span {
        background-image: linear-gradient(
          180deg,
          global.$ironArachneGreen 0%,
          global.$ironArachneGreen 30%,
          global.$tan 100%
        );
        background-clip: text;
        font-family: 'cinzel', system-ui, Helvetica, sans-serif;
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 3.5rem;
        padding-left: 0.5rem;
        -webkit-text-fill-color: transparent;
      }
      span::before {
        background-image: linear-gradient(global.$gold 46%, rgb(125, 142, 167) 49%, black 80%);
        color: black;
        content: attr(data-text);
        position: absolute;
        padding-left: 0rem;
        background-clip: text;
        -webkit-text-stroke: 3px transparent;
        z-index: -1;
      }
    }
  }

  nav {
    background: global.$slate;
    border-radius: 12px;
    padding: 0.25rem;
    display: flex;
    flex-wrap: wrap;

    a {
      display: inline-block;
      background: rgb(36, 14, 0);
      background: linear-gradient(0deg, global.$granite 0%, global.$tan 100%);
      border: 1px solid global.$tan;
      border-radius: 6px;
      color: global.$ironArachneGreen;
      font-family: 'cinzel', system-ui, Helvetica, sans-serif;
      padding: 0 0.25rem;
      margin: 0.25rem 0 0.25rem 0.25rem;
      text-decoration: none;

      &:hover {
        background: global.$granite;
        color: white;
      }

      &::first-letter {
        color: white;
      }

      &:active {
        background: black;
        color: global.$tan;
        transform: translateY(2px) translateX(1px);
      }
    }
  }
</style>
