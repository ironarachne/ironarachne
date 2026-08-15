<script lang="ts">
  import { resolve } from '$app/paths';
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
  <a href={resolve('/')}>Home</a>
  <a href={resolve('/characters')}>Characters</a>
  <a href={resolve('/factions')}>Factions</a>
  <a href={resolve('/locations')}>Locations</a>
  <a href={resolve('/objects')}>Objects</a>
  <a href={resolve('/utilities')}>Utilities</a>
  <a href={resolve('/workshop')}>Workshop</a>
  <a href={resolve('/changelog')}>Change Log</a>
</nav>

<style>
  header {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;

    & img {
      width: 100%;
      max-width: 128px;
    }

    & p {
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
      & img {
        max-width: 80px;
      }
    }

    .logo-text {
      align-items: center;
      color: var(--iron-arachne-green);
      display: flex;
      /* "Iron Arachne" sits on one line beside the glyph, so at 2.2rem it runs
         past the edge of a 320px phone. Scale it with the viewport instead. */
      font-size: clamp(1.6rem, 8.5vw, 2.2rem);
      font-family: 'cinzel', system-ui, Helvetica, sans-serif;
      line-height: 1.1;
    }
  }

  @media (min-width: 601px) {
    .logo-text {
      & span {
        background-image: linear-gradient(
          180deg,
          var(--iron-arachne-green) 0%,
          var(--iron-arachne-green) 30%,
          var(--tan) 100%
        );
        background-clip: text;
        font-family: 'cinzel', system-ui, Helvetica, sans-serif;
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 3.5rem;
        padding-left: 0.5rem;
        -webkit-text-fill-color: transparent;
      }

      & span::before {
        background-image: linear-gradient(var(--gold) 46%, rgb(125, 142, 167) 49%, black 80%);
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
    background: var(--slate);
    border-radius: 12px;
    padding: 0.25rem;
    display: flex;
    flex-wrap: wrap;

    & a {
      display: inline-block;
      background: rgb(36, 14, 0);
      background: linear-gradient(0deg, var(--granite) 0%, var(--tan) 100%);
      border: 1px solid var(--tan);
      border-radius: 6px;
      color: var(--iron-arachne-green);
      font-family: 'cinzel', system-ui, Helvetica, sans-serif;
      padding: 0 0.25rem;
      margin: 0.25rem 0 0.25rem 0.25rem;
      text-decoration: none;

      &:hover {
        background: var(--granite);
        color: white;
      }

      &::first-letter {
        color: white;
      }

      &:active {
        background: black;
        color: var(--tan);
        transform: translateY(2px) translateX(1px);
      }
    }
  }
</style>
