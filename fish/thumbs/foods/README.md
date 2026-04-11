# Food product photos

Drop photos here named after the food id from `data/foods/catalog.js`.

**Examples:**
- `thumbs/foods/hikari-mysis.jpg` → Hikari Bio-Pure Mysis Shrimp
- `thumbs/foods/lrs-reef-frenzy.jpg` → LRS Reef Frenzy
- `thumbs/foods/pe-mysis.jpg` → PE Mysis
- `thumbs/foods/reef-nutrition-tdo-small.jpg` → TDO Chroma Boost Small

**Specs:**
- Format: JPG or PNG (use `.jpg` extension)
- Recommended size: 200x200 to 400x400 pixels (square works best)
- File size: keep under 200 KB each so the kiosk loads fast
- Background: any background works — the app crops them into a rounded frame

**Quickest workflow:**
1. Open the catalog file (`data/foods/catalog.js`) and find the food id you want
2. Snap a phone photo of that product on the shelf
3. Save the file as `<food-id>.jpg` in this folder
4. Reload the kiosk — the photo appears automatically

Foods without a photo file fall back to a colored SVG icon for that food type, so the app never breaks if a photo is missing.
