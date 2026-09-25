export const builderSections = [
  'subject',
  'purpose',
  'style',
  'background',
  'outfit',
  'pose',
  'expression',
  'mood',
  'lighting',
  'time',
  'weather',
  'colorGrading',
  'cultural',
  'camera',
  'accessories',
  'effects',
  'identityPreservation',
  'basePromptTemplates',
]

export const subjects = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'couples', label: 'Couples' },
  { value: 'family', label: 'Family' },
]

export const purposes = [
  { value: 'facebook-profile', label: 'Facebook Profile', ratio: '1:1' },
  { value: 'facebook-cover', label: 'Facebook Cover', ratio: '1.91:1' },
  { value: 'facebook-post', label: 'Facebook Post', ratio: '4:5' },
  { value: 'facebook-story', label: 'Facebook Story', ratio: '9:16' },
  { value: 'facebook-reels', label: 'Facebook Reels', ratio: '9:16' },
  { value: 'instagram-post', label: 'Instagram Post', ratio: '4:5' },
  { value: 'instagram-story', label: 'Instagram Story', ratio: '9:16' },
  { value: 'instagram-reels', label: 'Instagram Reels', ratio: '9:16' },
  { value: 'whatsapp-dp', label: 'WhatsApp DP', ratio: '1:1' },
  { value: 'youtube-thumbnail', label: 'YouTube Thumbnail', ratio: '16:9' },
  { value: 'youtube-shorts', label: 'YouTube Shorts', ratio: '9:16' },
  { value: 'linkedin-profile', label: 'LinkedIn Profile', ratio: '1:1' },
  { value: 'general-portrait', label: 'General Portrait', ratio: '4:5' },
  { value: 'custom', label: 'Custom', ratio: 'custom' },
]

export const styles = [
  { value: 'modern', label: 'Modern' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'retro', label: 'Retro' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'street-style', label: 'Street Style' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'anime', label: 'Anime' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'old-money', label: 'Old Money' },
  { value: 'dark', label: 'Dark' },
  { value: 'soft-aesthetic', label: 'Soft Aesthetic' },
  { value: 'professional', label: 'Professional' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'film-photography', label: 'Film Photography' },
]

export const backgrounds = {
  nature: [
    { value: 'mountain', label: 'Mountain' },
    { value: 'forest', label: 'Forest' },
    { value: 'river', label: 'River' },
    { value: 'lake', label: 'Lake' },
    { value: 'waterfall', label: 'Waterfall' },
    { value: 'beach', label: 'Beach' },
    { value: 'field', label: 'Field' },
    { value: 'sunset-field', label: 'Sunset Field' },
    { value: 'village', label: 'Village' },
    { value: 'village-road', label: 'Village Road' },
    { value: 'garden', label: 'Garden' },
    { value: 'flower-garden', label: 'Flower Garden' },
    { value: 'romantic-garden', label: 'Romantic Garden' },
    { value: 'park', label: 'Park' },
    { value: 'tea-garden', label: 'Tea Garden' },
  ],
  urban: [
    { value: 'dhaka-street', label: 'Dhaka Street' },
    { value: 'modern-city', label: 'Modern City' },
    { value: 'city-street', label: 'City Street' },
    { value: 'rooftop', label: 'Rooftop' },
    { value: 'cafe', label: 'Café' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'mall', label: 'Mall' },
    { value: 'office', label: 'Office' },
    { value: 'studio', label: 'Studio' },
    { value: 'luxury-hotel', label: 'Luxury Hotel' },
    { value: 'airport', label: 'Airport' },
    { value: 'resort', label: 'Resort' },
  ],
  travel: [
    { value: 'historical-place', label: 'Historical Place' },
    { value: 'desert', label: 'Desert' },
    { value: 'snow-mountain', label: 'Snow Mountain' },
    { value: 'european-street', label: 'European Street' },
    { value: 'tropical-island', label: 'Tropical Island' },
  ],
  special: [
    { value: 'palace', label: 'Palace' },
    { value: 'mansion', label: 'Mansion' },
    { value: 'castle', label: 'Castle' },
    { value: 'fantasy-kingdom', label: 'Fantasy Kingdom' },
    { value: 'cyberpunk-city', label: 'Cyberpunk City' },
    { value: 'neon-street', label: 'Neon Street' },
    { value: 'old-house', label: 'Old House' },
    { value: 'vintage-studio', label: 'Vintage Studio' },
  ],
  local: [
    { value: 'rural-bangladesh', label: 'Rural Bangladesh' },
    { value: 'urban-bangladesh', label: 'Urban Bangladesh' },
  ],
  none: [{ value: 'none', label: 'None' }],
}

