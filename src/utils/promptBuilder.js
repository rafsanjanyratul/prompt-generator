import {
  accessories,
  aspectRatios,
  backgrounds,
  basePromptTemplates,
  cameraSettings,
  colorGrading,
  cultural,
  effects,
  identityPreservation,
  lighting,
  moods,
  outfits,
  poses,
  purposes,
  styles,
  subjects,
  timeOptions,
  weather,
} from '../data/createBuilderOptions.js'

export const defaultBuilderSelections = {
  subject: 'boys',
  purpose: 'general-portrait',
  aspectRatio: '4:5',
  style: 'cinematic',
  background: 'studio',
  outfit: 'casual',
  pose: 'looking-at-camera',
  mood: 'cinematic',
  lighting: 'soft',
  expression: 'natural',
  time: 'golden-hour',
  weather: 'clear-sky',
  colorGrading: 'warm',
  cultural: 'bangladeshi',
  camera: 'professional-portrait',
  lens: '85mm',
  framing: 'medium-shot',
  photographyStyle: 'editorial',
  accessories: [],
  effects: [],
  identityPreservation: identityPreservation.defaultValue,
  customInstruction: '',
}

export function createDefaultBuilderSelections(overrides = {}) {
  return {
    ...defaultBuilderSelections,
    ...overrides,
    accessories: Array.isArray(overrides.accessories)
      ? [...overrides.accessories]
      : [...defaultBuilderSelections.accessories],
    effects: Array.isArray(overrides.effects)
      ? [...overrides.effects]
      : [...defaultBuilderSelections.effects],
  }
}

const findOption = (items, value) => {
  if (!value) return null

  const list = Array.isArray(items) ? items : Object.values(items).flat()
  return list.find((option) => option.value === value) || null
}

const flattenBackgrounds = () =>
  Object.values(backgrounds)
    .flat()
    .map((option) => ({ ...option }))

const flattenOutfits = () =>
  Object.values(outfits)
    .flat()
    .map((option) => ({ ...option }))

const removeTrailingPeriod = (text) => text.replace(/[.\s]+$/, '')

const pickTemplate = (subject, style) => {
  const templates = basePromptTemplates[subject] || []
  if (!templates.length) return null

  const styleKey = style || 'cinematic'
  const matchMap = {
    cinematic: ['cinematic', 'modern', 'documentary', 'artistic', 'professional'],
    vintage: ['vintage', 'retro', 'film-photography', 'old-money'],
    street: ['street-style', 'casual', 'documentary', 'urban', 'fashion'],
    traditional: ['traditional', 'formal'],
    luxury: ['luxury', 'editorial', 'old-money', 'fashion', 'dark'],
  }

  const category = Object.entries(matchMap).find(([, stylesList]) => stylesList.includes(styleKey))?.[0]

  const candidate = templates.find((template) => template.styleCategory === category) || templates.find((template) => template.styleCategory === 'cinematic') || templates[0]

  return candidate || null
}

const describePurpose = (purpose, aspectRatio) => {
  const purposeOption = findOption(purposes, purpose)
  const ratioText = aspectRatio ? `Use a ${aspectRatio} composition.` : 'Use a balanced photographic composition.'

  if (!purposeOption) {
    return ratioText
  }

  const purposeMap = {
    'facebook-profile': 'Prepare this as a profile-friendly portrait with a clear, centered face and polished personal presentation.',
    'facebook-cover': 'Compose the scene for a wide Facebook cover layout with enough breathing room around the subject.',
    'facebook-post': 'Compose the scene for a polished Facebook post with a naturally balanced social-media crop.',
    'facebook-story': 'Use a vertical social-story composition that keeps the subject prominent and readable.',
    'facebook-reels': 'Frame the subject for a vertical, mobile-first reel composition with clear movement and focus.',
    'instagram-post': 'Compose the image for an Instagram post with a refined, feed-friendly crop and strong subject focus.',
    'instagram-story': 'Build a vertical Instagram-story composition with strong subject readability and a clean, social-media-friendly look.',
    'instagram-reels': 'Use a vertical, mobile-optimized reel composition with natural motion and clear focus.',
    'whatsapp-dp': 'Create a centered square-friendly portrait that feels clean, clear, and easy to read at small sizes.',
    'youtube-thumbnail': 'Use a bold, readable thumbnail composition with a strong focal subject and clear visual hierarchy.',
    'youtube-shorts': 'Create a vertical shorts-friendly composition with a clear subject and confident framing.',
    'linkedin-profile': 'Use a professional portrait composition that feels polished, confident, and credible.',
    'general-portrait': 'Frame the subject as a clean general portrait with strong facial clarity and a premium editorial finish.',
    custom: 'Keep the composition flexible and polished while preserving the intended creative direction.',
  }

  return `${purposeMap[purposeOption.value] || 'Use a polished composition.'} ${ratioText}`
}

