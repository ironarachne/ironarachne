<script lang="ts">
  import * as Currency from "../modules/currency";
  import * as FantasyEquipmentList from "../modules/equipment/fantasylist";

  let currency = "D&D currency";
  let equipmentLists = FantasyEquipmentList.all();

  function convertDNDCost(cost: number) {
    return Currency.convertCopper(cost, false, false);
  }

  function convertEnglishCost(cost: number) {
    return Currency.convertFarthings(cost);
  }
</script>

<svelte:head>
  <title>Fantasy Equipment Lists | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Equipment Lists</h1>
  <p>
    This page is meant to be a comprehensive list of equipment for fantasy
    games. It will be updated over time, so keep checking back for new
    entries.
  </p>
  <p>
    Where possible, I've based the prices off of historical data rather than
    fantasy sources. 1 copper coin is treated as equivalent to 1 farthing.
  </p>

  <div class="input-group">
    <label for="currency">Currency Type</label>
    <select bind:value={currency} name="currency">
      <option>D&D currency</option>
      <option>English currency</option>
    </select>
  </div>

  {#if currency === 'D&D currency'}
  <div>
    <ul>
      <li>cp: copper piece</li>
      <li>sp: silver piece (worth 10 copper pieces)</li>
      <li>ep: electrum piece (worth 50 copper pieces, rare)</li>
      <li>gp: gold piece (worth 10 silver pieces)</li>
      <li>pp: platinum piece (worth 10 gold pieces, rare)</li>
    </ul>
  </div>
  {:else if currency === 'English currency'}
  <div>
    <ul>
      <li>f: farthing</li>
      <li>d: pence (worth 4 farthings)</li>
      <li>s: shilling (worth 12 pence)</li>
      <li>c: crown (worth 5 shillings)</li>
      <li>£: pound (worth 20 shillings)</li>
    </ul>
  </div>
  {/if}

  {#each equipmentLists as eList}
  <div class="equipment-list">
    <h2>{ eList.title }</h2>
    <table>
      <thead>
      <tr>
        <th>Name</th>
        <th>Cost</th>
      </tr>
      </thead>
      <tbody>
        {#each eList.items as equipment}
      <tr>
        <td>{ equipment.name }</td>
        {#if currency === 'D&D currency'}
        <td>
          { convertDNDCost(equipment.cost) }
        </td>
        {:else if currency === 'English currency'}
        <td>
          { convertEnglishCost(equipment.cost) }
        </td>
        {/if}
      </tr>
      {/each}
      </tbody>
    </table>
  </div>
  {/each}
</section>
