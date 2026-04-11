// ============================================================
// FOOD IMAGE OVERRIDES — v0.133
// ============================================================
//
// Map food.id -> image URL. Used when no local thumb file
// exists at thumbs/foods/<food-id>.jpg
//
// LOAD ORDER (highest priority first):
//   1. thumbs/foods/<food-id>.jpg   (local file — recommended)
//   2. FOOD_IMAGE_OVERRIDES[id]     (this file — URL map)
//   3. SVG type icon                (automatic fallback)
//
// THE EASIEST WORKFLOW:
//   Take a phone photo of each food product on the shelf.
//   Save each one as <food-id>.jpg into the thumbs/foods/
//   folder. The app picks them up automatically — no code
//   change needed.
//
// To find a food's id, look at data/foods/catalog.js. The
// id is the first field on each line, e.g. "hikari-mysis"
// for Hikari Bio-Pure Mysis Shrimp.
//
// To use this URL map instead, uncomment the example lines
// below and replace with image URLs you trust to stay live.
// Best sources are the store's own hosted photos or the
// store's Shopify product images once that integration ships.
//
window.FOOD_IMAGE_OVERRIDES = {
  // Example entries — uncomment and edit to use:
  //
  // 'hikari-mysis':         'https://your-store-cdn.com/hikari-mysis.jpg',
  // 'lrs-reef-frenzy':      'https://your-store-cdn.com/lrs-reef-frenzy.jpg',
  // 'pe-mysis':             'https://your-store-cdn.com/pe-mysis.jpg',
  // 'reef-nutrition-tdo-small': 'https://your-store-cdn.com/tdo-small.jpg',
};