const describeBackground = (background) => {
  const match = findOption(flattenBackgrounds(), background)
  if (!match) return ''

  const map = {
    mountain: 'in a natural mountain setting with layered terrain and atmospheric depth',
    forest: 'in a lush forest environment with soft natural depth and rich texture',
    river: 'by a calm river with reflective water and natural movement',
    lake: 'by a serene lake with gentle reflections and a grounded outdoor mood',
    waterfall: 'in front of a waterfall with flowing water and a fresh, immersive atmosphere',
    beach: 'on a beach with a relaxed coastal mood and natural sunlight',
    field: 'in an open field with a clean, airy natural landscape',
    village: 'in an authentic village setting with warm local character',
    garden: 'in a peaceful garden with layered greenery and soft natural ambiance',
    park: 'in a lively park environment with natural beauty and relaxed movement',
    'tea-garden': 'in a tea garden environment with lush greenery and a calm, organic mood',
    'dhaka-street': 'in a lively Dhaka street setting with texture, realism, and everyday urban atmosphere',
    'modern-city': 'in a modern city environment with structured architecture and contemporary energy',
    rooftop: 'on a rooftop setting with layered city views and a cinematic urban backdrop',
    cafe: 'in a stylish café setting with natural social atmosphere and gentle character',
    restaurant: 'in a refined restaurant environment with a polished, natural social mood',
    mall: 'in a contemporary mall environment with clean architecture and modern visual rhythm',
    office: 'in a professional office environment with clean lines and contemporary detail',
    studio: 'in a polished studio setting with controlled light and refined realism',
    'luxury-hotel': 'in a luxury hotel environment with elevated detail and polished ambiance',
    airport: 'in an airport environment with modern travel energy and crisp architectural framing',
    resort: 'in a premium resort setting with a luxury travel mood and natural light',
    'historical-place': 'in a historic location with cultural character and elegant atmospheric detail',
    desert: 'in a desert environment with warm natural contrast and cinematic atmosphere',
    'snow-mountain': 'in a snow-covered mountain setting with cool contrast and dramatic light',
    'european-street': 'in a European-style street environment with timeless architecture and refined atmosphere',
    'tropical-island': 'on a tropical island with bright natural scenery and an elevated holiday mood',
    palace: 'in a palace environment with grand architecture and rich cultural atmosphere',
    mansion: 'in a refined mansion setting with elegant detailing and premium interior mood',
    castle: 'in a castle setting with heritage atmosphere and dramatic visual textures',
    'fantasy-kingdom': 'in a fantasy kingdom setting with elevated storytelling and rich magical atmosphere',
    'cyberpunk-city': 'in a futuristic cyberpunk city with controlled neon illumination and a stylized urban mood',
    'neon-street': 'on a neon-lit street with vivid atmosphere and energetic modern nightlife details',
    'old-house': 'in an old house setting with nostalgic charm and authentic historical texture',
    'vintage-studio': 'in a classic vintage studio backdrop with period-inspired mood and texture',
    'rural-bangladesh': 'in an authentic rural Bangladesh setting with natural texture and local atmosphere',
    'urban-bangladesh': 'in a contemporary Bangladesh setting with local detail and grounded realism',
  }

  return map[match.value] || `in a ${match.label.toLowerCase()} setting`
}

