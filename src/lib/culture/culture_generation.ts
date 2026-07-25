import { RNG } from '@ironarachne/rng';
import type { Culture, CultureGenerationConfig, CulturalOrganization } from './culture_types';
import * as Words from '@ironarachne/words';
import * as MusicStyles from '$lib/music/music_styles';
import { getFantasyNameGeneratorSet } from '$lib/names';
import { generateReligion, getDefaultReligionGenerationConfig } from '$lib/religion';

export function describeOrganization(organization: CulturalOrganization): string {
  let description = `In this culture, ${organization.powerConcentration}. `;

  description += Words.capitalize(organization.dominantProfession) + ' are most highly regarded. ';

  if (organization.dominantGender) {
    description += Words.capitalize(organization.dominantGender) + '. ';
  }

  description += Words.capitalize(organization.socialMobility) + '. ';

  return description;
}

export function generateCulture(seed: string, config: CultureGenerationConfig): Culture {
  if (config.nameGenerators.country === null) {
    throw new Error('Culture generator config must have a country name generator set.');
  }
  if (config.nameGenerators.culture === null) {
    throw new Error('Culture generator config must have a culture name generator set.');
  }
  if (config.nameGenerators.family === null) {
    throw new Error('Culture generator config must have a family name generator set.');
  }
  if (config.nameGenerators.female === null) {
    throw new Error('Culture generator config must have a female name generator set.');
  }
  if (config.nameGenerators.male === null) {
    throw new Error('Culture generator config must have a male name generator set.');
  }
  if (config.nameGenerators.town === null) {
    throw new Error('Culture generator config must have a town name generator set.');
  }

  const rng = new RNG(seed);

  const relGenConfig = getDefaultReligionGenerationConfig();
  relGenConfig.nameGenerator = config.nameGenerators.family;
  relGenConfig.femaleNameGenerator = config.nameGenerators.female;
  relGenConfig.maleNameGenerator = config.nameGenerators.male;

  const cultureName = config.nameGenerators.culture.generate(1)[0];

  let musicStyle = MusicStyles.generateMusicStyle(rng).description;
  musicStyle = musicStyle.replace('This style of', cultureName);

  const culture = {
    name: cultureName,
    nameGenerators: config.nameGenerators,
    organization: generateCulturalOrganization(rng.randomString(16)),
    religion: generateReligion(rng.randomString(16), relGenConfig),
    taboos: randomTaboos(rng.randomString(16)),
    greeting: randomGreeting(rng.randomString(16)),
    eatingTrait: randomEatingTrait(rng.randomString(16)),
    designTrait: randomDesignTrait(rng.randomString(16)),
    musicStyle,
  };

  return culture;
}

export function generateCulturalOrganization(seed: string): CulturalOrganization {
  const organization = {
    dominantGender: randomDominantGender(seed),
    powerConcentration: randomPowerConcentration(seed),
    socialMobility: randomSocialMobility(seed),
    dominantProfession: randomDominantProfession(seed),
    description: '',
  };

  organization.description = describeOrganization(organization);

  return organization;
}

export function getDefaultCultureGenerationConfig(): CultureGenerationConfig {
  return {
    nameGenerators: getFantasyNameGeneratorSet('human', new RNG(Date.now())),
  };
}

function randomDominantGender(seed: string) {
  const rng = new RNG(seed);
  return rng.item(['women are dominant', 'men are dominant', 'neither gender is dominant']);
}

function randomPowerConcentration(seed: string) {
  const rng = new RNG(seed);
  return rng.item([
    'power is shared among multiple groups',
    'power is divided between two opposing groups',
    'power is distributed evenly among all individuals',
    'power is determined by a merit-based system',
    'power is determined by birthright',
    'power is determined by religious affiliation',
    'power is determined by wealth',
    'power is determined by military might',
    'power is determined by magical ability',
    'power is determined by age',
    'power is determined by educational attainment',
    'power is determined by popularity or public opinion',
  ]);
}

function randomSocialMobility(seed: string) {
  const rng = new RNG(seed);
  return rng.item([
    'social mobility is completely stagnant',
    'social mobility is only possible through military service',
    'social mobility is only possible through marriage',
    'social mobility is only possible through education',
    'social mobility is only possible through wealth accumulation',
    'social mobility is only possible through religious conversion',
    'social mobility is only possible through a special talent or skill',
    'social mobility is only possible through political connections',
    'social mobility is only possible through joining a particular profession or guild',
    'social mobility is possible through hard work and determination alone',
    'social mobility is possible for anyone who is willing to take risks and seize opportunities',
    'social mobility is only possible for those born into a certain social class',
    'social mobility is only possible for those who are part of a certain racial or ethnic group',
    'social mobility is only possible for those who are members of a certain secret society',
  ]);
}

