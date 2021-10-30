<script lang="ts">
  import ChangeLog from "../modules/changelog";

  let updates = [
    new ChangeLog("2021-10-30", [
      "Expanded how gender is handled behind the scenes.",
      "Added male and female controls to Species Stats.",
      "Added a little more variety to character descriptions.",
    ]),
    new ChangeLog("2021-10-16", [
      "Added spooky ship generator.",
    ]),
    new ChangeLog("2021-9-26", [
      "Added ability to filter heraldry charges by tag.",
    ]),
    new ChangeLog("2021-8-13", [
      "Fixed bug in seed generator that right-padded it with zeroes.",
      "Added more variety to town names.",
      "Made the random seed field monospace.",
      "Expanded the list of clothing in the fantasy equipment lists.",
    ]),
    new ChangeLog("2021-7-13", [
      "Added more variety to biomes.",
      "Added an arms manufacturer generator.",
      "Fixed a bug in calculating ordinals for the changelog.",
    ]),
    new ChangeLog("2021-7-9", [
      "Changed how star and planet names are constructed.",
      "Added a chance for inhabited planets to have a notable starport.",
      "Changed how planetary cultures and governments are generated.",
    ]),
    new ChangeLog("2021-7-8", [
      "Rewrote the site from JavaScript + Vue + Webpack to TypeScript + Svelte + Rollup.",
      "Fixed several subtle bugs in the Stars Without Number generators.",
      "Made the heraldry generator faster.",
      "Changed how this change log is structured and displayed.",
    ]),
    new ChangeLog("2021-5-2", [
      "Expanded culture generator with music style.",
      "Added social organization to the culture generator.",
    ]),
    new ChangeLog("2021-4-21", ["Added a religion generator."]),
    new ChangeLog("2021-4-19", [
      "Made the magic weapon generator more flexible.",
    ]),
    new ChangeLog("2021-4-16", ["Added a magic weapon generator."]),
    new ChangeLog("2021-4-8", [
      "Added personality traits to character descriptions.",
      "Added notable members to organizations.",
    ]),
    new ChangeLog("2021-3-2", [
      "Made barren planets a little deformed in WebGL rendering.",
      "Tweaked cloud layers on some planet types in WebGL rendering.",
    ]),
    new ChangeLog("2021-3-1", [
      "Added model numbers to SWN starships.",
      "Added more detail to star generation.",
      "Added hazards to planet generation.",
    ]),
    new ChangeLog("2021-2-26", [
      "Made star system generator and planet generator use the same underlying library for planet generation",
      "Updated button styles for each of the sections",
    ]),
    new ChangeLog("2021-2-25", [
      "Added the planet generator",
      "Fixed missing hardpoints attribute to SWN starship generator",
    ]),
    new ChangeLog("2021-2-11", [
      "Added missing speed and armor attributes to SWN starship generator",
      "Fixed an index bug in several generators",
      "Added the ability to save Uncharted Worlds characters",
      "Added a new town name generation scheme",
      "Made several major site design changes",
    ]),
    new ChangeLog("2021-2-8", [
      "Added Stars Without Number starship generator",
    ]),
    new ChangeLog("2021-2-5", [
      "Fixed the download of heraldry images",
      "Added ability to download SWN characters",
    ]),
    new ChangeLog("2021-2-4", [
      "Stars Without Number character generator added",
    ]),
    new ChangeLog("2021-1-25", [
      "Fantasy equipment list page has been added",
    ]),
    new ChangeLog("2021-1-19", [
      "Planets in the Star System generator now have notable features added to their descriptions",
    ]),
  ];
</script>

<svelte:head>
  <title>Iron Arachne</title>
</svelte:head>

<section class="home main default">
  <p>Welcome to Iron Arachne!</p>
  <p>
    This site lets you randomly generate content for tabletop role-playing games
    and other fictional works. I'm always tinkering with it, so come back every
    so often to see if something new's been added.
  </p>
  <p>
    My name is Ben, and I'm the author of this site and all of the tools on it.
    You can find my personal website and blog at
    <a href="https://benovermyer.com">benovermyer.com</a>. Sometimes I'll write
    about what I'm working on for Iron Arachne over there.
  </p>
  <p>If you find this site useful, please consider buying me a coffee.</p>
  <div class="center">
    <a href="https://www.buymeacoffee.com/benovermyer" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
        alt="Buy Me A Coffee"
        style="height: 60px !important; width: 217px !important"
      /></a
    >
  </div>
  <h2>Recent Changes</h2>
  {#each updates as update}
    <div>
      <h3>{@html update.niceDate()}</h3>
      <ul>
        {#each update.updates as text}
          <li>{text}</li>
        {/each}
      </ul>
    </div>
  {/each}
</section>