const describeOutfit = (outfit) => {
  const match = findOption(flattenOutfits(), outfit)
  if (!match) return ''

  const map = {
    casual: 'wearing a refined casual outfit with natural comfort and everyday authenticity',
    formal: 'wearing a polished formal outfit with a sharp, premium silhouette',
    traditional: 'wearing a traditional outfit with elegant cultural detail and authenticity',
    party: 'wearing a party-ready outfit with expressive styling and confident energy',
    wedding: 'wearing a wedding-appropriate outfit with graceful detail and refined elegance',
    streetwear: 'wearing modern streetwear with relaxed attitude and confident styling',
    luxury: 'wearing luxury-inspired fashion with elevated tailoring and premium detail',
    'old-money': 'wearing understated old-money-inspired clothing with refined tailoring and heritage elegance',
    business: 'wearing a professional business look with clean structure and polished presentation',
    sportswear: 'wearing sporty casual clothing with energetic comfort and modern style',
    vacation: 'wearing vacation-ready clothes with relaxed elegance and a light, easygoing mood',
    winter: 'wearing a winter-ready outfit with warm layers and a polished seasonal finish',
    summer: 'wearing a summer-appropriate outfit with light fabric and relaxed seasonal styling',
    'traditional-bangladeshi': 'wearing a traditional Bangladeshi outfit with cultural authenticity and refined detail',
    panjabi: 'wearing an elegant traditional Panjabi',
    saree: 'wearing a graceful traditional saree',
    kurta: 'wearing a refined kurta with classic comfort and strong visual detail',
    suit: 'wearing a tailored formal suit',
    't-shirt-jeans': 'wearing a simple, authentic T-shirt and jeans combination',
    'lungi-t-shirt': 'wearing a simple authentic lungi and T-shirt',
    custom: 'wearing a custom outfit based on the user’s requested styling',
  }

  return map[match.value] || `wearing ${match.label.toLowerCase()}`
}

const describePose = (pose, subject) => {
  const match = findOption(poses, pose)
  if (!match) return ''

  const map = {
    standing: 'standing naturally in a composed posture',
    sitting: 'sitting naturally with an easy, relaxed posture',
    walking: 'captured naturally while walking',
    'looking-at-camera': 'looking naturally toward the camera with relaxed confidence',
    'looking-away': 'gazing naturally away from the camera for a candid, authentic look',
    'side-profile': 'showing a side-profile pose with a strong silhouette and natural elegance',
    leaning: 'leaning naturally in a relaxed and confident pose',
    'hands-in-pocket': 'standing naturally with the hands placed casually in the pockets',
    'casual-standing': 'standing in a relaxed casual posture with natural confidence',
    'walking-toward-camera': 'walking toward the camera with calm movement and confident energy',
    'sitting-on-chair': 'sitting on a chair in a poised and comfortable portrait posture',
    'sitting-on-ground': 'sitting naturally on the ground with an authentic, grounded feeling',
    candid: 'captured in a natural candid moment with a genuine expression',
    'couple-walking': 'walking together naturally as a couple with connected movement and ease',
    'couple-sitting': 'sitting together naturally as a couple with relaxed comfort and closeness',
    'holding-hands': 'holding hands naturally while maintaining a calm and intimate connection',
    'family-group-portrait': 'arranged naturally in a cohesive family group portrait',
    custom: 'posed according to the user’s specified composition direction',
  }

  return map[match.value] || 'posed naturally and comfortably'
}

