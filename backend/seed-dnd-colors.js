/**
 * Seed script: DND Duo nail color collection (#401–#819)
 * Fetches live product data from dndgel.com Shopify API.
 * images[0] = DOT (reference bottle), images[1] = SWATCH (hover/color photo)
 * Run: node seed-dnd-colors.js
 */
require('dotenv').config();
const https = require('https');
const mongoose = require('mongoose');
const NailColor = require('./models/NailColor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nailkolors';

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function fetchAllProducts() {
  const products = [];
  // Try both collections to get full coverage
  const collections = ['dnd-duo', 'all'];

  for (const collection of collections) {
    for (let page = 1; page <= 5; page++) {
      const url = `https://www.dndgel.com/collections/${collection}/products.json?limit=250&page=${page}`;
      try {
        const data = await fetchJSON(url);
        if (!data.products || data.products.length === 0) break;
        products.push(...data.products);
        console.log(`  Fetched ${collection} page ${page}: ${data.products.length} products`);
        if (data.products.length < 250) break;
        // small delay to be polite
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.warn(`  Failed ${url}: ${e.message}`);
        break;
      }
    }
  }
  return products;
}

// ---------------------------------------------------------------------------
// Parse color number from product title, e.g. "Cherry Mocha #751" -> 751
// ---------------------------------------------------------------------------
function parseColorNum(title) {
  const m = title.match(/#(\d{3,4})/);
  return m ? parseInt(m[1], 10) : null;
}

// ---------------------------------------------------------------------------
// Hex approximations based on color name semantics
// ---------------------------------------------------------------------------
function nameToHex(name) {
  const n = name.toLowerCase();
  if (/\bblack\b/.test(n))          return '#1a1a1a';
  if (/\bwhite\b|snow\s?flake|snow\s?way|ivory/.test(n)) return '#f5f0ee';
  if (/gold(?!en)/.test(n) && !/nail|red/.test(n)) return '#d4a843';
  if (/\bgolden\b/.test(n))          return '#c9a227';
  if (/\bsilver\b/.test(n))          return '#c0c0c0';

  if (/midnight|deep\s(mystery|royal|blue)|dark\s(sky|scarlet|rosewood)|night\s?sky|vast\s?galaxy|electric\s?night|ultra\s?violet/.test(n)) return '#1e1b4b';
  if (/blackberry|darkest/.test(n))  return '#2d1b3d';
  if (/licorice/.test(n))            return '#1c1c1c';

  if (/\bscarlet|striking\s?red|ferrari|dnd\s?red|red\s?mars|lucky\s?red|garnet|lady\s?in\s?red|crimson|cherry\s?bomb|red\s?rock|red\s?loub|universal\s?red|red\s?ombre/.test(n)) return '#c0392b';
  if (/\bred\b/.test(n))             return '#d42b2b';
  if (/raspberry|hot\s?raspberry/.test(n)) return '#c0305b';
  if (/\bwine|wanna\s?wine|plum\s?wine|burgundy|mauvy|brandy/.test(n)) return '#722f37';
  if (/mulberry|boysen/.test(n))     return '#8b3a62';
  if (/cherry\s?mocha|cherry\s?berry|cherry\s?blossom/.test(n)) return '#7b3a42';
  if (/\bcherry\b/.test(n))          return '#9b2335';
  if (/\bcrimson\b/.test(n))         return '#a31c2e';
  if (/\bmaroon\b/.test(n))          return '#800000';
  if (/boston\s?university/.test(n)) return '#cc0000';
  if (/rosewood|redwood/.test(n))    return '#9c3a3a';
  if (/\bcoral\b/.test(n))           return '#f08060';
  if (/flamingo/.test(n))            return '#fc8eac';
  if (/fuchsia|fuschia/.test(n))     return '#ff007f';
  if (/lava|hot\s?lava|bonfire/.test(n)) return '#cf1020';
  if (/chili/.test(n))               return '#c0392b';
  if (/\bmagenta\b/.test(n))         return '#ff00a0';

  if (/hot\s?pink|neon.*pink|barbie/.test(n)) return '#ff69b4';
  if (/baby\s?pink|baby\s?girl|pretty\s?in\s?pink|clear\s?pink|punch\s?marsh/.test(n)) return '#ffb6c1';
  if (/ballet|blushing|blush|shy\s?blush|muted\s?berry/.test(n)) return '#f4b8c0';
  if (/rose\s?petal|french\s?rose|french\s?tip|crayola\s?pink|pink\s?salmon|italian\s?pink|pink\s?beauty|pink\s?angel/.test(n)) return '#e8748a';
  if (/cotton\s?candy|candy\s?pink|pink\s?tulle|pink\s?mermaid|nova\s?pinky/.test(n)) return '#ffc0cb';
  if (/orchid/.test(n))              return '#da70d6';
  if (/\bpink\b/.test(n))            return '#e8698a';
  if (/strawberry/.test(n))          return '#fc5a8d';

  if (/\bviolet\b|classical\s?violet|vivid\s?violet/.test(n)) return '#8f00ff';
  if (/lavender/.test(n))            return '#b57bee';
  if (/\bpurple\b|purple\s?(spring|heart|pride|passion|scorpio|rain|glass)|kazoo|majestic\s?violet|monster\s?purple/.test(n)) return '#7b2fbe';
  if (/grape|plum\s?passion/.test(n)) return '#6b3a8c';
  if (/\bplum\b/.test(n))            return '#8e4585';
  if (/amethyst/.test(n))            return '#9966cc';
  if (/indigo/.test(n))              return '#4b0082';
  if (/\bmauve\b/.test(n))           return '#c47ec0';
  if (/eggplant/.test(n))            return '#614051';
  if (/lilac/.test(n))               return '#c8a2c8';

  if (/royal\s?(blue|violet|jewelry)|deep\s?royal|sapphire|fierce\s?sapphire|midnight\s?(blue|sapphire|kiss)|blue\s?(de\s?france|ash|earth|amber)/.test(n)) return '#1a3a8f';
  if (/navy/.test(n))                return '#001f5b';
  if (/\bblue\b/.test(n))            return '#4a90d9';
  if (/teal|gulf\s?stream|tropical\s?teal|caribbean/.test(n)) return '#008b8b';
  if (/northern\s?sky|moon\s?river|soaring\s?sky|blue\s?mist|glistening\s?sky|summer\s?sky|blue\s?(island|river|lake|hill|hawaiian|stone|bell)/.test(n)) return '#5b9bd5';
  if (/steel\s?a\s?kiss/.test(n))   return '#4682b4';
  if (/dark\s?sky/.test(n))          return '#1a3a6b';

  if (/\bemerald\b/.test(n))         return '#009b77';
  if (/\bmint\b/.test(n))            return '#aaf0d1';
  if (/pine\s?green|old\s?pine/.test(n)) return '#01796f';
  if (/\bgreen\b|spring\s?leaf|fountain\s?green|green\s?isle|greenwich|divine\s?green|teal.*fine|sour\s?apple|aurora\s?green|4\s?leaf|ode\s?to\s?green/.test(n)) return '#4caf50';
  if (/pistachio/.test(n))           return '#93c572';

  if (/\borange\b|portland\s?orange|terra\s?cotta|pastel\s?orange|russet\s?orange/.test(n)) return '#ff7043';
  if (/pumpkin|butternut/.test(n))   return '#e87722';
  if (/tangerine/.test(n))           return '#f28500';

  if (/lemon|citrus/.test(n))        return '#fff176';
  if (/\byellow\b/.test(n))          return '#fdd835';
  if (/\bhoney\b|buttered\s?corn|caramel\s?corn|caramel(?!ized)/.test(n)) return '#f0a500';
  if (/24\s?karat|burst\s?of\s?gold|gold\s?in\s?red/.test(n)) return '#ffd700';

  if (/nude|skin|porcelain|french\s?vanilla|linen\s?pink|velvet\s?cream|oak\s?buff/.test(n)) return '#f5d0b5';
  if (/peach(?!y)/.test(n))          return '#ffcba4';
  if (/\bpeachy\b|apricot|peachy\s?orange/.test(n)) return '#ffb347';
  if (/\bbeige\b|season\s?beige|honey\s?beige|hazelnut|havana\s?cream|miami\s?sand/.test(n)) return '#d4b896';
  if (/\bcream\b|creamy/.test(n))     return '#fffdd0';
  if (/\bbuff\b|champagne/.test(n))   return '#f5deb3';
  if (/\btaupe|dovetail|adobe/.test(n)) return '#b09a7a';
  if (/\bgray|grey|cool\s?gray|london\s?coach|silver\s?dreamer|pebble\s?cloud/.test(n)) return '#9e9e9e';

  if (/\bmocha\b|fudge|loving\s?walnut|sizzlin\s?cinnamon|cinnamon/.test(n)) return '#7d4e3a';
  if (/\bbrown\b/.test(n))           return '#795548';
  if (/ginger/.test(n))              return '#b5651d';
  if (/\bcaramelized\b/.test(n))     return '#a0522d';
  if (/sun\s?tan/.test(n))           return '#c68642';
  if (/\bwalnut\b/.test(n))          return '#5c3a1e';

  if (/glitter|sparkle|shimmer|holographic|twinkle|cosmic|stardust/.test(n)) return '#c9b1ff';
  if (/\bstar\b/.test(n))            return '#ffd700';
  if (/\bdiamond\b|legendary\s?diamond/.test(n)) return '#b9f2ff';
  if (/\bpearl\b/.test(n))           return '#f0e6e6';

  if (/spring|blossom|garden|floral/.test(n)) return '#f48fb1';
  if (/winter|icy|frosty|frozen|iceland|blizzard|ice\s?ice|snowcone/.test(n)) return '#b0e0e8';
  if (/autumn|fall/.test(n))         return '#c0622a';
  if (/sunset|sunrise/.test(n))      return '#ff7043';
  if (/tropical/.test(n))            return '#00bcd4';

  return '#c07890';
}

function nameToFinish(name) {
  const n = name.toLowerCase();
  if (/\bstar\b|glitter|sparkle|twinkle|shimmer|dazzle|glistening|sparkling|amethyst\s?sparkle|champagne\s?spark|holly\s?shimmer|nude\s?sparkle|brighten\s?stars|santa\s?stars|cosmic\s?dust|astral|metallica|starry/.test(n)) return 'Glitter';
  if (/\bcat\s?eye\b/.test(n)) return 'Cat Eyes';
  if (/holographic|rainbow/.test(n)) return 'Holographic';
  if (/matte/.test(n)) return 'Matte';
  return 'Shiny';
}

// ---------------------------------------------------------------------------
// DND color name list — used to fill gaps not returned by API
// ---------------------------------------------------------------------------
const DND_NAMES = {
  401:'Golden Sahara Star',402:'Firework Star',403:'Fuchsia Star',404:'Lavender Daisy Star',
  405:'Lush Lilac Star',406:'Frozen Wave',407:'Black Diamond Star',408:'Pinky Star',
  409:'Grape Field Star',410:'Ocean Night Star',411:'Shooting Star',412:'Golden Orange Star',
  413:'Flamingo Pink',414:'Summer Hot Pink',415:'Purple Heart',416:'Purple Pride',
  417:'Pinky Kinky',418:'Butternut Squash',419:'Havin Cabbler',420:'Bright Maroon',
  421:'Rose Petal Pink',422:'Portland Orange',423:'Glitter For You',424:'Lemon Juice',
  425:'Terra Cotta',426:'Pastel Orange',427:'Air Of Mint',428:'Rosewood',
  429:'Boston University Red',430:'Ferrari Red',431:'Raspberry',432:'Dark Scarlet',
  433:'Pool Party',434:'Gulf Stream',435:'Spring Leaf',436:'Baby Blue',
  437:'Blue De France',438:'Island Oasis',439:'Purple Spring',440:'Papaya Whip',
  441:'Clear Pink',442:'Silver Star',443:'Twinkle Little Star',444:'Short N Sweet',
  445:'Melting Violet',446:'Woodlake',447:'Black Licorice',448:'Snow Flake',
  449:'First Kiss',450:'Sweet Purple',451:'Rock N Rose',452:'Sweet Romance',
  453:'Plum Wine',454:'Fiery Flamingo',455:'Plum Passion',456:'Cherry Berry',
  457:"Violet's Secret",458:'Fresh Eggplant',459:'Muted Berry',460:'Deep Mystery',
  461:'Pretty In Pink',462:'Desert Spice',463:'Hot Jazz',464:'Fairy Wings',
  465:'Royal Jewelry',466:'Brandy Wine',467:'Legendary Diamond',468:'Northern Sky',
  469:'Vast Galaxy',470:'Love Letter',471:'Emerald Stone',472:'Forgotten Pink',
  473:'French Tip',474:'Striking Red',475:'Fiery Fuchsia',476:'Gold In Red',
  477:'Red Stone',478:'Spiced Berry',479:'Queen of Grape',480:'Magic Night',
  481:'Burst of Gold',482:'Charming Cherry',483:'Pink Angel',484:'Sun Of Pink',
  485:'First Impression',486:'Classical Violet',487:'Fairy Dream',488:'Season Beige',
  489:'Antique Purple',490:'Redwood City',491:'Royal Violet',492:'Lavender Prophet',
  493:'Lilac Season',494:'Magical Mauve',495:'Shimmer Sky',496:'Ballet Slipper',
  497:'Baby Girl',498:'Lipstick',499:'Be My Valentine',501:'Haven Angel',
  502:'Soft Orange',503:'Orange Smoothie',504:'Orange Aura',505:'Hot Pink',
  506:'Summer Sun',507:'Neon Purple',508:'Tropical Teal',509:'Sapphire Stone',
  510:'Peach Cider',511:'Nude Sparkle',512:'Bubble Pop',513:'Ode To Green',
  514:'Soaring Sky',515:'Tropical Waterfall',516:'Just 4 You',517:'Lollipop',
  518:'4 Season',519:'Strawberry Candy',520:'Kool Berry',521:'Ice Berry Cocktail',
  522:'Pomegranate',523:'Rainbow Day',524:'Green To Green',525:'Dark Sky Light',
  526:'Sea By Night',527:'Night Sky',528:'Blue Island',529:'Blue River',
  530:'Blue Lake',531:'Fountain Green',532:'Green Isle',533:'Greenwich',
  534:'Pink Hill',535:'Rose City',536:'Creamy Macaroon',537:'Panther Pink',
  538:'Princess Pink',539:'Candy Pink',540:'Orchid Garden',541:'Euro Fuchsia',
  542:'Lovely Lavender',543:'Purple Passion',544:'Orange Cove',545:'Peachy Orange',
  546:'Golden Gardens',547:'Niagara Falls',548:'Red Carpet',549:'Rainbow Falls',
  550:'Coral Castle',551:'Blushing Pink',552:'Victorian Blush',553:'Fairy World',
  554:'Candy Crush',555:'Peach Fuzz',556:'Coral Reef',557:'Hot Raspberry',
  558:'Cherry Blossom',559:'Teenage Dream',560:'Orange Ville',561:'Strawberry Kiss',
  562:'Red Lake',563:'DND Red',564:'Butterfly World',565:'Sunset Crater',
  566:'Red Rock',567:'Grand Canyon',568:'Green Forest AK',569:'Green Spring',
  570:'Blue Hill',571:'Blue Ash',572:'Great Smoky Mountain',573:'Lavender Blue',
  574:'Blue Bell',575:'Blue Earth',576:'Misty Rose',577:'French Rose',
  578:'Crayola Pink',579:'Violet Femmes',580:'Vivid Violet',581:'Grape Jelly',
  582:'Emerald Quartz',583:'Blue Amber',584:'24 Karat',585:'Lotus',
  586:'Pink Salmon',587:'Peach Cream',588:'Citrus Hill',589:'Princess Pink',
  590:'Rose Water',591:'Linen Pink',592:'Italian Pink',593:'Pink Beauty',
  594:'Mulberry',595:'Velvet Cream',596:'Oak Buff',597:'Lavender Dream',
  598:'Melody',599:'Sunset Fog',601:'Ballet Pink',602:'Elegant Pink',
  603:'Dolce Pink',604:'Cool Gray',605:'Dovetail',606:'London Coach',
  607:'Hazelnut',608:'Adobe',609:'Peachy Keen',610:'Orange Grove',
  611:'Creamy Peach',612:'Jovial',613:'Cinnamon Whip',614:'Sun Tan',
  615:'Honey Beige',616:'Havana Cream',617:'Porcelain',618:'Peach Buff',
  619:'Sweet Apricot',620:'Miami Sand',621:'French Vanilla',622:'Midnight Blue',
  623:'Santa Stars',624:'Cosmic Dust',625:'Merry Von',626:'Brighten Stars',
  627:'Loving Walnut',628:'Dark Rosewood',629:'Secret Plum',630:'Boysenberry',
  631:'Fuschia in Beauty',632:'Lady In Red',633:'Garnet Red',634:'Reddish Purple',
  635:'Burgundy Mist',636:'Candy Cane',637:'Lucky Red',638:'Red Mars',
  639:'Exotic Pink',640:'Barbie Pink',641:'Pink Temptation',642:'Magenta Aura',
  643:'Fuchsia Touch',644:'Pinkie Promise',645:'Pink Watermelon',646:'Shy Blush',
  647:'Rouge Couture',648:'Strawberry Bubble',649:'Orange Creamsicle',650:'Floral Coral',
  651:'Punch Marshmallow',652:'Lychee Peachy',653:'Spring Fling',654:'Pumpkin Spice',
  655:'Pure Cantaloupe',656:'Midnight Hour',657:'Monster Purple',658:'Basic Plum',
  659:'Majestic Violet',660:'Indigo Glow',661:'Mauvy Night',662:'Kazoo Purple',
  663:'Lavender Pop',664:'Teal Deal',665:'Pine Green',666:'Caribbean Sea',
  667:'Mint Tint',668:'Sweet Pistachio',669:'Fierce Sapphire',670:'Steel a Kiss',
  671:'Blue Hawaiian',672:'Midnight Kiss',673:'Summer Sky',674:'Purple Scorpio',
  675:'Red Eyeshadow',676:'Universal Red',677:'Red Ombre',678:'Red Louboutin',
  679:'Pink Mermaid',680:'Autumn Leaves',681:'Hot Pink Patrol',682:'Guardian Slimmer',
  683:'Cinder Shoes',684:'Pink Tulle',685:'Nova Pinky',686:'Sexy Kiss',
  687:'Grape Nectar',688:'Holly Shimmer',689:'Red Ribbons',690:'Hot Lava',
  691:'Striking Sunrise',692:'Deep Royal Blue',693:'Sugar Spun',694:'Moon River Blue',
  695:'Blackberry Blast',696:'Caramelized Plum',697:'Sizzlin Cinnamon',698:'Amethyst Sparkles',
  699:'Cherry Bomb',701:'Wanna Wine',702:'Astral Blast',703:'Purple Glass',
  704:'Nova Magenta',705:'Silver Dreamer',706:'Orchid Lust',707:'Sweet Nothing',
  708:'Warming Rose',709:'Georgia Peach',710:'Champagne Sparkles',711:'Kandy',
  712:'Ruth',713:'Orange Sherbet',714:'Ginger',715:'Island Punch',
  716:'Peach',717:'Fantasy',718:'Pink Grapefruit',719:'Tutti Frutti',
  720:'Gumball',721:'Princess Cupcake',722:'Strawberry Cheesecake',723:'Zippy',
  724:'Jiggles',725:'Sugar Crush',726:'Whirly Pop',727:'Pixie',
  728:'Purple Rain',729:'Ambrosia',730:'Mixed Berries',731:'Plum',
  732:'Joy',733:'Heartbreak',734:'Berry Blue',735:'Cosmopolitan',
  736:'Watermelon',737:'Crushed Grape',738:'Lollie',739:'Velvet',
  740:'Dazzle',741:'Diamond Eyes',742:'Minty Mint',743:'Mike Ike',
  744:'Caramel Corn',745:'Honey',746:'Buttered Corn',747:'Aurora Green',
  748:'4 Leaf Clover',749:'Old Pine',750:'Fudgsicle',751:'Cherry Mocha',
  752:'Winter Wine',753:'Scarlett Dreams',754:'Winter Berry',755:'Jinx',
  756:'Bonfire',757:'Chili Pepper',758:'Electric Night',759:'Lava',
  760:'Russet Orange',761:'Blue Mist',762:'Midnight Sapphire',763:'Ultra Violet',
  764:'Indigo Wishes',765:'Iceland',766:'Mistletoe Mania',767:'Sparkling Shine',
  768:'Metallica Plum',769:'Glistening Sky',770:'Holy Berry',771:'Crimson Sunset',
  772:'Nutcracker',773:'Holiday Pomegranate',774:'Gypsy Light',775:"Boo'd Up",
  776:'Ice Ice Baby',777:'Stormi',778:'Bizzy Blizzard',779:'Snow Way!',
  780:'Champagne Winter',781:'Starry Night',782:"Feelin' Frosty",783:'Melty Sunshine',
  784:'Smiley',785:'Voodoo',786:'Sour Apple',787:'Carousel',
  788:'Deja Vu',789:'Super-bounce',790:'Divine Green',791:'Teal-in Fine',
  792:'Bubbles',793:'Seaside',794:'Rock n Blue',795:'Super-Nova',
  796:'Roll the Dice',797:'Pebble Cloud',798:'Twister',799:'Queen of Hearts',
  801:'Blossom',802:'Honeymoon',803:'Tangerine Dream',804:"Let's Tango",
  805:'Peaches n Cream',806:'Pink Matter',807:'Cotton Candy',808:'Glowing Daisy',
  809:'Soulflower',810:'Sunkissed',811:'Guava',812:'Sweet Tooth',
  813:'Sour Adventure',814:'Speed Dial',815:'Tropicana Daze',816:'Snowcone',
  817:'Circus Chic',818:'Popsicle',819:'Guilty Pleasure',
};

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  console.log('Fetching product data from dndgel.com...');
  const allProducts = await fetchAllProducts();

  // Deduplicate by color number — last fetched wins (dnd-duo preferred since fetched first)
  const byNum = new Map();
  for (const p of allProducts) {
    const num = parseColorNum(p.title);
    if (!num || num < 401 || num > 819) continue;
    if (!byNum.has(num)) {
      byNum.set(num, p);
    }
  }
  console.log(`Found ${byNum.size} unique DND colors from API`);

  const deleted = await NailColor.deleteMany({ brand: 'DND' });
  console.log(`Removed ${deleted.deletedCount} existing DND colors`);

  const docs = [];
  const missing = [];

  for (let num = 401; num <= 819; num++) {
    if (num === 500 || num === 600 || num === 700) continue; // gaps in DND range
    const name = DND_NAMES[num];
    if (!name) continue;

    const product = byNum.get(num);
    let dotImage = '';
    let image = '';

    if (product && product.images && product.images.length > 0) {
      dotImage = product.images[0].src || '';
      image = product.images.length > 1 ? product.images[1].src : product.images[0].src;
    } else {
      missing.push(num);
    }

    docs.push({
      colorName: `${name} #${num}`,
      brand: 'DND',
      colorCode: nameToHex(name),
      finishType: nameToFinish(name),
      quantity: 1,
      status: 'available',
      image,
      dotImage,
    });
  }

  if (missing.length > 0) {
    console.warn(`⚠️  No API data for ${missing.length} colors: ${missing.join(', ')}`);
  }

  const inserted = await NailColor.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} DND Duo colors`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