// Subject-aware view of background / location options for the Appearance section.
// Values reuse existing background ids where an existing id already represents the same
// location; only genuinely new locations get new ids.
export const appearanceBackgroundsBySubject = {
  boys: [
    { value: 'tea-garden', label: 'Tea Garden', group: 'nature' },
    { value: 'river', label: 'Riverside', group: 'nature' },
    { value: 'village-road', label: 'Village Road', group: 'nature' },
    { value: 'field', label: 'Open Field', group: 'nature' },
    { value: 'forest', label: 'Forest', group: 'nature' },
    { value: 'park', label: 'Park', group: 'nature' },
  ],
  girls: [
    { value: 'flower-garden', label: 'Flower Garden', group: 'nature' },
    { value: 'tea-garden', label: 'Tea Garden', group: 'nature' },
    { value: 'river', label: 'Riverside', group: 'nature' },
    { value: 'park', label: 'Park', group: 'nature' },
    { value: 'forest', label: 'Forest', group: 'nature' },
    { value: 'lake', label: 'Lakeside', group: 'nature' },
  ],
  couples: [
    { value: 'river', label: 'Riverside', group: 'nature' },
    { value: 'beach', label: 'Beach', group: 'nature' },
    { value: 'tea-garden', label: 'Tea Garden', group: 'nature' },
    { value: 'romantic-garden', label: 'Romantic Garden', group: 'nature' },
    { value: 'city-street', label: 'City Street', group: 'urban' },
    { value: 'cafe', label: 'Café', group: 'urban' },
    { value: 'sunset-field', label: 'Sunset Field', group: 'nature' },
  ],
  family: [
    { value: 'garden', label: 'Garden', group: 'nature' },
    { value: 'park', label: 'Park', group: 'nature' },
    { value: 'village-road', label: 'Village Road', group: 'nature' },
    { value: 'river', label: 'Riverside', group: 'nature' },
    { value: 'tea-garden', label: 'Tea Garden', group: 'nature' },
    { value: 'field', label: 'Open Field', group: 'nature' },
    { value: 'beach', label: 'Beach', group: 'nature' },
    { value: 'lake', label: 'Lakeside', group: 'nature' },
    { value: 'old-house', label: 'Old House', group: 'special' },
    { value: 'rural-bangladesh', label: 'Rural Bangladesh', group: 'local' },
  ],
}

export const outfits = {
  general: [
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'party', label: 'Party' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'streetwear', label: 'Streetwear' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'old-money', label: 'Old Money' },
    { value: 'business', label: 'Business' },
    { value: 'sportswear', label: 'Sportswear' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'winter', label: 'Winter' },
    { value: 'summer', label: 'Summer' },
  ],
  desi: [
    { value: 'traditional-bangladeshi', label: 'Traditional Bangladeshi' },
    { value: 'panjabi', label: 'Panjabi' },
    { value: 'saree', label: 'Saree' },
    { value: 'kurta', label: 'Kurta' },
    { value: 'suit', label: 'Suit' },
    { value: 't-shirt-jeans', label: 'T-shirt & Jeans' },
    { value: 'lungi-t-shirt', label: 'Lungi & T-shirt' },
  ],
  custom: [{ value: 'custom', label: 'Custom' }],
  none: [{ value: 'none', label: 'None' }],
}

// Garment-level options for the Appearance section.
// These are intentionally separate from the scalar `outfits` list above, which stays untouched.
// Multi-selection is handled the same way as `accessories` / `effects`.
//
// Phase 6: clothing is defined per person (`menGarmentOptions` / `womenGarmentOptions`) and the
// subject-aware view (`garmentOptionsBySubject`) reuses those same option objects, so no garment
// data is duplicated anywhere.
const menGarmentOptions = {
  upper: [
    { value: 'shirt', label: 'Shirt' },
    { value: 't-shirt', label: 'T-shirt' },
    { value: 'panjabi', label: 'Panjabi' },
    { value: 'men-polo-shirt', label: 'Polo Shirt' },
    { value: 'men-kurta', label: 'Kurta' },
    { value: 'men-tank-top', label: 'Tank Top' },
  ],
  outerwear: [
    { value: 'blazer', label: 'Blazer' },
    { value: 'men-hoodie', label: 'Hoodie' },
    { value: 'men-sweater', label: 'Sweater' },
    { value: 'men-denim-jacket', label: 'Denim Jacket' },
    { value: 'men-leather-jacket', label: 'Leather Jacket' },
  ],
  lower: [
    { value: 'jeans', label: 'Jeans' },
    { value: 'men-trousers', label: 'Trousers' },
    { value: 'men-pants', label: 'Pants' },
    { value: 'men-chinos', label: 'Chinos' },
    { value: 'men-shorts', label: 'Shorts' },
    { value: 'men-cargo-pants', label: 'Cargo Pants' },
  ],
  traditionalLower: [
    { value: 'pajama', label: 'Pajama' },
    { value: 'lungi', label: 'Lungi' },
  ],
  footwear: [
    { value: 'formal-shoes', label: 'Formal Shoes' },
    { value: 'sneakers', label: 'Sneakers' },
    { value: 'sandals', label: 'Sandals' },
    { value: 'men-loafers', label: 'Loafers' },
    { value: 'men-boots', label: 'Boots' },
  ],
  accessories: [
    { value: 'belt', label: 'Belt' },
    { value: 'tie', label: 'Tie' },
    { value: 'watch', label: 'Watch' },
    { value: 'men-cap', label: 'Cap' },
    { value: 'men-sunglasses', label: 'Sunglasses' },
    { value: 'men-wallet', label: 'Wallet' },
  ],
}

