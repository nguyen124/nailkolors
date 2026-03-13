/**
 * Seed script: DND Duo nail color collection (#401–#819)
 * Run: node seed-dnd-colors.js
 * Requires backend running OR set MONGO_URI env var for direct DB insert.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const NailColor = require('./models/NailColor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nailkolors';

// ---------------------------------------------------------------------------
// SWATCH (hover) image URLs scraped from dndgel.com/collections/dnd-duo
// These are the 2nd image per product — the nail swatch shown on hover.
// ---------------------------------------------------------------------------
const CDN = 'https://cdn.shopify.com/s/files/1/0695/1583/7721';

// SWATCH images (2nd/hover image shown on collection page)
const KNOWN_IMAGES = {
  403: `${CDN}/files/DND-403-DUO.png?v=1755193697`,
  404: `${CDN}/files/DND-404-SWATCH.png?v=1755193698`,
  405: `${CDN}/files/DND-405-SWATCH.png?v=1755193700`,
  406: `${CDN}/files/DND-406-DUO.png?v=1755193701`,
  412: `${CDN}/files/DND-412-DUO.png?v=1755195269`,
  413: `${CDN}/files/DND-413-SWATCH_2.png?v=1755193712`,
  414: `${CDN}/files/DND-414-SWATCH_2.png?v=1755193714`,
  426: `${CDN}/files/DND-426-SWATCH.jpg?v=1755193731`,
  429: `${CDN}/products/Boston-University-Red-DND-429.jpg?v=1755193737`,
  430: `${CDN}/products/dnd-430-ferrrari-red.jpg?v=1756925302`,
  435: `${CDN}/files/DND-435-SWATCH.png?v=1756928560`,
  438: `${CDN}/files/DND-438-SWATCH.png?v=1756934995`,
  447: `${CDN}/files/DND-447-SWATCH.png?v=1756942635`,
  448: `${CDN}/products/448-3.jpg?v=1756942768`,
  450: `${CDN}/files/DND-450-SWATCH_73fba46a-9297-422e-9eae-61faa7ca1356.png?v=1756944164`,
  457: `${CDN}/files/DND-457-SWATCH.png?v=1757004918`,
  470: `${CDN}/files/470copy.webp?v=1756839841`,
  473: `${CDN}/products/dnd-473.jpg?v=1756849833`,
  484: `${CDN}/files/DND-484-SWATCH_5ebf10f9-521f-4ad5-9688-01d4dedf5d47.png?v=1757024203`,
  498: `${CDN}/files/498copy.webp?v=1759777007`,
  510: `${CDN}/files/510copy.webp?v=1759780747`,
  517: `${CDN}/files/517copy.webp?v=1759792925`,
  518: `${CDN}/files/518copy.webp?v=1759793375`,
  529: `${CDN}/files/DND-529-DOT.jpg?v=1755193876`,
  532: `${CDN}/files/DND-532-SWATCH.jpg?v=1755193881`,
  536: `${CDN}/files/DND-536-SWATCH.jpg?v=1759863478`,
  537: `${CDN}/files/DND-537-SWATCH.png?v=1759863805`,
  539: `${CDN}/files/DND-539-DUO.png?v=1755545726`,
  542: `${CDN}/files/DND-542-DUO.webp?v=1759875539`,
  544: `${CDN}/files/DND-544-SWATCH.jpg?v=1755193899`,
  553: `${CDN}/files/DND-553-DOT.webp?v=1759961483`,
  554: `${CDN}/files/DND-554-DUO.png?v=1759961694`,
  555: `${CDN}/files/DND-555-SWATCH.png?v=1759962225`,
  571: `${CDN}/files/DND-571-SWATCH.png?v=1760031397`,
  573: `${CDN}/files/DND-573-SWATCH.png?v=1760032181`,
  574: `${CDN}/files/DND-574-SWATCH.png?v=1760385053`,
  584: `${CDN}/files/DND-584-SWATCH.png?v=1755624023`,
  585: `${CDN}/files/DND-585-DUO.png?v=1760046966`,
  587: `${CDN}/files/DND-587-DUO.png?v=1760051161`,
  591: `${CDN}/files/DND-591-DUO.webp?v=1760053958`,
  601: `${CDN}/files/Ballet_Pink_DND_601.jpg?v=1760393825`,
  606: `${CDN}/products/dnd-london-coach-606.jpg?v=1760459341`,
  608: `${CDN}/files/DND-608.jpg?v=1755193984`,
  618: `${CDN}/products/peach-buff-dnd618.jpg?v=1760549883`,
  622: `${CDN}/files/DND-622-DUO.png?v=1760554078`,
  623: `${CDN}/files/DND-623-DOT.png?v=1762198742`,
  627: `${CDN}/files/DND-627-DUO.png?v=1755713305`,
  631: `${CDN}/files/DND-631-DUO.png?v=1760557011`,
  633: `${CDN}/files/DND-633-FS.png?v=1768866407`,
  636: `${CDN}/files/DND-636-DOT.png?v=1755718256`,
  640: `${CDN}/files/DND-640-FS_2.png?v=1760565368`,
  642: `${CDN}/files/DND-642-SWATCH.jpg?v=1760565532`,
  643: `${CDN}/files/DND-643-DUO.png?v=1760566614`,
  656: `${CDN}/files/DND-656-SWATCH_2.jpg?v=1760727682`,
  671: `${CDN}/files/671.webp?v=1761160166`,
  672: `${CDN}/products/672-1.jpg?v=1761160968`,
  694: `${CDN}/files/DND-694-SWATCH.png?v=1755194084`,
  696: `${CDN}/files/696.webp?v=1756340398`,
  699: `${CDN}/files/699.webp?v=1756340457`,
  701: `${CDN}/files/DND-701-SWATCH.png?v=1755194094`,
  703: `${CDN}/files/DND-703-SWATCH_2.png?v=1771870794`,
  705: `${CDN}/files/705.webp?v=1756340537`,
  706: `${CDN}/files/DND-706-SWATCH.png?v=1755194101`,
  708: `${CDN}/files/DND-708-SWATCH.png?v=1755195248`,
  714: `${CDN}/products/714-1.jpg?v=1768592962`,
  716: `${CDN}/files/peach-dnd716-dnd-gel-polish.jpg?v=1768594713`,
  717: `${CDN}/files/717.webp?v=1756340786`,
  726: `${CDN}/products/whirly-pop.jpg?v=1772576981`,
  731: `${CDN}/files/DND-731-SWATCH_dcea6c45-2a04-4185-aaa0-249e1746dcb2.png?v=1755194478`,
  734: `${CDN}/files/DND-734-SWATCH_2.png?v=1755194482`,
  736: `${CDN}/files/DND-736-SWATCH.png?v=1755194486`,
  738: `${CDN}/files/DND-738-DUO.webp?v=1758747513`,
  740: `${CDN}/files/DND-740-SWATCH_3.png?v=1772576616`,
  741: `${CDN}/files/DND-741-FS.png?v=1755194495`,
  744: `${CDN}/products/dndgel-caramel-corn-dnd-744.jpg?v=1768866145`,
  745: `${CDN}/files/DND-745-FS.png?v=1772576461`,
  747: `${CDN}/products/DND-747-2.jpg?v=1755195215`,
  748: `${CDN}/files/DND-748-SWATCH_2.png?v=1765483430`,
  749: `${CDN}/products/749-2.jpg?v=1756497833`,
  750: `${CDN}/files/DND-750-SWATCH_951bc105-d7bd-4436-9784-c90ec04e69fc.png?v=1763489998`,
  751: `${CDN}/files/DND-751-SWATCH_1c6cf85f-a37a-465f-932f-b08f354523b0.png?v=1755195227`,
  753: `${CDN}/files/DND-753-SWATCH.png?v=1755195231`,
  757: `${CDN}/products/757.jpg?v=1762197935`,
  772: `${CDN}/files/772.webp?v=1756341863`,
  785: `${CDN}/products/Voo-Doo-785_721a2f50-d0e8-4f6a-989b-097a4e746607.jpg?v=1772576070`,
  787: `${CDN}/products/Carousel-787_a5aab8b5-49c0-4149-a4c4-46f51c421f38.jpg?v=1755195033`,
  792: `${CDN}/products/Bubbles-DND-792_0fbcf80a-34e4-4e50-8604-cd666748bc1a.jpg?v=1772575687`,
  795: `${CDN}/files/supernovadnd795swatch.webp?v=1769106708`,
  805: `${CDN}/files/DND-805-FS.png?v=1755194885`,
  807: `${CDN}/products/cotton-candy-dnd807_681a7496-baf7-4c7c-bbd6-94fe435fe63b.jpg?v=1772578412`,
};

// For colors not in the map, fall back to the standard SWATCH pattern
function colorImage(numStr) {
  const num = parseInt(numStr.replace('#', ''), 10);
  return KNOWN_IMAGES[num] || `${CDN}/files/DND-${num}-SWATCH.png`;
}

// DOT images (1st image on product card — reference bottle shot)
const KNOWN_DOT_IMAGES = {
  403: `${CDN}/files/DND-403-DOT.png?v=1755193697`,
  404: `${CDN}/files/DND-404-DOT.png?v=1755193698`,
  405: `${CDN}/files/DND-405-DOT.png?v=1755193700`,
  406: `${CDN}/files/DND-406-DOT_1.png?v=1755193701`,
  412: `${CDN}/files/DND-412-DOT.png?v=1755195269`,
  413: `${CDN}/files/DND-413-DOT.png?v=1755193712`,
  414: `${CDN}/files/DND-414-DOT.png?v=1755193714`,
  426: `${CDN}/files/DND-426-DOT_1.png?v=1762198852`,
  429: `${CDN}/files/DND-429-DOT.png?v=1762198849`,
  430: `${CDN}/files/DND-430-DOT.webp?v=1756925302`,
  435: `${CDN}/files/DND-435-DOT.webp?v=1756928560`,
  438: `${CDN}/files/DND-438-DOT.webp?v=1756934995`,
  447: `${CDN}/files/DND-447-DOT.webp?v=1756942635`,
  448: `${CDN}/files/DND-448-DOT.webp?v=1756942768`,
  450: `${CDN}/files/DND-450-DOT.webp?v=1756944164`,
  457: `${CDN}/files/DND-457-DOT.webp?v=1757004918`,
  470: `${CDN}/files/DND-470-DOT.webp?v=1756839841`,
  473: `${CDN}/files/DND-473-DOT.webp?v=1756849833`,
  484: `${CDN}/files/DND-484-DOT.webp?v=1757024203`,
  498: `${CDN}/files/DND-498-DOT.webp?v=1759777007`,
  510: `${CDN}/files/DND-510-DOT.webp?v=1759780747`,
  517: `${CDN}/files/DND-517-DOT.webp?v=1759792925`,
  518: `${CDN}/files/DND-518-DOT.webp?v=1759793375`,
  529: `${CDN}/files/DND-529-DOT.png?v=1762198784`,
  532: `${CDN}/files/DND-532-DOT.png?v=1762198784`,
  536: `${CDN}/files/DND-536-DOT.webp?v=1759863478`,
  537: `${CDN}/files/DND-537-DOT.webp?v=1759863805`,
  539: `${CDN}/products/duo_swatch_539-1.jpg?v=1762198782`,
  542: `${CDN}/files/DND-542-DOT.webp?v=1759875539`,
  544: `${CDN}/files/DND-544-DOT_1.png?v=1762198781`,
  553: `${CDN}/files/DND-553-DOT.webp?v=1759961483`,
  554: `${CDN}/files/DND-554-DOT.webp?v=1759961694`,
  555: `${CDN}/files/DND-555-DOT.webp?v=1759962225`,
  571: `${CDN}/files/DND-571-DOT.webp?v=1760031397`,
  573: `${CDN}/files/DND-573-DOT.webp?v=1762198774`,
  574: `${CDN}/files/DND-574-DOT-SWATCH.png?v=1762198774`,
  584: `${CDN}/files/DND-584-DOT.png?v=1755624023`,
  585: `${CDN}/files/DND-585-DOT.webp?v=1760046966`,
  587: `${CDN}/files/DND-587-DOT.webp?v=1760051161`,
  591: `${CDN}/files/DND-591-DOT.webp?v=1760053958`,
  601: `${CDN}/files/DND-601-DOT.webp?v=1760393825`,
  606: `${CDN}/files/DND-606-DOT.webp?v=1760459341`,
  608: `${CDN}/files/DND-608-DOT.png?v=1762198750`,
  618: `${CDN}/files/DND-618-DOT.webp?v=1760549883`,
  622: `${CDN}/files/DND-622-DOT.webp?v=1760554192`,
  623: `${CDN}/files/DND-623-DOT.png?v=1762198742`,
  627: `${CDN}/files/DND-627-DOT.png?v=1755713308`,
  631: `${CDN}/files/DND-631-DOT.png?v=1755716164`,
  633: `${CDN}/files/DND-633-DOT.png?v=1762198735`,
  636: `${CDN}/files/DND-636-DOT.png?v=1755718256`,
  640: `${CDN}/files/DND-640-DOT.webp?v=1760565368`,
  642: `${CDN}/files/DND-642-DOT.webp?v=1760565532`,
  643: `${CDN}/files/DND-643-DOT.webp?v=1760566614`,
  656: `${CDN}/files/DND-656-DOT.webp?v=1760727682`,
  671: `${CDN}/files/DND-671-DOT.webp?v=1761160166`,
  672: `${CDN}/files/DND-672-DOT.webp?v=1761160968`,
  694: `${CDN}/products/duo_swatch_694-1.jpg?v=1762198703`,
  696: `${CDN}/products/duo_swatch_696-1.jpg?v=1762198701`,
  699: `${CDN}/products/duo_swatch_699-1.jpg?v=1762198699`,
  701: `${CDN}/products/duo_swatch_701-1.jpg?v=1762198699`,
  703: `${CDN}/products/duo_swatch_703-1.jpg?v=1762198697`,
  705: `${CDN}/products/duo_swatch_705-1.jpg?v=1762198696`,
  706: `${CDN}/products/duo_swatch_706-1.jpg?v=1762198694`,
  708: `${CDN}/products/duo_swatch_708-1.jpg?v=1762198693`,
  714: `${CDN}/files/DND-714-DOT.webp?v=1764713150`,
  716: `${CDN}/files/DND-716-DOT.png?v=1762198492`,
  717: `${CDN}/products/717.jpg?v=1762198491`,
  726: `${CDN}/files/DND-726-DOT.webp?v=1772576981`,
  731: `${CDN}/products/731.jpg?v=1762198483`,
  734: `${CDN}/files/DND-734-DOT.png?v=1762198480`,
  736: `${CDN}/products/736.jpg?v=1762198479`,
  738: `${CDN}/files/DND-738-DOT.png?v=1762198478`,
  740: `${CDN}/files/DND-740-DOT.webp?v=1772576616`,
  741: `${CDN}/products/741.jpg?v=1762198476`,
  744: `${CDN}/products/744.jpg?v=1762198475`,
  745: `${CDN}/files/DND-745-DOT.webp?v=1772576461`,
  747: `${CDN}/files/DND-747-DOT.png?v=1762197942`,
  748: `${CDN}/files/DND-748-DOT.webp?v=1764955072`,
  749: `${CDN}/products/749.jpg?v=1762197940`,
  750: `${CDN}/files/DND-750-DOT.png?v=1762197939`,
  751: `${CDN}/files/DND-751-DOT.png?v=1762197939`,
  753: `${CDN}/products/753.jpg?v=1762197937`,
  757: `${CDN}/products/757.jpg?v=1762197935`,
  772: `${CDN}/products/772.jpg?v=1762197909`,
  785: `${CDN}/files/DND-785-DOT.webp?v=1772576070`,
  787: `${CDN}/products/DND787.jpg?v=1762198239`,
  792: `${CDN}/files/DND-792-DOT.webp?v=1772575687`,
  795: `${CDN}/files/DND-795-DOT.png?v=1762198218`,
  805: `${CDN}/products/DND805.jpg?v=1762198228`,
  807: `${CDN}/files/DND-807-DOT.webp?v=1772578412`,
};

function dotColorImage(numStr) {
  const num = parseInt(numStr.replace('#', ''), 10);
  return KNOWN_DOT_IMAGES[num] || `${CDN}/files/DND-${num}-DOT.webp`;
}

// ---------------------------------------------------------------------------
// Hex approximations based on color name semantics
// ---------------------------------------------------------------------------
function nameToHex(name) {
  const n = name.toLowerCase();
  // Exact / high-confidence matches first
  if (/\bblack\b/.test(n))          return '#1a1a1a';
  if (/\bwhite\b|snow\s?flake|snow\s?way|ivory/.test(n)) return '#f5f0ee';
  if (/gold(?!en)/.test(n) && !/nail|red/.test(n)) return '#d4a843';
  if (/\bgolden\b/.test(n))          return '#c9a227';
  if (/\bsilver\b/.test(n))          return '#c0c0c0';

  // Dark / deep
  if (/midnight|deep\s(mystery|royal|blue)|dark\s(sky|scarlet|rosewood)|night\s?sky|vast\s?galaxy|electric\s?night|ultra\s?violet/.test(n)) return '#1e1b4b';
  if (/blackberry|darkest/.test(n))  return '#2d1b3d';
  if (/licorice/.test(n))            return '#1c1c1c';

  // Reds
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

  // Pinks
  if (/hot\s?pink|neon.*pink|barbie/.test(n)) return '#ff69b4';
  if (/baby\s?pink|baby\s?girl|pretty\s?in\s?pink|clear\s?pink|punch\s?marsh/.test(n)) return '#ffb6c1';
  if (/ballet|blushing|blush|shy\s?blush|muted\s?berry/.test(n)) return '#f4b8c0';
  if (/rose\s?petal|french\s?rose|french\s?tip|crayola\s?pink|pink\s?salmon|italian\s?pink|pink\s?beauty|pink\s?angel/.test(n)) return '#e8748a';
  if (/cotton\s?candy|candy\s?pink|pink\s?tulle|pink\s?mermaid|nova\s?pinky/.test(n)) return '#ffc0cb';
  if (/orchid/.test(n))              return '#da70d6';
  if (/\bpink\b/.test(n))            return '#e8698a';
  if (/strawberry/.test(n))          return '#fc5a8d';

  // Purples / Violets / Lavender
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

  // Blues
  if (/royal\s?(blue|violet|jewelry)|deep\s?royal|sapphire|fierce\s?sapphire|midnight\s?(blue|sapphire|kiss)|blue\s?(de\s?france|ash|earth|amber|amber)/.test(n)) return '#1a3a8f';
  if (/navy/.test(n))                return '#001f5b';
  if (/\bblue\b/.test(n))            return '#4a90d9';
  if (/teal|gulf\s?stream|tropical\s?teal|caribbean/.test(n)) return '#008b8b';
  if (/northern\s?sky|moon\s?river|soaring\s?sky|blue\s?mist|glistening\s?sky|summer\s?sky|blue\s?(island|river|lake|hill|hawaiian|stone|bell)/.test(n)) return '#5b9bd5';
  if (/steel\s?a\s?kiss/.test(n))   return '#4682b4';
  if (/dark\s?sky/.test(n))          return '#1a3a6b';

  // Greens
  if (/\bemerald\b/.test(n))         return '#009b77';
  if (/\bmint\b/.test(n))            return '#aaf0d1';
  if (/pine\s?green|old\s?pine/.test(n)) return '#01796f';
  if (/\bgreen\b|spring\s?leaf|fountain\s?green|green\s?isle|greenwich|divine\s?green|teal.*fine|sour\s?apple|aurora\s?green|4\s?leaf|ode\s?to\s?green/.test(n)) return '#4caf50';
  if (/pistachio/.test(n))           return '#93c572';

  // Oranges
  if (/\borange\b|portland\s?orange|terra\s?cotta|pastel\s?orange|russet\s?orange/.test(n)) return '#ff7043';
  if (/pumpkin|butternut/.test(n))   return '#e87722';
  if (/tangerine/.test(n))           return '#f28500';

  // Yellows / Golds
  if (/lemon|citrus/.test(n))        return '#fff176';
  if (/\byellow\b/.test(n))          return '#fdd835';
  if (/\bhoney\b|buttered\s?corn|caramel\s?corn|caramel(?!ized)/.test(n)) return '#f0a500';
  if (/24\s?karat|burst\s?of\s?gold|gold\s?in\s?red/.test(n)) return '#ffd700';

  // Peachy / Nude / Beige / Skin
  if (/nude|skin|porcelain|french\s?vanilla|linen\s?pink|velvet\s?cream|oak\s?buff/.test(n)) return '#f5d0b5';
  if (/peach(?!y)/.test(n))          return '#ffcba4';
  if (/\bpeachy\b|apricot|peachy\s?orange/.test(n)) return '#ffb347';
  if (/\bbeige\b|season\s?beige|honey\s?beige|hazelnut|havana\s?cream|miami\s?sand/.test(n)) return '#d4b896';
  if (/\bcream\b|creamy/.test(n))     return '#fffdd0';
  if (/\bbuff\b|champagne/.test(n))   return '#f5deb3';
  if (/\btaupe|dovetail|adobe/.test(n)) return '#b09a7a';
  if (/\bgray|grey|cool\s?gray|london\s?coach|silver\s?dreamer|pebble\s?cloud/.test(n)) return '#9e9e9e';

  // Browns / Mochas / Warm nudes
  if (/\bmocha\b|fudge|loving\s?walnut|sizzlin\s?cinnamon|cinnamon/.test(n)) return '#7d4e3a';
  if (/\bbrown\b/.test(n))           return '#795548';
  if (/ginger/.test(n))              return '#b5651d';
  if (/\bcaramelized\b/.test(n))     return '#a0522d';
  if (/sun\s?tan/.test(n))           return '#c68642';
  if (/\bwalnut\b/.test(n))          return '#5c3a1e';

  // Glitter / Sparkle / Star / Shimmer / Holographic
  if (/glitter|sparkle|shimmer|holographic|twinkle|cosmic|stardust/.test(n)) return '#c9b1ff';
  if (/\bstar\b/.test(n))            return '#ffd700';
  if (/\bdiamond\b|legendary\s?diamond/.test(n)) return '#b9f2ff';
  if (/\bpearl\b/.test(n))           return '#f0e6e6';

  // Seasonal / Descriptive
  if (/spring|blossom|garden|floral/.test(n)) return '#f48fb1';
  if (/winter|icy|frosty|frozen|iceland|blizzard|ice\s?ice|snowcone/.test(n)) return '#b0e0e8';
  if (/autumn|fall/.test(n))         return '#c0622a';
  if (/sunset|sunrise/.test(n))      return '#ff7043';
  if (/tropical/.test(n))            return '#00bcd4';

  // Fallback by broad color group based on first word
  return '#c07890'; // warm rose as final fallback
}

// ---------------------------------------------------------------------------
// DND Duo color list (#401–#819)
// ---------------------------------------------------------------------------
const DND_COLORS = [
  ['#401','Golden Sahara Star'],['#402','Firework Star'],['#403','Fuchsia Star'],
  ['#404','Lavender Daisy Star'],['#405','Lush Lilac Star'],['#406','Frozen Wave'],
  ['#407','Black Diamond Star'],['#408','Pinky Star'],['#409','Grape Field Star'],
  ['#410','Ocean Night Star'],['#411','Shooting Star'],['#412','Golden Orange Star'],
  ['#413','Flamingo Pink'],['#414','Summer Hot Pink'],['#415','Purple Heart'],
  ['#416','Purple Pride'],['#417','Pinky Kinky'],['#418','Butternut Squash'],
  ['#419','Havin Cabbler'],['#420','Bright Maroon'],['#421','Rose Petal Pink'],
  ['#422','Portland Orange'],['#423','Glitter For You'],['#424','Lemon Juice'],
  ['#425','Terra Cotta'],['#426','Pastel Orange'],['#427','Air Of Mint'],
  ['#428','Rosewood'],['#429','Boston University Red'],['#430','Ferrari Red'],
  ['#431','Raspberry'],['#432','Dark Scarlet'],['#433','Pool Party'],
  ['#434','Gulf Stream'],['#435','Spring Leaf'],['#436','Baby Blue'],
  ['#437','Blue De France'],['#438','Island Oasis'],['#439','Purple Spring'],
  ['#440','Papaya Whip'],['#441','Clear Pink'],['#442','Silver Star'],
  ['#443','Twinkle Little Star'],['#444','Short N Sweet'],['#445','Melting Violet'],
  ['#446','Woodlake'],['#447','Black Licorice'],['#448','Snow Flake'],
  ['#449','First Kiss'],['#450','Sweet Purple'],['#451','Rock N Rose'],
  ['#452','Sweet Romance'],['#453','Plum Wine'],['#454','Fiery Flamingo'],
  ['#455','Plum Passion'],['#456','Cherry Berry'],['#457','Violet\'s Secret'],
  ['#458','Fresh Eggplant'],['#459','Muted Berry'],['#460','Deep Mystery'],
  ['#461','Pretty In Pink'],['#462','Desert Spice'],['#463','Hot Jazz'],
  ['#464','Fairy Wings'],['#465','Royal Jewelry'],['#466','Brandy Wine'],
  ['#467','Legendary Diamond'],['#468','Northern Sky'],['#469','Vast Galaxy'],
  ['#470','Love Letter'],['#471','Emerald Stone'],['#472','Forgotten Pink'],
  ['#473','French Tip'],['#474','Striking Red'],['#475','Fiery Fuchsia'],
  ['#476','Gold In Red'],['#477','Red Stone'],['#478','Spiced Berry'],
  ['#479','Queen of Grape'],['#480','Magic Night'],['#481','Burst of Gold'],
  ['#482','Charming Cherry'],['#483','Pink Angel'],['#484','Sun Of Pink'],
  ['#485','First Impression'],['#486','Classical Violet'],['#487','Fairy Dream'],
  ['#488','Season Beige'],['#489','Antique Purple'],['#490','Redwood City'],
  ['#491','Royal Violet'],['#492','Lavender Prophet'],['#493','Lilac Season'],
  ['#494','Magical Mauve'],['#495','Shimmer Sky'],['#496','Ballet Slipper'],
  ['#497','Baby Girl'],['#498','Lipstick'],['#499','Be My Valentine'],
  ['#501','Haven Angel'],['#502','Soft Orange'],['#503','Orange Smoothie'],
  ['#504','Orange Aura'],['#505','Hot Pink'],['#506','Summer Sun'],
  ['#507','Neon Purple'],['#508','Tropical Teal'],['#509','Sapphire Stone'],
  ['#510','Peach Cider'],['#511','Nude Sparkle'],['#512','Bubble Pop'],
  ['#513','Ode To Green'],['#514','Soaring Sky'],['#515','Tropical Waterfall'],
  ['#516','Just 4 You'],['#517','Lollipop'],['#518','4 Season'],
  ['#519','Strawberry Candy'],['#520','Kool Berry'],['#521','Ice Berry Cocktail'],
  ['#522','Pomegranate'],['#523','Rainbow Day'],['#524','Green To Green'],
  ['#525','Dark Sky Light'],['#526','Sea By Night'],['#527','Night Sky'],
  ['#528','Blue Island'],['#529','Blue River'],['#530','Blue Lake'],
  ['#531','Fountain Green'],['#532','Green Isle'],['#533','Greenwich'],
  ['#534','Pink Hill'],['#535','Rose City'],['#536','Creamy Macaroon'],
  ['#537','Panther Pink'],['#538','Princess Pink'],['#539','Candy Pink'],
  ['#540','Orchid Garden'],['#541','Euro Fuchsia'],['#542','Lovely Lavender'],
  ['#543','Purple Passion'],['#544','Orange Cove'],['#545','Peachy Orange'],
  ['#546','Golden Gardens'],['#547','Niagara Falls'],['#548','Red Carpet'],
  ['#549','Rainbow Falls'],['#550','Coral Castle'],['#551','Blushing Pink'],
  ['#552','Victorian Blush'],['#553','Fairy World'],['#554','Candy Crush'],
  ['#555','Peach Fuzz'],['#556','Coral Reef'],['#557','Hot Raspberry'],
  ['#558','Cherry Blossom'],['#559','Teenage Dream'],['#560','Orange Ville'],
  ['#561','Strawberry Kiss'],['#562','Red Lake'],['#563','DND Red'],
  ['#564','Butterfly World'],['#565','Sunset Crater'],['#566','Red Rock'],
  ['#567','Grand Canyon'],['#568','Green Forest AK'],['#569','Green Spring'],
  ['#570','Blue Hill'],['#571','Blue Ash'],['#572','Great Smoky Mountain'],
  ['#573','Lavender Blue'],['#574','Blue Bell'],['#575','Blue Earth'],
  ['#576','Misty Rose'],['#577','French Rose'],['#578','Crayola Pink'],
  ['#579','Violet Femmes'],['#580','Vivid Violet'],['#581','Grape Jelly'],
  ['#582','Emerald Quartz'],['#583','Blue Amber'],['#584','24 Karat'],
  ['#585','Lotus'],['#586','Pink Salmon'],['#587','Peach Cream'],
  ['#588','Citrus Hill'],['#589','Princess Pink'],['#590','Rose Water'],
  ['#591','Linen Pink'],['#592','Italian Pink'],['#593','Pink Beauty'],
  ['#594','Mulberry'],['#595','Velvet Cream'],['#596','Oak Buff'],
  ['#597','Lavender Dream'],['#598','Melody'],['#599','Sunset Fog'],
  ['#601','Ballet Pink'],['#602','Elegant Pink'],['#603','Dolce Pink'],
  ['#604','Cool Gray'],['#605','Dovetail'],['#606','London Coach'],
  ['#607','Hazelnut'],['#608','Adobe'],['#609','Peachy Keen'],
  ['#610','Orange Grove'],['#611','Creamy Peach'],['#612','Jovial'],
  ['#613','Cinnamon Whip'],['#614','Sun Tan'],['#615','Honey Beige'],
  ['#616','Havana Cream'],['#617','Porcelain'],['#618','Peach Buff'],
  ['#619','Sweet Apricot'],['#620','Miami Sand'],['#621','French Vanilla'],
  ['#622','Midnight Blue'],['#623','Santa Stars'],['#624','Cosmic Dust'],
  ['#625','Merry Von'],['#626','Brighten Stars'],['#627','Loving Walnut'],
  ['#628','Dark Rosewood'],['#629','Secret Plum'],['#630','Boysenberry'],
  ['#631','Fuschia in Beauty'],['#632','Lady In Red'],['#633','Garnet Red'],
  ['#634','Reddish Purple'],['#635','Burgundy Mist'],['#636','Candy Cane'],
  ['#637','Lucky Red'],['#638','Red Mars'],['#639','Exotic Pink'],
  ['#640','Barbie Pink'],['#641','Pink Temptation'],['#642','Magenta Aura'],
  ['#643','Fuchsia Touch'],['#644','Pinkie Promise'],['#645','Pink Watermelon'],
  ['#646','Shy Blush'],['#647','Rouge Couture'],['#648','Strawberry Bubble'],
  ['#649','Orange Creamsicle'],['#650','Floral Coral'],['#651','Punch Marshmallow'],
  ['#652','Lychee Peachy'],['#653','Spring Fling'],['#654','Pumpkin Spice'],
  ['#655','Pure Cantaloupe'],['#656','Midnight Hour'],['#657','Monster Purple'],
  ['#658','Basic Plum'],['#659','Majestic Violet'],['#660','Indigo Glow'],
  ['#661','Mauvy Night'],['#662','Kazoo Purple'],['#663','Lavender Pop'],
  ['#664','Teal Deal'],['#665','Pine Green'],['#666','Caribbean Sea'],
  ['#667','Mint Tint'],['#668','Sweet Pistachio'],['#669','Fierce Sapphire'],
  ['#670','Steel a Kiss'],['#671','Blue Hawaiian'],['#672','Midnight Kiss'],
  ['#673','Summer Sky'],['#674','Purple Scorpio'],['#675','Red Eyeshadow'],
  ['#676','Universal Red'],['#677','Red Ombre'],['#678','Red Louboutin'],
  ['#679','Pink Mermaid'],['#680','Autumn Leaves'],['#681','Hot Pink Patrol'],
  ['#682','Guardian Slimmer'],['#683','Cinder Shoes'],['#684','Pink Tulle'],
  ['#685','Nova Pinky'],['#686','Sexy Kiss'],['#687','Grape Nectar'],
  ['#688','Holly Shimmer'],['#689','Red Ribbons'],['#690','Hot Lava'],
  ['#691','Striking Sunrise'],['#692','Deep Royal Blue'],['#693','Sugar Spun'],
  ['#694','Moon River Blue'],['#695','Blackberry Blast'],['#696','Caramelized Plum'],
  ['#697','Sizzlin Cinnamon'],['#698','Amethyst Sparkles'],['#699','Cherry Bomb'],
  ['#701','Wanna Wine'],['#702','Astral Blast'],['#703','Purple Glass'],
  ['#704','Nova Magenta'],['#705','Silver Dreamer'],['#706','Orchid Lust'],
  ['#707','Sweet Nothing'],['#708','Warming Rose'],['#709','Georgia Peach'],
  ['#710','Champagne Sparkles'],['#711','Kandy'],['#712','Ruth'],
  ['#713','Orange Sherbet'],['#714','Ginger'],['#715','Island Punch'],
  ['#716','Peach'],['#717','Fantasy'],['#718','Pink Grapefruit'],
  ['#719','Tutti Frutti'],['#720','Gumball'],['#721','Princess Cupcake'],
  ['#722','Strawberry Cheesecake'],['#723','Zippy'],['#724','Jiggles'],
  ['#725','Sugar Crush'],['#726','Whirly Pop'],['#727','Pixie'],
  ['#728','Purple Rain'],['#729','Ambrosia'],['#730','Mixed Berries'],
  ['#731','Plum'],['#732','Joy'],['#733','Heartbreak'],
  ['#734','Berry Blue'],['#735','Cosmopolitan'],['#736','Watermelon'],
  ['#737','Crushed Grape'],['#738','Lollie'],['#739','Velvet'],
  ['#740','Dazzle'],['#741','Diamond Eyes'],['#742','Minty Mint'],
  ['#743','Mike Ike'],['#744','Caramel Corn'],['#745','Honey'],
  ['#746','Buttered Corn'],['#747','Aurora Green'],['#748','4 Leaf Clover'],
  ['#749','Old Pine'],['#750','Fudgsicle'],['#751','Cherry Mocha'],
  ['#752','Winter Wine'],['#753','Scarlett Dreams'],['#754','Winter Berry'],
  ['#755','Jinx'],['#756','Bonfire'],['#757','Chili Pepper'],
  ['#758','Electric Night'],['#759','Lava'],['#760','Russet Orange'],
  ['#761','Blue Mist'],['#762','Midnight Sapphire'],['#763','Ultra Violet'],
  ['#764','Indigo Wishes'],['#765','Iceland'],['#766','Mistletoe Mania'],
  ['#767','Sparkling Shine'],['#768','Metallica Plum'],['#769','Glistening Sky'],
  ['#770','Holy Berry'],['#771','Crimson Sunset'],['#772','Nutcracker'],
  ['#773','Holiday Pomegranate'],['#774','Gypsy Light'],['#775','Boo\'d Up'],
  ['#776','Ice Ice Baby'],['#777','Stormi'],['#778','Bizzy Blizzard'],
  ['#779','Snow Way!'],['#780','Champagne Winter'],['#781','Starry Night'],
  ['#782','Feelin\' Frosty'],['#783','Melty Sunshine'],['#784','Smiley'],
  ['#785','Voodoo'],['#786','Sour Apple'],['#787','Carousel'],
  ['#788','Deja Vu'],['#789','Super-bounce'],['#790','Divine Green'],
  ['#791','Teal-in Fine'],['#792','Bubbles'],['#793','Seaside'],
  ['#794','Rock n Blue'],['#795','Super-Nova'],['#796','Roll the Dice'],
  ['#797','Pebble Cloud'],['#798','Twister'],['#799','Queen of Hearts'],
  ['#801','Blossom'],['#802','Honeymoon'],['#803','Tangerine Dream'],
  ['#804','Let\'s Tango'],['#805','Peaches n Cream'],['#806','Pink Matter'],
  ['#807','Cotton Candy'],['#808','Glowing Daisy'],['#809','Soulflower'],
  ['#810','Sunkissed'],['#811','Guava'],['#812','Sweet Tooth'],
  ['#813','Sour Adventure'],['#814','Speed Dial'],['#815','Tropicana Daze'],
  ['#816','Snowcone'],['#817','Circus Chic'],['#818','Popsicle'],
  ['#819','Guilty Pleasure'],
];

// Determine finish type from name
function nameToFinish(name) {
  const n = name.toLowerCase();
  if (/\bstar\b|glitter|sparkle|twinkle|shimmer|dazzle|glistening|sparkling|amethyst\s?sparkle|champagne\s?spark|holly\s?shimmer|nude\s?sparkle|brighten\s?stars|santa\s?stars|cosmic\s?dust|astral|metallica|starry/.test(n)) return 'Glitter';
  if (/\bcat\s?eye\b/.test(n)) return 'Cat Eyes';
  if (/holographic|rainbow/.test(n)) return 'Holographic';
  if (/matte/.test(n)) return 'Matte';
  return 'Shiny';
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // Remove existing DND colors to avoid duplication
  const deleted = await NailColor.deleteMany({ brand: 'DND' });
  console.log(`Removed ${deleted.deletedCount} existing DND colors`);

  const docs = DND_COLORS.map(([num, name]) => ({
    colorName: `${name} ${num}`,
    brand: 'DND',
    colorCode: nameToHex(name),
    finishType: nameToFinish(name),
    quantity: 1,
    status: 'available',
    image: colorImage(num),
    dotImage: dotColorImage(num),
  }));

  const inserted = await NailColor.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} DND Duo colors`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