const describeMood = (mood, expression, lighting) => {
  const moodOption = findOption(moods, mood)
  const expressionOption = findOption(
    [
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
    ],
    expression
  )
  const lightingOption = findOption(lighting, lighting)

  const moodText = moodOption ? moodOption.label.toLowerCase() : 'balanced'
  const expressionText = expressionOption ? expressionOption.label.toLowerCase() : 'natural'
  const lightingText = lightingOption ? lightingOption.label.toLowerCase() : 'soft'

  return `Give the subject a ${expressionText} expression and create a ${moodText} atmosphere using ${lightingText} light.`
}

const describeTimeWeather = (time, weatherState) => {
  const clauses = []

  const timeSelection = findOption(timeOptions, time)
  if (timeSelection) {
    clauses.push(`Set the scene during ${timeSelection.label.toLowerCase()}.`)
  }

  const weatherSelection = findOption(weather, weatherState)
  if (weatherSelection) {
    clauses.push(`The atmosphere should feel ${weatherSelection.label.toLowerCase()}.`)
  }

  return clauses.join(' ')
}

const describeCulturalContext = (culturalChoice) => {
  const match = findOption(cultural, culturalChoice)
  if (!match) return ''

  const map = {
    bangladeshi: 'retain authentic Bangladeshi visual and cultural details without forcing stereotype or excess.',
    bengali: 'reflect authentic Bengali visual sensibility and cultural detail.',
    'south-asian': 'include tasteful South Asian aesthetic cues and a grounded regional feel.',
    indian: 'include elegant Indian visual cues with a tasteful and culturally aware feel.',
    pakistani: 'include refined Pakistani visual undertones with a respectful cultural feel.',
    'traditional-desi': 'include tasteful traditional Desi styling and heritage-inspired detail.',
    'rural-bangladesh': 'reflect an authentic rural Bangladesh atmosphere with grounded realism.',
    'urban-bangladesh': 'capture the atmosphere of contemporary urban Bangladesh with confidence and natural local detail.',
    'dhaka-city': 'capture the atmosphere of Dhaka city with modern urban texture and local realism.',
    'village-lifestyle': 'include a warm village-lifestyle atmosphere with local texture and realism.',
    heritage: 'carry a subtle heritage-inspired sensibility that feels refined and culturally grounded.',
  }

  return map[match.value] || `reflect ${match.label.toLowerCase()} cultural context respectfully.`
}

const describeCameraSettings = (camera, lens, framing, photographyStyle) => {
  const segments = []

  const cameraOption = findOption(cameraSettings.camera, camera)
  if (cameraOption) {
    segments.push(`Use ${cameraOption.label.toLowerCase()} photography with a realistic professional finish.`)
  }

  const lensOption = findOption(cameraSettings.lens, lens)
  if (lensOption) {
    segments.push(`Use an ${lensOption.label.toLowerCase()} lens aesthetic.`)
  }

  const framingOption = findOption(cameraSettings.framing, framing)
  if (framingOption) {
    segments.push(`Keep the framing ${framingOption.label.toLowerCase()}.`)
  }

  const styleOption = findOption(cameraSettings.photographyStyle, photographyStyle)
  if (styleOption) {
    segments.push(`Apply a ${styleOption.label.toLowerCase()} photography approach.`)
  }

  return segments.join(' ')
}

const describeAccessories = (selectedAccessories) => {
  if (!selectedAccessories || !selectedAccessories.length) return ''
  const cleaned = selectedAccessories.filter((item) => item && item !== 'none')
  if (!cleaned.length) return ''

  const labels = cleaned
    .map((value) => {
      const match = findOption(accessories, value)
      return match ? match.label.toLowerCase() : value
    })
    .join(', ')

  return `Add tasteful accessories including ${labels} as supporting details.`
}

const describeEffects = (selectedEffects) => {
  if (!selectedEffects || !selectedEffects.length) return ''
  const cleaned = selectedEffects.filter(Boolean)
  if (!cleaned.length) return ''

  const labels = cleaned
    .map((value) => {
      const match = findOption(effects, value)
      return match ? match.label.toLowerCase() : value
    })
    .join(', ')

  return `Finish the image with subtle ${labels} texture and atmosphere.`
}