// Women's clothing uses globally unique ids (`women-*`) and its own group keys (`women*`),
// so a men's "Shirt" and a women's "Shirt" can never be confused in state or in the prompt.
const womenGarmentOptions = {
  womenUpper: [
    { value: 'women-blouse', label: 'Blouse' },
    { value: 'women-t-shirt', label: 'T-shirt' },
    { value: 'women-shirt', label: 'Shirt' },
    { value: 'women-tunic', label: 'Tunic' },
    { value: 'women-polo-shirt', label: 'Polo Shirt' },
    { value: 'women-crop-top', label: 'Crop Top' },
    { value: 'women-tank-top', label: 'Tank Top' },
  ],
  womenTraditional: [
    { value: 'women-saree', label: 'Saree' },
    { value: 'women-salwar-kameez', label: 'Salwar Kameez' },
    { value: 'women-kurti', label: 'Kurti' },
    { value: 'women-anarkali', label: 'Anarkali' },
    { value: 'women-gown', label: 'Gown' },
    { value: 'women-maxi-dress', label: 'Maxi Dress' },
    { value: 'women-abaya', label: 'Abaya' },
  ],
  womenLower: [
    { value: 'women-skirt', label: 'Skirt' },
    { value: 'women-jeans', label: 'Jeans' },
    { value: 'women-trousers', label: 'Trousers / Pants' },
    { value: 'women-palazzo-pants', label: 'Palazzo Pants' },
    { value: 'women-leggings', label: 'Leggings' },
  ],
  womenOuterwear: [
    { value: 'women-cardigan', label: 'Cardigan' },
    { value: 'women-blazer', label: 'Blazer' },
    { value: 'women-jacket', label: 'Jacket' },
    { value: 'women-denim-jacket', label: 'Denim Jacket' },
    { value: 'women-trench-coat', label: 'Trench Coat' },
    { value: 'women-long-coat', label: 'Long Coat' },
    { value: 'women-shawl', label: 'Shawl' },
  ],
  womenFootwear: [
    { value: 'women-heels', label: 'Heels' },
    { value: 'women-flats', label: 'Flats' },
    { value: 'women-sneakers', label: 'Sneakers' },
    { value: 'women-sandals', label: 'Sandals' },
    { value: 'women-loafers', label: 'Loafers' },
    { value: 'women-wedges', label: 'Wedges' },
    { value: 'women-boots', label: 'Boots' },
  ],
  womenAccessories: [
    { value: 'women-handbag', label: 'Handbag' },
    { value: 'women-scarf', label: 'Scarf' },
    { value: 'women-watch', label: 'Watch' },
    { value: 'women-earrings', label: 'Earrings' },
    { value: 'women-necklace', label: 'Necklace' },
    { value: 'women-sunglasses', label: 'Sunglasses' },
    { value: 'women-bracelet', label: 'Bracelet' },
    { value: 'women-ring', label: 'Ring' },
    { value: 'women-hairband', label: 'Hairband' },
  ],
}

// Boys' clothing for family portraits, using unique ids (`boys-clothing-*`).
const boysClothingGarmentOptions = {
  boysClothingUpper: [
    { value: 'boys-clothing-t-shirt', label: 'T-shirt' },
    { value: 'boys-clothing-shirt', label: 'Shirt' },
    { value: 'boys-clothing-polo-shirt', label: 'Polo Shirt' },
  ],
  boysClothingTraditional: [
    { value: 'boys-clothing-panjabi', label: 'Panjabi' },
    { value: 'boys-clothing-kurta', label: 'Kurta' },
  ],
  boysClothingLower: [
    { value: 'boys-clothing-jeans', label: 'Jeans' },
    { value: 'boys-clothing-trousers', label: 'Trousers' },
    { value: 'boys-clothing-shorts', label: 'Shorts' },
  ],
  boysClothingOuterwear: [
    { value: 'boys-clothing-jacket', label: 'Jacket' },
    { value: 'boys-clothing-hoodie', label: 'Hoodie' },
    { value: 'boys-clothing-sweater', label: 'Sweater' },
  ],
  boysClothingFootwear: [
    { value: 'boys-clothing-sneakers', label: 'Sneakers' },
    { value: 'boys-clothing-sandals', label: 'Sandals' },
    { value: 'boys-clothing-school-shoes', label: 'School Shoes' },
  ],
  boysClothingAccessories: [
    { value: 'boys-clothing-cap', label: 'Cap' },
    { value: 'boys-clothing-backpack', label: 'Backpack' },
    { value: 'boys-clothing-watch', label: 'Watch' },
  ],
}

