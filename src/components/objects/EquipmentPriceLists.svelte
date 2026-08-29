<script lang="ts">
  import { valueToString, STANDARD_FANTASY, HISTORICAL_BRITISH } from '$lib/currency';
  import { FantasyEquipmentList } from '$lib/equipment';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SelectField from '$components/common/SelectField.svelte';

  let currency = $state('D&D currency');
  const equipmentLists = FantasyEquipmentList.all();

  const DND_CURRENCY = {
    ...STANDARD_FANTASY,
    denominations: STANDARD_FANTASY.denominations.filter(
      (d) => d.name !== 'electrum' && d.name !== 'platinum',
    ),
  };

  function convertDNDCost(cost: number) {
    return valueToString(cost, DND_CURRENCY);
  }

  function convertEnglishCost(cost: number) {
    return valueToString(cost * 0.25, HISTORICAL_BRITISH);
  }
</script>

<GeneratorPage toolPath="/fantasy/equipment" title="Fantasy Equipment Lists">
  {#snippet description()}
    <p>
      This page is meant to be a comprehensive list of equipment for fantasy games. It will be
      updated over time, so keep checking back for new entries.
    </p>
    <p>
      Where possible, I've based the prices off of historical data rather than fantasy sources. 1
      copper coin is treated as equivalent to 1 farthing.
    </p>
  {/snippet}

  <SelectField
    id="currency"
    label="Currency Type"
    bind:value={currency}
    options={['D&D currency', 'English currency']}
  />

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
      <h2>{eList.title}</h2>
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
              <td>{equipment.name}</td>
              {#if currency === 'D&D currency'}
                <td>
                  {convertDNDCost(equipment.cost)}
                </td>
              {:else if currency === 'English currency'}
                <td>
                  {convertEnglishCost(equipment.cost)}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/each}
</GeneratorPage>
