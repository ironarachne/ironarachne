<template>
  <section class="home main default">
    <p>Welcome to Iron Arachne!</p>
    <p>
      This site lets you randomly generate content for tabletop role-playing
      games and other fictional works. I'm always tinkering with it, so come
      back every so often to see if something new's been added.
    </p>
    <p>
      My name is Ben, and I'm the author of this site and all of the tools on
      it. You can find my personal website and blog at
      <a href="https://benovermyer.com">benovermyer.com</a>. Sometimes I'll
      write about what I'm working on for Iron Arachne over there.
    </p>
    <p>
      If you find this site useful, please consider buying me a coffee.
    </p>
    <div class="center">
      <a href="https://www.buymeacoffee.com/benovermyer" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
        alt="Buy Me A Coffee"
        style="height: 60px !important; width: 217px !important"
    /></a>
    </div>
    <h2>Recent Changes</h2>
    <div v-for="update in updates" :key="update.date">
      <h3>{{ update.date }}</h3>
      <ul>
        <li v-for="text in update.updates" :key="text">{{ text }}</li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: "HomeScreen",
  data: function() {
    return {
      updates: [
        {
          date: "Mar. 2, 2021",
          updates: [
            "Made barren planets a little deformed in WebGL rendering.",
            "Tweaked cloud layers on some planet types in WebGL rendering.",
          ],
        },
        {
          date: "Mar. 1, 2021",
          updates: [
            "Added model numbers to SWN starships.",
            "Added more detail to star generation.",
            "Added hazards to planet generation.",
          ],
        },
        {
          date: "Feb. 26, 2021",
          updates: [
            "Made star system generator and planet generator use the same underlying library for planet generation",
            "Updated button styles for each of the sections",
          ],
        },
        {
          date: "Feb. 25, 2021",
          updates: [
            "Added the planet generator",
            "Fixed missing hardpoints attribute to SWN starship generator",
          ],
        },
        {
          date: "Feb. 11, 2021",
          updates: [
            "Added missing speed and armor attributes to SWN starship generator",
            "Fixed an index bug in several generators",
            "Added the ability to save Uncharted Worlds characters",
            "Added a new town name generation scheme",
            "Made several major site design changes",
          ],
        },
        {
          date: "Feb. 8, 2021",
          updates: [
            "Added Stars Without Number starship generator",
          ],
        },
        {
          date: "Feb. 5, 2021",
          updates: [
            "Fixed the download of heraldry images",
            "Added ability to download SWN characters",
          ],
        },
        {
          date: "Feb. 4, 2021",
          updates: [
            "Stars Without Number character generator added",
          ],
        },
        {
          date: "Jan. 25, 2021",
          updates: [
            "Fantasy equipment list page has been added",
          ],
        },
        {
          date: "Jan. 19, 2021",
          updates: [
            "Planets in the Star System generator now have notable features added to their descriptions",
          ],
        },
      ]
    }
  }
};
</script>