// Girls' clothing for family portraits, using unique ids (`girls-clothing-*`).
const girlsClothingGarmentOptions = {
  girlsClothingUpper: [
    { value: 'girls-clothing-t-shirt', label: 'T-shirt' },
    { value: 'girls-clothing-blouse', label: 'Blouse' },
    { value: 'girls-clothing-shirt', label: 'Shirt' },
  ],
  girlsClothingTraditional: [
    { value: 'girls-clothing-frock', label: 'Frock' },
    { value: 'girls-clothing-kurti', label: 'Kurti' },
    { value: 'girls-clothing-salwar-kameez', label: 'Salwar Kameez' },
  ],
  girlsClothingLower: [
    { value: 'girls-clothing-skirt', label: 'Skirt' },
    { value: 'girls-clothing-jeans', label: 'Jeans' },
    { value: 'girls-clothing-trousers', label: 'Trousers' },
  ],
  girlsClothingOuterwear: [
    { value: 'girls-clothing-jacket', label: 'Jacket' },
    { value: 'girls-clothing-cardigan', label: 'Cardigan' },
    { value: 'girls-clothing-sweater', label: 'Sweater' },
  ],
  girlsClothingFootwear: [
    { value: 'girls-clothing-flats', label: 'Flats' },
    { value: 'girls-clothing-sneakers', label: 'Sneakers' },
    { value: 'girls-clothing-sandals', label: 'Sandals' },
    { value: 'girls-clothing-school-shoes', label: 'School Shoes' },
  ],
  girlsClothingAccessories: [
    { value: 'girls-clothing-hairband', label: 'Hairband' },
    { value: 'girls-clothing-cap', label: 'Cap' },
    { value: 'girls-clothing-backpack', label: 'Backpack' },
    { value: 'girls-clothing-bracelet', label: 'Bracelet' },
  ],
}

// Legacy kids dataset retained so older saved `kids-*` selections still resolve.
const kidsGarmentOptions = {
  kidsUpper: [
    { value: 'kids-t-shirt', label: 'T-shirt' },
    { value: 'kids-shirt', label: 'Shirt' },
    { value: 'kids-polo-shirt', label: 'Polo Shirt' },
  ],
  kidsTraditional: [
    { value: 'kids-panjabi', label: 'Panjabi' },
    { value: 'kids-kurta', label: 'Kurta' },
    { value: 'kids-frock', label: 'Frock / Dress' },
  ],
  kidsLower: [
    { value: 'kids-jeans', label: 'Jeans' },
    { value: 'kids-trousers', label: 'Trousers / Pants' },
    { value: 'kids-shorts', label: 'Shorts' },
    { value: 'kids-skirt', label: 'Skirt' },
  ],
  kidsOuterwear: [
    { value: 'kids-jacket', label: 'Jacket' },
    { value: 'kids-hoodie', label: 'Hoodie' },
    { value: 'kids-sweater', label: 'Sweater' },
  ],
  kidsFootwear: [
    { value: 'kids-sneakers', label: 'Sneakers' },
    { value: 'kids-sandals', label: 'Sandals' },
    { value: 'kids-school-shoes', label: 'School Shoes' },
  ],
  kidsAccessories: [
    { value: 'kids-cap', label: 'Cap' },
    { value: 'kids-watch', label: 'Watch' },
    { value: 'kids-backpack', label: 'Backpack' },
  ],
}

// Flat aggregate of every garment id, used by the prompt engine to resolve any selection.
export const garmentOptions = {
  ...menGarmentOptions,
  ...womenGarmentOptions,
  ...boysClothingGarmentOptions,
  ...girlsClothingGarmentOptions,
  ...kidsGarmentOptions,
}

// Subject-aware clothing used by the Create page UI.
// Single-person subjects show only their own list; couples / family expose both sides (and kids for family).
export const garmentOptionsBySubject = {
  boys: { men: menGarmentOptions },
  girls: { women: womenGarmentOptions },
  couples: { men: menGarmentOptions, women: womenGarmentOptions },
  family: {
    men: menGarmentOptions,
    women: womenGarmentOptions,
    boysClothing: boysClothingGarmentOptions,
    girlsClothing: girlsClothingGarmentOptions,
  },
}

// Color palettes for garment-level outfit colors.
// Color ids are stable and intentionally reusable across groups. Phase 2 can assign a
// color per selected garment, for example:
//   { shirt: 'white', blazer: 'navy', trousers: 'black', 'formal-shoes': 'brown' }
//   { 't-shirt': 'black', jeans: 'dark-blue', sneakers: 'white' }
//   { panjabi: 'cream', pajama: 'white' }
export const outfitColorGroups = {
  upper: [
    { value: 'white', label: 'White' },
    { value: 'black', label: 'Black' },
    { value: 'blue', label: 'Blue' },
    { value: 'navy', label: 'Navy' },
    { value: 'light-blue', label: 'Light Blue' },
    { value: 'gray', label: 'Gray' },
    { value: 'beige', label: 'Beige' },
    { value: 'cream', label: 'Cream' },
    { value: 'brown', label: 'Brown' },
    { value: 'green', label: 'Green' },
    { value: 'maroon', label: 'Maroon' },
    { value: 'red', label: 'Red' },
    { value: 'yellow', label: 'Yellow' },
  ],
  lower: [
    { value: 'black', label: 'Black' },
    { value: 'navy', label: 'Navy' },
    { value: 'blue', label: 'Blue' },
    { value: 'gray', label: 'Gray' },
    { value: 'beige', label: 'Beige' },
    { value: 'brown', label: 'Brown' },
    { value: 'white', label: 'White' },
    { value: 'khaki', label: 'Khaki' },
    { value: 'dark-blue', label: 'Dark Blue' },
  ],
  traditionalLower: [
    { value: 'white', label: 'White' },
    { value: 'off-white', label: 'Off White' },
    { value: 'cream', label: 'Cream' },
    { value: 'black', label: 'Black' },
    { value: 'blue', label: 'Blue' },
    { value: 'navy', label: 'Navy' },
    { value: 'gray', label: 'Gray' },
    { value: 'brown', label: 'Brown' },
    { value: 'green', label: 'Green' },
    { value: 'maroon', label: 'Maroon' },
  ],
}