const describeColorGrading = (colorValue) => {
  const match = findOption(colorGrading, colorValue)
  if (!match) return ''

  const map = {
    natural: 'keep the colour treatment natural and realistic.',
    warm: 'apply a warm, flattering colour treatment with gentle richness.',
    cool: 'use a cool-toned grading with clean contrast.',
    'kodak-film': 'apply a subtle Kodak-inspired film colour character.',
    'faded-vintage': 'use gently faded vintage tones with a soft nostalgic feel.',
    matte: 'use a matte finish with natural tonal balance.',
    'high-contrast': 'use high contrast with crisp separation and premium punch.',
    'soft-pastel': 'use soft pastel tones with a gentle and refined palette.',
    earthy: 'apply earthy tones with grounded warmth and natural realism.',
    'black-and-white': 'render the image in refined black-and-white tones.',
    moody: 'use moody tonal treatment with a rich atmospheric feel.',
    vibrant: 'use vibrant, lively colour with confident clarity.',
    cinematic: 'use cinematic colour grading with clean contrast and premium atmosphere.',
  }

  return map[match.value] || `use ${match.label.toLowerCase()} colour treatment.`
}

const describeSubject = (subject, purpose, customInstruction) => {
  const map = {
    boys: 'Create a refined portrait of the man or person in my uploaded photograph',
    girls: 'Create a refined portrait of the woman or person in my uploaded photograph',
    couples: 'Create a refined portrait of the two people in my uploaded photograph',
    family: 'Create a refined family portrait of the people in my uploaded photograph',
  }

  const prefix = map[subject] || 'Create a refined portrait of the person in my uploaded photograph'
  const purposeText = purpose === 'custom' && customInstruction ? 'based on the custom direction below' : 'with a premium, photo-real transformation finish'
  return `${prefix} ${purposeText}.`
}

const describeAspectRatio = (aspectRatio) => {
  if (!aspectRatio || aspectRatio === 'custom') return 'Use a composition that follows the requested custom format.'
  const value = aspectRatio.toLowerCase()
  if (value === '1:1') return 'Use a square 1:1 composition.'
  if (value === '4:5') return 'Use a vertical 4:5 portrait composition.'
  if (value === '9:16') return 'Use a full vertical 9:16 composition.'
  if (value === '16:9') return 'Use a wide 16:9 composition.'
  if (value === '3:4') return 'Use a vertical 3:4 composition.'
  return 'Use the selected aspect ratio throughout the composition.'
}

