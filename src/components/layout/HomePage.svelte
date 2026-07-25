<script lang="ts">
  import { resolve } from '$app/paths';
  import ChangelogEntries from '$components/layout/ChangelogEntries.svelte';

  const numberOfEntries = 5;
</script>

<svelte:head>
  <title>Iron Arachne</title>
</svelte:head>

<section class="home main default">
  <p>Welcome to Iron Arachne!</p>
  <p>
    This site lets you randomly generate content for tabletop role-playing games and other fictional
    works. I'm always tinkering with it, so come back every so often to see if something new's been
    added.
  </p>
  <p>
    My name is Ben, and I'm the author of this site and all of the tools on it. You can find my
    personal website and blog at
    <a href="https://benovermyer.com">benovermyer.com</a>. Sometimes I'll write about what I'm
    working on for Iron Arachne over there.
  </p>
  <h2>Featured Generators</h2>
  <p>The following are generators that I'm particularly proud of or are unique to this site.</p>
  <ul>
    <li><a href={resolve('/culture')}>Culture Generator</a></li>
    <li><a href={resolve('/planet')}>Planet Generator</a></li>
  </ul>
  <h2>Recent Changes</h2>
  <p>Showing the {numberOfEntries} most recent change log entries.</p>
  <ChangelogEntries limit={numberOfEntries} />
</section>