export const poses = [
  { value: 'standing', label: 'Standing' },
  { value: 'sitting', label: 'Sitting' },
  { value: 'walking', label: 'Walking' },
  { value: 'looking-at-camera', label: 'Looking at Camera' },
  { value: 'looking-away', label: 'Looking Away' },
  { value: 'side-profile', label: 'Side Profile' },
  { value: 'leaning', label: 'Leaning' },
  { value: 'hands-in-pocket', label: 'Hands in Pocket' },
  { value: 'casual-standing', label: 'Casual Standing' },
  { value: 'walking-toward-camera', label: 'Walking Toward Camera' },
  { value: 'sitting-on-chair', label: 'Sitting on Chair' },
  { value: 'sitting-on-ground', label: 'Sitting on Ground' },
  { value: 'candid', label: 'Candid' },
  { value: 'couple-walking', label: 'Couple Walking' },
  { value: 'couple-sitting', label: 'Couple Sitting' },
  { value: 'holding-hands', label: 'Holding Hands' },
  { value: 'family-group-portrait', label: 'Family Group Portrait' },
  { value: 'custom', label: 'Custom' },
  { value: 'none', label: 'None' },
]

export const expressions = [
  { value: 'natural', label: 'Natural' },
  { value: 'happy', label: 'Happy' },
  { value: 'smiling', label: 'Smiling' },
  { value: 'serious', label: 'Serious' },
  { value: 'confident', label: 'Confident' },
  { value: 'calm', label: 'Calm' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'playful', label: 'Playful' },
  { value: 'professional', label: 'Professional' },
  { value: 'none', label: 'None' },
]

export const moods = [
  { value: 'warm', label: 'Warm' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'dark', label: 'Dark' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'nostalgic', label: 'Nostalgic' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'dreamy', label: 'Dreamy' },
  { value: 'powerful', label: 'Powerful' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'moody', label: 'Moody' },
  { value: 'none', label: 'None' },
]

export const lighting = [
  { value: 'natural', label: 'Natural' },
  { value: 'soft', label: 'Soft' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'studio', label: 'Studio' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'rim-light', label: 'Rim Light' },
  { value: 'backlight', label: 'Backlight' },
  { value: 'neon', label: 'Neon' },
  { value: 'flash', label: 'Flash' },
  { value: 'window-light', label: 'Window Light' },
  { value: 'low-key', label: 'Low Key' },
  { value: 'high-key', label: 'High Key' },
  { value: 'none', label: 'None' },
]

export const timeOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'blue-hour', label: 'Blue Hour' },
  { value: 'night', label: 'Night' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'none', label: 'None' },
]

export const weather = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'foggy', label: 'Foggy' },
  { value: 'winter', label: 'Winter' },
  { value: 'snowy', label: 'Snowy' },
  { value: 'stormy', label: 'Stormy' },
  { value: 'clear-sky', label: 'Clear Sky' },
  { value: 'none', label: 'None' },
]

export const colorGrading = [
  { value: 'natural', label: 'Natural' },
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'kodak-film', label: 'Kodak Film' },
  { value: 'faded-vintage', label: 'Faded Vintage' },
  { value: 'matte', label: 'Matte' },
  { value: 'high-contrast', label: 'High Contrast' },
  { value: 'soft-pastel', label: 'Soft Pastel' },
  { value: 'earthy', label: 'Earthy' },
  { value: 'black-and-white', label: 'Black & White' },
  { value: 'moody', label: 'Moody' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'none', label: 'None' },
]

