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
    { value: 'village', label: 'Village' },
    { value: 'garden', label: 'Garden' },
    { value: 'park', label: 'Park' },
    { value: 'tea-garden', label: 'Tea Garden' },
  ],
  urban: [
    { value: 'dhaka-street', label: 'Dhaka Street' },
    { value: 'modern-city', label: 'Modern City' },
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
]

export const timeOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'blue-hour', label: 'Blue Hour' },
  { value: 'night', label: 'Night' },
  { value: 'midnight', label: 'Midnight' },
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
  ],
  lens: [
    { value: '50mm', label: '50mm' },
    { value: '85mm', label: '85mm' },
    { value: 'wide-angle', label: 'Wide Angle' },
  ],
  framing: [
    { value: 'close-up', label: 'Close-up' },
    { value: 'medium-shot', label: 'Medium Shot' },
    { value: 'full-body', label: 'Full Body' },
    { value: 'environmental-portrait', label: 'Environmental Portrait' },
  ],
  photographyStyle: [
    { value: 'editorial', label: 'Editorial' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'documentary', label: 'Documentary' },
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
  outfits,
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