function randomDominantProfession(seed: string) {
  const rng = new RNG(seed);
  return rng.item([
    'landowners',
    'merchants',
    'religious leaders',
    'intellectuals',
    'craftsmen',
    'farmers',
    'warriors',
  ]);
}

function randomDesignTrait(seed: string): string {
  const rng = new RNG(seed);
  const firstPart = rng.item([
    'Bright, vibrant colors',
    'Round shapes like circles, loops, and spirals',
    'Triangles',
    'Geometric shapes',
    'Squares and right angles',
    'Intricate geometric patterns',
    'Stylized images of animals',
    'Stylized images of heroes',
    'Stylized images of heroes and religious figures',
    'Images of weather events',
    'Images of important historical events',
    'Images of food',
    'Representations of family events',
    'Bold, contrasting colors',
    'Muted and earthy tones',
    'Neutral colors and pastels',
    'Metallic accents',
    'Floral patterns',
    'Nature-inspired motifs',
    'Repeating patterns',
    'Abstract shapes',
    'Organic shapes',
    'Minimalist designs',
    'Maximalist designs',
    'Whimsical design elements',
    'Industrial design elements',
  ]);

  const secondPart = rng.item([
    'are incorporated into everyday objects.',
    'are a hallmark of the local design aesthetic.',
    'are used in ceremonial and festive contexts.',
    'are considered a symbol of good luck and prosperity.',
    'are believed to have mystical or spiritual significance.',
    'are popular among the young generation.',
    'are a status symbol among the wealthy.',
    'are influenced by the latest fashion trends.',
    'are created using traditional techniques.',
    'are a fusion of different cultural influences.',
    'are designed to be functional as well as beautiful.',
    'are often customized to reflect personal tastes.',
    'are celebrated for their simplicity and elegance.',
  ]);

  return `${firstPart} ${secondPart}`;
}

function randomEatingTrait(seed: string): string {
  const rng = new RNG(seed);
  return rng.item([
    'Eating in large, multi-family or neighborhood groups is common. Strangers are welcome at these communal meals.',
    'Meals are served in large common vessels and each person is expected to serve themselves.',
    'Most meals are accompanied by a wide variety of small side dishes.',
    'A common custom to welcome a new person to a community is to serve them a special dish at a meal in their honor.',
    'Food is considered the great equalizer, and at communal feasts, social status is ignored.',
    'Eating is seen as a spiritual practice, with prayers and offerings made before and after meals.',
    'Certain foods are only eaten during specific times of the year, such as during religious holidays or seasonal celebrations.',
    'The presentation of food is highly valued, and elaborate, intricate arrangements are created for important meals.',
    'Food is often eaten with the hands or special utensils, rather than with conventional cutlery.',
    'Eating is a highly ritualized activity, with specific rules and protocols around how to serve and consume food.',
    'Certain dishes are believed to have specific health or medicinal benefits, and are consumed for this reason.',
    'Meals are seen as an opportunity for storytelling, with different dishes associated with different tales or legends.',
    'Eating is a highly social activity, and meals often last for several hours as people linger and chat over food and drink.',
    'There are strict rules around who is allowed to eat with whom, based on social status or other factors.',
    'Food is often preserved or fermented to allow for long-term storage and to add unique flavors and textures.',
    'Certain animals or plants are considered taboo and are not eaten, either for cultural or spiritual reasons.',
    'Eating is seen as a way to connect with the natural world, with an emphasis on locally-sourced and seasonal ingredients.',
    'There are specific dishes or meals that are associated with important life events, such as weddings or funerals.',
    'Eating is a competitive activity, with challenges and contests centered around how much or how quickly one can consume.',
    'Certain dishes or ingredients are believed to enhance or suppress specific emotions, and are consumed accordingly.',
    'Meals are often accompanied by music, dance, or other forms of performance art.',
  ]);
}

function randomGreeting(seed: string): string {
  const rng = new RNG(seed);
  return rng.item([
    'Bowing is customary. The person of lower status bows lower, though both bow.',
    'Friends or family clasp hands in greeting. In formal situations, shaking hands is expected.',
    'Formal situations require the lesser person to kneel. If the status difference is slight, it is only kneeling on one knee. If the status difference is great, the lesser person must prostrate themselves. In informal situations, simple nodding the head is acceptable.',
    'In casual situations like with friends, waving is a common greeting. Formal situations require slight bowing and recitation of a ritual greeting.',
    'Nose rubbing is customary. Two people rub their noses together as a sign of respect.',
    'A hug and kiss on each cheek is common among friends and family. In formal situations, a handshake is more appropriate.',
    'People touch the palms of their hands and then their foreheads when greeting. The gesture is meant to symbolize that the person is offering their thoughts and heart to the other person.',
    'A formal greeting involves a deep bow from the waist, with the head touching the floor. This greeting is used for people of much higher status, like a king or queen.',
    "The greeting involves placing a hand over one's heart and bowing slightly. This is a sign of respect and trust.",
    'People bow with their right hand placed over their heart as a greeting. This is a sign of respect and acknowledgement of the other person’s importance.',
    'People greet each other by making eye contact and nodding their heads. This is a sign of respect and acknowledgement of the other person’s presence.',
    'People show respect by kissing the hands of the person they are greeting. This is often done when greeting older people or those of higher social status.',
  ]);
}