export const cultural = [
  { value: 'none', label: 'None' },
  { value: 'bangladeshi', label: 'Bangladeshi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'south-asian', label: 'South Asian' },
  { value: 'indian', label: 'Indian' },
  { value: 'pakistani', label: 'Pakistani' },
  { value: 'traditional-desi', label: 'Traditional Desi' },
  { value: 'rural-bangladesh', label: 'Rural Bangladesh' },
  { value: 'urban-bangladesh', label: 'Urban Bangladesh' },
  { value: 'dhaka-city', label: 'Dhaka City' },
  { value: 'village-lifestyle', label: 'Village Lifestyle' },
  { value: 'heritage', label: 'Heritage' },
]

export const cameraSettings = {
  camera: [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'dslr', label: 'DSLR' },
    { value: 'professional-portrait', label: 'Professional Portrait' },
    { value: '35mm-film', label: '35mm Film' },
    { value: 'none', label: 'None' },
  ],
  lens: [
    { value: '50mm', label: '50mm' },
    { value: '85mm', label: '85mm' },
    { value: 'wide-angle', label: 'Wide Angle' },
    { value: 'none', label: 'None' },
  ],
  framing: [
    { value: 'close-up', label: 'Close-up' },
    { value: 'medium-shot', label: 'Medium Shot' },
    { value: 'full-body', label: 'Full Body' },
    { value: 'environmental-portrait', label: 'Environmental Portrait' },
    { value: 'none', label: 'None' },
  ],
  photographyStyle: [
    { value: 'editorial', label: 'Editorial' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'none', label: 'None' },
  ],
}

export const accessories = [
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'watch', label: 'Watch' },
  { value: 'hat', label: 'Hat' },
  { value: 'cap', label: 'Cap' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'necklace', label: 'Necklace' },
  { value: 'bangles', label: 'Bangles' },
  { value: 'handbag', label: 'Handbag' },
  { value: 'flowers', label: 'Flowers' },
  { value: 'scarf', label: 'Scarf' },
  { value: 'traditional-accessories', label: 'Traditional Accessories' },
  { value: 'none', label: 'None' },
]

export const effects = [
  { value: 'film-grain', label: 'Film Grain' },
  { value: 'light-leak', label: 'Light Leak' },
  { value: 'dust-scratches', label: 'Dust & Scratches' },
  { value: 'motion-blur', label: 'Motion Blur' },
  { value: 'bokeh', label: 'Bokeh' },
  { value: 'lens-flare', label: 'Lens Flare' },
  { value: 'fog', label: 'Fog' },
  { value: 'rain', label: 'Rain' },
  { value: 'soft-glow', label: 'Soft Glow' },
  { value: 'vintage-camera-texture', label: 'Vintage Camera Texture' },
  { value: 'analog-photography', label: 'Analog Photography' },
  { value: 'none', label: 'None' },
]

export const identityPreservation = {
  enabled: true,
  defaultValue: true,
  label: 'Identity Preservation',
  instruction: 'Preserve the subject identity, facial features, eyes, nose, lips, jawline, skin tone, and recognizable appearance.',
  appliedByDefault: true,
  requiresPromptFragment: true,
}

