/** Tagged entries: `id` for generators and saves; `phrase` is natural language for prose. */

export type NonTheisticTagged = { id: string; phrase: string };

export const animismDomainPool: NonTheisticTagged[] = [
  { id: 'springs_and_rivermouths', phrase: 'springs and river mouths' },
  { id: 'storm_cells_and_lightning_struck_trees', phrase: 'storm cells and lightning-struck trees' },
  { id: 'boundary_stones_and_path_forks', phrase: 'boundary stones and path-forks' },
  { id: 'forest_edges_and_migration_corridors', phrase: 'forest edges and migration corridors' },
  { id: 'hearths_smithies_and_ovens', phrase: 'hearths, smithies, and ovens' },
  { id: 'plow_furrows_and_granaries', phrase: 'plow furrows and granaries' },
  { id: 'sickbeds_and_mourning_rooms', phrase: 'sickbeds and mourning rooms' },
  { id: 'harvest_heaps_and_market_stalls', phrase: 'harvest heaps and market stalls' },
];

export const animismObligationPool: NonTheisticTagged[] = [
  { id: 'first_fruits_before_long_journey', phrase: 'setting aside first fruits before a long journey' },
  { id: 'quiet_gifts_before_entering_old_wood', phrase: 'quiet gifts before entering old-growth wood' },
  { id: 'cool_water_poured_at_crossroads', phrase: 'pouring cool water at crossroads' },
  { id: 'repair_of_broken_boundary_marks', phrase: 'repairing broken boundary marks' },
  { id: 'naming_storms_when_they_pass', phrase: 'naming storms aloud when they pass' },
  {
    id: 'apology_weeds_left_where_quarry_stone_was_taken',
    phrase: 'leaving apology-weeds where quarry stone was taken',
  },
];

export const totemEmblemPool: NonTheisticTagged[] = [
  { id: 'river_otter', phrase: 'the river otter' },
  { id: 'red_elk', phrase: 'the red elk' },
  { id: 'thunderbird', phrase: 'the thunderbird' },
  { id: 'lichen_covered_boulder', phrase: 'the lichen-covered boulder' },
  { id: 'two_trunked_cedar', phrase: 'the two-trunked cedar' },
  { id: 'midnight_heron', phrase: 'the midnight heron' },
  { id: 'obsidian_flake', phrase: 'the obsidian flake' },
  { id: 'spring_salmon_run', phrase: 'the spring salmon run' },
];

export const totemObligationPool: NonTheisticTagged[] = [
  { id: 'initiation_into_emblem_knowledge', phrase: 'initiation into emblem knowledge' },
  { id: 'marriage_negotiation_across_emblem_lines', phrase: 'marriage negotiation across emblem lines' },
  { id: 'fast_from_emblem_flesh_except_feast_days', phrase: 'fasting from emblem flesh except on feast days' },
  {
    id: 'masking_and_dance_when_emblem_returns_in_story',
    phrase: 'masking and dance when the emblem returns in story',
  },
  { id: 'mending_emblem_regalia_after_shame', phrase: 'mending emblem regalia after public shame' },
];

export const ancestorShrinePool: NonTheisticTagged[] = [
  { id: 'north_wall_altar', phrase: 'the north-wall altar' },
  { id: 'household_niche_with_lamp', phrase: 'the household niche kept with a lamp' },
  { id: 'lineage_hall_table', phrase: 'the lineage-hall table' },
  { id: 'burial_mound_forecourt', phrase: 'the burial-mound forecourt' },
  { id: 'portable_tablets_on_travel', phrase: 'portable tablets carried on travel' },
];

export const ancestorObligationPool: NonTheisticTagged[] = [
  { id: 'regular_meal_portions_set_aside', phrase: 'regular meal portions set aside for the dead' },
  { id: 'newborn_presentation_at_shrine', phrase: 'presenting a newborn at the shrine' },
  { id: 'dispute_arbitration_invoking_eldest_names', phrase: 'arbitrating disputes by invoking eldest names' },
  { id: 'grave_tending_before_planting', phrase: 'tending graves before planting season' },
  { id: 'burning_titles_and_deeds_with_the_dead', phrase: 'burning titles and deeds with the dead' },
];

export const shamanRolePool: NonTheisticTagged[] = [
  { id: 'itinerant_mediator', phrase: 'itinerant mediators' },
  { id: 'village_called_specialist', phrase: 'village-called specialists' },
  { id: 'apprentice_line_with_memory_staves', phrase: 'apprentice lines who carry memory staves' },
  { id: 'part_time_healer_who_dreams_on_command', phrase: 'part-time healers who dream on command' },
  { id: 'kin_group_mediator', phrase: 'kin-group mediators' },
];

export const shamanJourneyPool: NonTheisticTagged[] = [
  { id: 'trance_ascent_on_drum_and_ember', phrase: 'trance ascent on drum and ember' },
  { id: 'underworld_descent_to_ransom_souls', phrase: 'underworld descent to ransom souls' },
  { id: 'negotiation_at_the_river_of_forgetting', phrase: 'negotiation at the river of forgetting' },
  { id: 'retrieval_of_wandered_soul_shards', phrase: 'retrieval of wandered soul-shards' },
  {
    id: 'bargaining_with_spirit_cohorts_who_guard_organs',
    phrase: 'bargaining with spirit cohorts who guard the organs',
  },
];

export const shamanPaymentPool: NonTheisticTagged[] = [
  { id: 'salt_tobacco_and_silver_coin', phrase: 'salt, tobacco, and silver coin' },
  { id: 'a_vow_of_public_service', phrase: 'a vow of public service' },
  { id: 'kin_labor_on_the_specialists_fields', phrase: "kin labor on the specialist's fields" },
  { id: 'a_story_only_the_family_may_repeat', phrase: 'a story only the family may repeat' },
];

export const pollutionPool: NonTheisticTagged[] = [
  {
    id: 'unshed_mourning_stains_tools',
    phrase: 'unshed mourning is said to stain tools until it is sung out',
  },
  {
    id: 'oaths_spoken_at_wrong_shrines_bite_back',
    phrase: 'oaths spoken at the wrong shrines are believed to bite back within a season',
  },
  {
    id: 'birth_blood_requires_seclusion_and_smoke',
    phrase: 'birth blood requires seclusion and cleansing smoke before the hearth is shared again',
  },
  {
    id: 'unpaid_promises_to_spirits_show_as_wasting',
    phrase: 'unpaid promises to spirits are thought to show up as wasting and broken luck',
  },
  {
    id: 'crossing_a_threshold_without_greeting_invites_mischief',
    phrase: 'crossing a threshold without greeting invites petty mischief from the place',
  },
];

export const purityRepairPool: NonTheisticTagged[] = [
  {
    id: 'washing_at_specific_springs_after_contact',
    phrase: 'washing at named springs after certain contacts restores standing',
  },
  {
    id: 'confession_to_elder_and_communal_meal',
    phrase: 'confession to an elder followed by a communal meal closes many small pollutions',
  },
  {
    id: 'fast_from_speech_until_dawn_breaks_clean',
    phrase: 'fasting from speech until dawn breaks clean is used after grave offense',
  },
  {
    id: 'gift_to_strangers_to_reset_reciprocity',
    phrase: 'a gift to strangers can reset reciprocity when accounts with the unseen tangle',
  },
  {
    id: 're_sanctifying_tools_with_herb_smoke_and_song',
    phrase: 're-sanctifying tools with herb smoke and song returns them to safe use',
  },
];
