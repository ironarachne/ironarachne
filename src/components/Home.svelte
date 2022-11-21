<script lang="ts">
  import * as Entries from "../modules/updates/entries";

  let numberOfEntries = 5;

  let updates = Entries.mostRecent(numberOfEntries);
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
    <a href="https://www.buymeacoffee.com/benovermyer" target="_blank" rel="noreferrer"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
        alt="Buy Me A Coffee"
        style="height: 60px !important; width: 217px !important"
      /></a
    >
  </div>
  <h2>Recent Changes</h2>
  <p>Showing the {numberOfEntries} most recent change log entries.</p>
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