export const basePromptTemplates = {
  boys: [
    {
      id: 'boys-cinematic-01',
      subject: 'boys',
      styleCategory: 'cinematic',
      title: 'Cinematic Portrait',
      basePrompt:
        'A cinematic portrait of a boy in a strong, confident pose, with natural facial structure preserved, premium lighting, realistic skin texture, and refined editorial composition.',
      compatibleStyles: ['cinematic', 'editorial', 'modern'],
      compatiblePurposes: ['general-portrait', 'instagram-post', 'facebook-profile'],
    },
    {
      id: 'boys-vintage-01',
      subject: 'boys',
      styleCategory: 'vintage',
      title: 'Vintage Story',
      basePrompt:
        'A vintage-inspired portrait of a boy in a nostalgic setting, with warm tones, authentic period details, subtle film texture, and natural expression.',
      compatibleStyles: ['vintage', 'retro', 'film-photography'],
      compatiblePurposes: ['facebook-post', 'general-portrait', 'youtube-thumbnail'],
    },
    {
      id: 'boys-street-01',
      subject: 'boys',
      styleCategory: 'street',
      title: 'Street Lifestyle',
      basePrompt:
        'A confident street-style portrait of a boy in an urban environment, with candid pose, dynamic energy, natural lighting, and authentic everyday fashion details.',
      compatibleStyles: ['street-style', 'casual', 'documentary'],
      compatiblePurposes: ['instagram-reels', 'facebook-reels', 'general-portrait'],
    },
    {
      id: 'boys-traditional-01',
      subject: 'boys',
      styleCategory: 'traditional',
      title: 'Traditional Elegance',
      basePrompt:
        'A traditional portrait of a boy in refined cultural attire, with elegant posing, premium detail, and rich cultural atmosphere that feels respectful and authentic.',
      compatibleStyles: ['traditional', 'luxury', 'formal'],
      compatiblePurposes: ['facebook-profile', 'general-portrait', 'linkedin-profile'],
    },
    {
      id: 'boys-luxury-01',
      subject: 'boys',
      styleCategory: 'luxury',
      title: 'Luxury Editorial',
      basePrompt:
        'A luxury editorial portrait of a boy with premium styling, soft directional light, polished composition, and elevated fashion-finishing details.',
      compatibleStyles: ['luxury', 'old-money', 'editorial'],
      compatiblePurposes: ['instagram-post', 'facebook-post', 'general-portrait'],
    },
  ],
  girls: [
    {
      id: 'girls-cinematic-01',
      subject: 'girls',
      styleCategory: 'cinematic',
      title: 'Cinematic Glow',
      basePrompt:
        'A cinematic portrait of a girl with soft natural beauty, graceful pose, premium lighting, refined detail, and polished modern cinematic color grading.',
      compatibleStyles: ['cinematic', 'modern', 'soft-aesthetic'],
      compatiblePurposes: ['instagram-post', 'facebook-profile', 'general-portrait'],
    },
    {
      id: 'girls-vintage-01',
      subject: 'girls',
      styleCategory: 'vintage',
      title: 'Retro Charm',
      basePrompt:
        'A retro portrait of a girl with nostalgic styling, warm vintage tones, gentle film texture, and a naturally expressive pose in a heritage-inspired environment.',
      compatibleStyles: ['vintage', 'retro', 'film-photography'],
      compatiblePurposes: ['youtube-thumbnail', 'facebook-post', 'general-portrait'],
    },
    {
      id: 'girls-street-01',
      subject: 'girls',
      styleCategory: 'street',
      title: 'Urban Grace',
      basePrompt:
        'An urban lifestyle portrait of a girl with effortless confidence, natural motion, modern streetwear styling, and realistic city atmosphere.',
      compatibleStyles: ['street-style', 'fashion', 'casual'],
      compatiblePurposes: ['instagram-reels', 'facebook-reels', 'general-portrait'],
    },
    {
      id: 'girls-traditional-01',
      subject: 'girls',
      styleCategory: 'traditional',
      title: 'Traditional Beauty',
      basePrompt:
        'A portrait of a girl in graceful traditional attire, with elegant composition, cultural authenticity, soft lighting, and refined outfit detailing.',
      compatibleStyles: ['traditional', 'editorial', 'luxury'],
      compatiblePurposes: ['facebook-profile', 'general-portrait', 'instagram-post'],
    },
    {
      id: 'girls-luxury-01',
      subject: 'girls',
      styleCategory: 'luxury',
      title: 'Luxury Editorial',
      basePrompt:
        'A high-end editorial portrait of a girl with premium styling, elegant pose, refined textures, and polished luxury lighting for a fashion-grade finish.',
      compatibleStyles: ['luxury', 'editorial', 'formal'],
      compatiblePurposes: ['instagram-post', 'facebook-post', 'general-portrait'],
    },
  ],
  couples: [
    {
      id: 'couples-cinematic-01',
      subject: 'couples',
      styleCategory: 'cinematic',
      title: 'Romantic Cinematic',
      basePrompt:
        'A cinematic couple portrait with emotional connection, natural chemistry, balanced framing, premium lighting, and refined realism.',
      compatibleStyles: ['cinematic', 'romantic', 'editorial'],
      compatiblePurposes: ['general-portrait', 'facebook-post', 'instagram-post'],
    },
    {
      id: 'couples-vintage-01',
      subject: 'couples',
      styleCategory: 'vintage',
      title: 'Nostalgic Love',
      basePrompt:
        'A vintage-inspired couple portrait with warm nostalgic tones, natural expressions, softly faded textures, and an intimate, everyday romantic mood.',
      compatibleStyles: ['vintage', 'retro', 'film-photography'],
      compatiblePurposes: ['facebook-profile', 'general-portrait', 'youtube-thumbnail'],
    },
    {
      id: 'couples-street-01',
      subject: 'couples',
      styleCategory: 'street',
      title: 'City Love Story',
      basePrompt:
        'A candid couple portrait in an urban setting with natural movement, authentic street atmosphere, strong chemistry, and realistic city background details.',
      compatibleStyles: ['street-style', 'documentary', 'casual'],
      compatiblePurposes: ['instagram-reels', 'facebook-story', 'general-portrait'],
    },
    {
      id: 'couples-traditional-01',
      subject: 'couples',
      styleCategory: 'traditional',
      title: 'Traditional Couple',
      basePrompt:
        'A traditional couple portrait in culturally rich attire, with graceful composition, elegant warmth, and respectful traditional atmosphere.',
      compatibleStyles: ['traditional', 'formal', 'luxury'],
      compatiblePurposes: ['facebook-profile', 'general-portrait', 'instagram-post'],
    },
    {
      id: 'couples-luxury-01',
      subject: 'couples',
      styleCategory: 'luxury',
      title: 'Luxury Romance',
      basePrompt:
        'A luxury couple portrait with elevated fashion styling, premium lighting, soft romantic mood, and polished cinematic composition.',
      compatibleStyles: ['luxury', 'editorial', 'old-money'],
      compatiblePurposes: ['instagram-post', 'facebook-post', 'general-portrait'],
    },
  ],
  family: [
    {
      id: 'family-cinematic-01',
      subject: 'family',
      styleCategory: 'cinematic',
      title: 'Family Moment',
      basePrompt:
        'A cinematic family portrait featuring natural interactions, warm human connection, realistic expressions, soft premium lighting, and balanced composition.',
      compatibleStyles: ['cinematic', 'documentary', 'modern'],
      compatiblePurposes: ['general-portrait', 'facebook-post', 'instagram-post'],
    },
    {
      id: 'family-vintage-01',
      subject: 'family',
      styleCategory: 'vintage',
      title: 'Family Heritage',
      basePrompt:
        'A vintage-inspired family portrait with nostalgic warmth, timeless clothing, subtle film texture, and authentic familial interaction.',
      compatibleStyles: ['vintage', 'retro', 'traditional'],
      compatiblePurposes: ['facebook-cover', 'general-portrait', 'youtube-thumbnail'],
    },
    {
      id: 'family-street-01',
      subject: 'family',
      styleCategory: 'street',
      title: 'Everyday Family',
      basePrompt:
        'A candid family portrait in a realistic neighborhood setting, with natural poses, comfortable expressions, and everyday warmth.',
      compatibleStyles: ['documentary', 'street-style', 'casual'],
      compatiblePurposes: ['general-portrait', 'facebook-post', 'instagram-post'],
    },
    {
      id: 'family-traditional-01',
      subject: 'family',
      styleCategory: 'traditional',
      title: 'Traditional Family',
      basePrompt:
        'A traditional family portrait with culturally grounded styling, respectful details, elegant composition, and authentic emotional presence.',
      compatibleStyles: ['traditional', 'luxury', 'editorial'],
      compatiblePurposes: ['facebook-profile', 'general-portrait', 'instagram-post'],
    },
    {
      id: 'family-luxury-01',
      subject: 'family',
      styleCategory: 'luxury',
      title: 'Luxury Family Portrait',
      basePrompt:
        'A luxury family portrait with elevated styling, premium wardrobe details, refined composition, and soft polished lighting for an upscale editorial feel.',
      compatibleStyles: ['luxury', 'editorial', 'formal'],
      compatiblePurposes: ['general-portrait', 'facebook-post', 'instagram-post'],
    },
  ],
}