function randomTaboos(seed: string): string[] {
  const rng = new RNG(seed);

  const items = [
    'Baring skin other than the face in public',
    'Eating animals',
    'Eating human flesh',
    'A gift of red fruit',
    'Dancing in public',
    'Discussing sex in public',
    'Playing music in public',
    'Ingesting mind-altering substances',
    'Drinking alcohol',
    'Joking about religion',
    'Speaking ill of authority figures',
    'Speaking during religious practices',
    'Wearing bright colors during a period of mourning',
    'Talking about death',
    'Mentioning the dead',
    'Prostitution',
    'Intermarrying with other cultures',
    'Intermarrying with other races',
    'Eating plants',
    'Socializing with the other sex',
    'Questioning figures of authority',
    'Drinking alcohol alone',
    'Displaying public affection',
    'Showing disrespect to elders',
    "Not covering one's head in public",
    'Failing to perform a traditional greeting',
    'Not washing hands before eating',
    'Wearing clothing of the opposite gender',
    'Refusing a gift',
    'Wasting food',
    'Not sharing food with others',
    'Failing to offer a gift to a visitor',
    'Sitting in a higher chair than someone of higher status',
    'Failing to offer a seat to an elder or pregnant woman',
    "Touching someone's head",
    "Eating with one's left hand",
    'Failing to remove shoes before entering a home',
    "Pointing the soles of one's feet at someone",
    'Refusing to participate in a religious ritual',
    'Singing outside of a designated area',
    'Wearing a hat indoors',
    'Failing to stand for the national anthem',
    "Failing to cover one's mouth while coughing or sneezing",
    'Carrying a knife or other weapon in public',
    "Crossing one's legs in public",
    'Leaving a door open',
    'Not standing when a respected person enters the room',
    'Wearing revealing clothing',
    'Giving a gift with one hand',
    'Whistling indoors',
    'Laughing loudly in public',
    'Not addressing someone by their proper title',
    'Wearing shoes on a bed or table',
    'Refusing to take part in a feast or celebration',
    'Talking during a religious procession',
    'Wearing dirty clothing in public',
    'Not using proper utensils while eating',
    "Failing to cover one's mouth while yawning",
    'Interrupting someone while they are speaking',
    'Failing to offer a drink to a visitor',
    'Not offering condolences to someone who has experienced a loss',
    'Failing to ask for permission before taking a photo',
    'Failing to hold the door open for someone',
    'Not making eye contact during a conversation',
    'Not saying "please" or "thank you" when appropriate',
    "Sitting with one's legs apart in public",
    "Taking food from someone else's plate",
    'Not offering a seat to someone in need',
  ];

  const contexts = [
    'is forbidden.',
    'is strictly forbidden.',
    'is considered bad manners.',
    'is considered very bad luck.',
    'is highly offensive.',
    'is very impolite.',
    'is considered a sign of weakness.',
    'is considered a sign of madness.',
    'is taboo.',
    'is shunned by society.',
    'is punishable by law.',
    'is punishable by death.',
    'is a grave sin.',
    'is believed to bring misfortune.',
    'is seen as sacrilegious.',
    'is a violation of cultural norms.',
    'is against the will of the gods.',
    'is seen as unclean.',
    'is associated with evil spirits.',
    'is a violation of ancestral traditions.',
    'is considered disrespectful to elders.',
    'is seen as a threat to social order.',
    'is considered an act of treachery.',
    'is associated with witchcraft and sorcery.',
    'is seen as a form of blasphemy.',
    'is believed to bring harm to others.',
    'is a violation of sacred laws.',
    'is a sign of moral degeneracy.',
    'is an offense against the natural order.',
  ];

  let possible = [];

  for (let i = 0; i < items.length; i++) {
    possible.push(`${items[i]} ${rng.item(contexts)}`);
  }

  const taboos: string[] = [];
  possible = rng.shuffle(possible);

  if (possible.length === 0) {
    throw new Error('No possible taboos to select from.');
  }

  const numberOfTaboos = rng.int(2, 5);

  if (numberOfTaboos > possible.length) {
    throw new Error(
      `Not enough possible taboos (${possible.length}) to select ${numberOfTaboos} unique taboos.`,
    );
  }

  for (let i = 0; i < numberOfTaboos; i++) {
    const taboo = possible.pop();
    if (taboo !== undefined) {
      taboos.push(taboo);
    }
  }

  return taboos;
}