export function buildPrompt(selections = {}) {
  const safe = {
    ...defaultBuilderSelections,
    ...selections,
    accessories: Array.isArray(selections.accessories) ? selections.accessories : [],
    effects: Array.isArray(selections.effects) ? selections.effects : [],
  }

  const subjectOption = findOption(subjects, safe.subject)
  const styleOption = findOption(styles, safe.style)
  const purposeOption = findOption(purposes, safe.purpose)
  const template = pickTemplate(safe.subject, safe.style)
  const backgroundLabel = findOption(flattenBackgrounds(), safe.background)
  const outfitLabel = findOption(flattenOutfits(), safe.outfit)
  const poseLabel = findOption(poses, safe.pose)
  const moodLabel = findOption(moods, safe.mood)
  const lightingLabel = findOption(lighting, safe.lighting)
  const timeLabel = findOption(timeOptions, safe.time)
  const weatherLabel = findOption(weather, safe.weather)
  const colorLabel = findOption(colorGrading, safe.colorGrading)
  const culturalLabel = findOption(cultural, safe.cultural)
  const cameraValue = findOption(cameraSettings.camera, safe.camera)
  const lensValue = findOption(cameraSettings.lens, safe.lens)
  const frameValue = findOption(cameraSettings.framing, safe.framing)
  const photoStyleValue = findOption(cameraSettings.photographyStyle, safe.photographyStyle)

  const promptParts = []

  if (template?.basePrompt) {
    promptParts.push(removeTrailingPeriod(template.basePrompt))
  }

  promptParts.push(describeSubject(safe.subject, safe.purpose, safe.customInstruction))

  if (safe.identityPreservation !== false) {
    promptParts.push(
      'Maintain a strong identity-preservation standard: preserve the exact facial structure, eyes, nose, lips, jawline, skin tone, natural skin texture, age, facial proportions, and recognizable appearance. Do not replace the face with a generic model or create an unrelated identity. Do not over-beautify or distort the face into a different person.'
    )
  }

  promptParts.push(describePurpose(safe.purpose, safe.aspectRatio))
  promptParts.push(describeAspectRatio(safe.aspectRatio))

  if (backgroundLabel) {
    promptParts.push(`Set the scene ${describeBackground(backgroundLabel.value)}.`)
  }

  if (outfitLabel) {
    promptParts.push(`Dress the subject ${describeOutfit(outfitLabel.value)}.`)
  }

  if (poseLabel) {
    promptParts.push(`Pose the subject ${describePose(poseLabel.value, safe.subject)}.`)
  }

  if (safe.expression || safe.mood || safe.lighting) {
    promptParts.push(describeMood(safe.mood, safe.expression, safe.lighting))
  }

  if (timeLabel || weatherLabel) {
    promptParts.push(describeTimeWeather(safe.time, safe.weather))
  }

  if (culturalLabel) {
    promptParts.push(describeCulturalContext(culturalLabel.value))
  }

  if (cameraValue || lensValue || frameValue || photoStyleValue) {
    promptParts.push(describeCameraSettings(safe.camera, safe.lens, safe.framing, safe.photographyStyle))
  }

  if (safe.style) {
    const styleLabel = styleOption ? styleOption.label.toLowerCase() : String(safe.style).replace(/-/g, ' ')
    promptParts.push(`Apply a ${styleLabel} visual treatment with polished visual direction and a premium, believable finish.`)
  }

  if (moodLabel) {
    promptParts.push(`The overall mood should feel ${moodLabel.label.toLowerCase()}.`)
  }

  if (lightingLabel) {
    promptParts.push(`Use ${lightingLabel.label.toLowerCase()} lighting to support the emotional tone.`)
  }

  if (colorLabel) {
    promptParts.push(describeColorGrading(colorLabel.value))
  }

  if (safe.subject === 'couples') {
    promptParts.push('Keep the visual relationship believable and natural, preserving both identities distinctly and avoiding merged or duplicated features.')
  }

  if (safe.subject === 'family') {
    promptParts.push('Keep each family member clearly recognizable, preserving distinct identities and avoiding duplicated faces or merged features.')
  }

  const accessoryText = describeAccessories(safe.accessories)
  if (accessoryText) {
    promptParts.push(accessoryText)
  }

  const effectText = describeEffects(safe.effects)
  if (effectText) {
    promptParts.push(effectText)
  }

  promptParts.push(
    'Use natural composition, realistic proportions, believable anatomy, detailed face rendering, natural skin texture, clean hands, coherent lighting, realistic depth, and professional photographic quality.'
  )

  promptParts.push(
    'Avoid distorted facial features, altered identity, extra fingers, warped clothing, low-detail skin, duplicate people, merged faces, random text, watermarks, malformed anatomy, and obvious artificial artifacts.'
  )

  if (safe.customInstruction && safe.customInstruction.trim()) {
    const custom = safe.customInstruction.trim()
    promptParts.push(`Additional instruction: ${custom}`)
  }

  const prompt = promptParts
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  const metadata = {
    subject: subjectOption?.label || safe.subject,
    style: styleOption?.label || safe.style,
    purpose: purposeOption?.label || safe.purpose,
    aspectRatio: safe.aspectRatio,
    identityPreservation: Boolean(safe.identityPreservation),
    customInstructionPresent: Boolean(safe.customInstruction && safe.customInstruction.trim()),
    template: template?.id || null,
  }

  return {
    prompt,
    metadata,
  }
}

export default buildPrompt