export const compatibility = {
  subjectRules: {
    boys: {
      relevantPoses: ['standing', 'sitting', 'walking', 'casual-standing', 'hands-in-pocket', 'leaning'],
      relevantOutfits: ['casual', 'streetwear', 'traditional-bangladeshi', 'panjabi', 'suit', 't-shirt-jeans', 'lungi-t-shirt'],
      recommendedBackgrounds: ['dhaka-street', 'modern-city', 'urban-bangladesh', 'tea-garden', 'rooftop'],
    },
    girls: {
      relevantPoses: ['standing', 'sitting', 'walking', 'looking-at-camera', 'side-profile', 'casual-standing'],
      relevantOutfits: ['casual', 'formal', 'traditional-bangladeshi', 'saree', 'kurta', 'party', 'fashion'],
      recommendedBackgrounds: ['garden', 'cafe', 'studio', 'luxury-hotel', 'urban-bangladesh'],
    },
    couples: {
      relevantPoses: ['couple-walking', 'couple-sitting', 'holding-hands', 'looking-at-camera', 'walking-toward-camera'],
      relevantOutfits: ['formal', 'wedding', 'traditional', 'streetwear', 'luxury', 'old-money'],
      recommendedBackgrounds: ['beach', 'historical-place', 'rooftop', 'cafe', 'luxury-hotel'],
    },
    family: {
      relevantPoses: ['family-group-portrait', 'sitting-on-chair', 'candid', 'standing', 'walking'],
      relevantOutfits: ['casual', 'traditional', 'formal', 'vacation', 'wedding', 'winter'],
      recommendedBackgrounds: ['garden', 'park', 'village', 'rural-bangladesh', 'beach', 'old-house'],
    },
  },
  optionCompatibility: {
    'couple-walking': ['couples'],
    'holding-hands': ['couples'],
    'family-group-portrait': ['family'],
    'saree': ['girls', 'couples'],
    'lungi-t-shirt': ['boys'],
    'panjabi': ['boys', 'girls', 'couples', 'family'],
    'rural-bangladesh': ['family', 'boys', 'girls'],
    'urban-bangladesh': ['boys', 'girls', 'family'],
    'dhaka-street': ['boys', 'girls', 'couples'],
  },
  notes: [
    'Couple-specific poses should be available when the subject is set to Couples.',
    'Family Group Portrait should only be used when the subject is Family.',
    'Saree is especially relevant to Girls but remains available for broader styling contexts.',
    'Lungi & T-shirt is especially relevant to Boys.',
    'Couple Walking and Holding Hands are relevant for Couples.',
  ],
}

export const createBuilderData = {
  builderSections,
  subjects,
  purposes,
  styles,
  backgrounds,
  appearanceBackgroundsBySubject,
  outfits,
  garmentOptions,
  garmentOptionsBySubject,
  outfitColorGroups,
  poses,
  expressions,
  moods,
  lighting,
  timeOptions,
  weather,
  colorGrading,
  cultural,
  cameraSettings,
  accessories,
  effects,
  identityPreservation,
  basePromptTemplates,
  compatibility,
}

export default createBuilderData
