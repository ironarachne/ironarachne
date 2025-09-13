<style lang="scss">
  @import "$lib/styles/global.scss";

  footer {
    font-size: 0.75rem;
    margin-top: 1rem;
  }

  footer::before {
    content: "";
    display: inline-block;
    background: $crimson;
    width: 100%;
    height: 2px;
  }
</style>

<footer>
  <p>The source code for this site is available on <a href="https://codeberg.org/ironarachne/ironarachne">Codeberg</a>.</p>
  <p>Follow me on <a rel="me" href="https://floss.social/@skysong">Mastodon</a>.</p>
</footer>
