import {
  accessories,
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
  customAspectRatio: '',
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
  cultural: 'none',
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

const withArticle = (word) => (/^[aeiou8]/i.test(word) ? `an ${word}` : `a ${word}`)

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

const describePurpose = (purpose, customAspectRatio) => {
  const purposeOption = findOption(purposes, purpose)

  if (!purposeOption) {
    return 'Use a balanced portrait composition.'
  }

  const purposeMap = {
    'facebook-profile': 'Use a clean profile-friendly portrait composition with a centered face and clear focus.',
    'facebook-cover': 'Use a wide cover composition with enough space around the subject for a clean social layout.',
    'facebook-post': 'Use a balanced social-post composition with the face clearly prioritized.',
    'facebook-story': 'Use a vertical story composition with strong subject readability and clean framing.',
    'facebook-reels': 'Use a vertical reel composition with clear focus and natural motion.',
    'instagram-post': 'Use a feed-friendly portrait composition with the subject clearly centered and readable.',
    'instagram-story': 'Use a vertical story composition that keeps the subject crisp and easy to read.',
    'instagram-reels': 'Use a vertical reel composition with clear subject focus and natural movement.',
    'whatsapp-dp': 'Use a centered, clean small-size portrait composition with strong facial clarity.',
    'youtube-thumbnail': 'Use a bold thumbnail composition with clear subject hierarchy and readable framing.',
    'youtube-shorts': 'Use a vertical shorts composition with strong subject readability and clean focus.',
    'linkedin-profile': 'Use a professional portrait composition with clear facial focus and polished presentation.',
    'general-portrait': 'Use a clean portrait composition with strong facial focus and natural framing.',
    custom: 'Use a composition that follows the requested custom direction while keeping the face clearly dominant.',
  }

  const base = purposeMap[purposeOption.value] || 'Use a balanced portrait composition.'
  const ratio = purposeOption.ratio

  if (ratio === 'custom') {
    const custom = (customAspectRatio || '').trim()
    return custom ? `${base} Use a ${custom} aspect ratio.` : base
  }

  return `${base} Use a ${ratio} aspect ratio.`
}

const shouldIncludeWeather = (backgroundValue, weatherValue) => {
  if (!weatherValue || weatherValue === 'none') return false

  const studioLike = new Set([
    'studio',
    'vintage-studio',
    'office',
    'mall',
    'airport',
    'restaurant',
    'cafe',
    'luxury-hotel',
    'resort',
    'palace',
    'mansion',
    'castle',
  ])

  if (studioLike.has(backgroundValue)) {
    return false
  }

  return true
}

const describeBackground = (background) => {
  const match = findOption(flattenBackgrounds(), background)
  if (!match) return ''

  const map = {
    mountain: 'in a mountain setting with layered terrain',
    forest: 'in a forest setting',
    river: 'by a river',
    lake: 'by a lake',
    waterfall: 'in front of a waterfall',
    beach: 'on a beach',
    field: 'in an open field',
    village: 'in a village',
    garden: 'in a garden',
    park: 'in a park',
    'tea-garden': 'in a tea garden',
    'dhaka-street': 'on a Dhaka street',
    'modern-city': 'in a modern city',
    rooftop: 'on a rooftop',
    cafe: 'in a café',
    restaurant: 'in a restaurant',
    mall: 'in a mall',
    office: 'in an office',
    studio: 'in a studio',
    'luxury-hotel': 'in a luxury hotel',
    airport: 'at an airport',
    resort: 'at a resort',
    'historical-place': 'at a historical place',
    desert: 'in a desert',
    'snow-mountain': 'on a snow-covered mountain',
    'european-street': 'on a European-style street',
    'tropical-island': 'on a tropical island',
    palace: 'in a palace',
    mansion: 'in a mansion',
    castle: 'in a castle',
    'fantasy-kingdom': 'in a fantasy kingdom',
    'cyberpunk-city': 'in a cyberpunk city',
    'neon-street': 'on a neon-lit street',
    'old-house': 'in an old house',
    'vintage-studio': 'in a vintage studio',
    'rural-bangladesh': 'in a rural Bangladesh setting',
    'urban-bangladesh': 'in an urban Bangladesh setting',
  }

  return map[match.value] || `in a ${match.label.toLowerCase()} setting`
}

const describeIdentityPreservation = () =>
  'Preserve the exact facial structure, eyes, nose, lips, jawline, skin tone, natural skin texture, age, facial proportions, and recognizable appearance. Keep the identity believable and consistent without replacing the face with a generic model, over-beautifying the subject, or distorting facial features.'

const describeOutfit = (outfit) => {
  const match = findOption(flattenOutfits(), outfit)
  if (!match) return ''

  const map = {
    casual: 'wearing casual clothing',
    formal: 'wearing formal clothing',
    traditional: 'wearing traditional clothing',
    party: 'wearing a party outfit',
    wedding: 'wearing a wedding outfit',
    streetwear: 'wearing streetwear',
    luxury: 'wearing luxury clothing',
    'old-money': 'wearing old-money-style clothing',
    business: 'wearing business attire',
    sportswear: 'wearing sportswear',
    vacation: 'wearing vacation clothing',
    winter: 'wearing winter clothing',
    summer: 'wearing summer clothing',
    'traditional-bangladeshi': 'wearing traditional Bangladeshi clothing',
    panjabi: 'wearing a panjabi',
    saree: 'wearing a saree',
    kurta: 'wearing a kurta',
    suit: 'wearing a suit',
    't-shirt-jeans': 'wearing a T-shirt and jeans',
    'lungi-t-shirt': 'wearing a lungi and T-shirt',
    custom: 'wearing a custom outfit based on the requested styling',
  }

  return map[match.value] || `wearing ${match.label.toLowerCase()}`
}

const describePose = (pose, subject) => {
  const match = findOption(poses, pose)
  if (!match) return ''

  const map = {
    standing: 'standing',
    sitting: 'sitting',
    walking: 'walking',
    'looking-at-camera': 'looking toward the camera',
    'looking-away': 'looking away from the camera',
    'side-profile': 'in a side-profile pose',
    leaning: 'leaning',
    'hands-in-pocket': 'with hands in the pockets',
    'casual-standing': 'standing in a casual pose',
    'walking-toward-camera': 'walking toward the camera',
    'sitting-on-chair': 'sitting on a chair',
    'sitting-on-ground': 'sitting on the ground',
    candid: 'in a candid pose',
    'couple-walking': 'walking together as a couple',
    'couple-sitting': 'sitting together as a couple',
    'holding-hands': 'holding hands',
    'family-group-portrait': 'posed as a family group',
    custom: 'posed according to the requested composition direction',
  }

  return map[match.value] || 'posed naturally and comfortably'
}

const describeMood = (mood, expression, lightingValue) => {
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
  const lightingOption = findOption(lighting, lightingValue)

  const moodText = moodOption ? moodOption.label.toLowerCase() : 'balanced'
  const expressionText = expressionOption ? expressionOption.label.toLowerCase() : 'natural'
  const lightingText = lightingOption ? lightingOption.label.toLowerCase() : 'soft'

  const hasExpression = expression && expression !== 'none'
  const hasMood = mood && mood !== 'none'
  const hasLighting = lightingValue && lightingValue !== 'none'

  if (hasExpression && hasMood && hasLighting) {
    return `Use a ${expressionText} expression with a ${moodText} mood and ${lightingText} lighting.`
  }

  const clauses = []
  if (hasExpression) clauses.push(`a ${expressionText} expression`)
  if (hasMood) clauses.push(`a ${moodText} mood`)
  if (hasLighting) clauses.push(`${lightingText} lighting`)

  if (!clauses.length) return ''

  const joined =
    clauses.length === 1
      ? clauses[0]
      : clauses.length === 2
        ? `${clauses[0]} and ${clauses[1]}`
        : `${clauses.slice(0, -1).join(', ')}, and ${clauses.slice(-1)}`

  return `Use ${joined}.`
}

const describeTimeWeather = (time, weatherState) => {
  const clauses = []

  const timeSelection = findOption(timeOptions, time)
  if (timeSelection && timeSelection.value !== 'none') {
    clauses.push(`Set the scene during ${timeSelection.label.toLowerCase()}.`)
  }

  const weatherSelection = findOption(weather, weatherState)
  if (weatherSelection && weatherSelection.value !== 'none') {
    clauses.push(`The atmosphere should feel ${weatherSelection.label.toLowerCase()}.`)
  }

  return clauses.join(' ')
}

const describeCulturalContext = (culturalChoice) => {
  const match = findOption(cultural, culturalChoice)
  if (!match || match.value === 'none') return ''

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
  const cameraOption = findOption(cameraSettings.camera, camera)
  const lensOption = findOption(cameraSettings.lens, lens)
  const framingOption = findOption(cameraSettings.framing, framing)
  const styleOption = findOption(cameraSettings.photographyStyle, photographyStyle)

  const cameraLabel = cameraOption && cameraOption.value !== 'none' ? cameraOption.label.toLowerCase() : ''
  const lensLabel = lensOption && lensOption.value !== 'none' ? lensOption.label.toLowerCase() : ''
  const framingLabel = framingOption && framingOption.value !== 'none' ? framingOption.label.toLowerCase() : ''
  const styleLabel = styleOption && styleOption.value !== 'none' ? styleOption.label.toLowerCase() : ''

  const clauses = []
  if (cameraLabel) clauses.push(cameraLabel)
  if (lensLabel) clauses.push(`${withArticle(lensLabel)} lens`)
  if (framingLabel) clauses.push(`${framingLabel} framing`)
  if (styleLabel) clauses.push(`${withArticle(styleLabel)} style`)

  if (!clauses.length) return ''

  const [lead, ...rest] = clauses
  if (!rest.length) return `Use ${lead}.`

  const tail =
    rest.length === 1
      ? rest[0]
      : `${rest.slice(0, -1).join(', ')}, and ${rest.slice(-1)}`

  return `Use ${lead} with ${tail}.`
}

const describeAccessories = (selectedAccessories) => {
  if (!selectedAccessories || !selectedAccessories.length) return ''
  const cleaned = selectedAccessories.filter((item) => item && item !== 'none')
  if (!cleaned.length) return ''

  const labels = cleaned.map((value) => {
    const match = findOption(accessories, value)
    return match ? match.label.toLowerCase() : value
  })

  if (labels.length === 1) {
    return `Include ${labels[0]} as an accessory.`
  }

  const leading = `${labels.slice(0, -1).join(', ')}, and ${labels.slice(-1)[0]}`
  return `Include ${leading} as accessories.`
}

const weatherEffectOverlaps = {
  rainy: ['rain'],
  foggy: ['fog'],
}

const filterOverlappingEffects = (weatherValue, effectValues = []) => {
  const overlaps = weatherEffectOverlaps[weatherValue] || []
  if (!overlaps.length) return effectValues
  return effectValues.filter((value) => !overlaps.includes(value))
}

const describeEffects = (selectedEffects) => {
  if (!selectedEffects || !selectedEffects.length) return ''
  const cleaned = selectedEffects.filter((item) => item && item !== 'none')
  if (!cleaned.length) return ''

  const labels = cleaned.map((value) => {
    const match = findOption(effects, value)
    return match ? match.label.toLowerCase() : value
  })

  if (labels.length === 1) {
    return `Add ${labels[0]}.`
  }

  const leading = `${labels.slice(0, -1).join(', ')}, and ${labels.slice(-1)[0]}`
  return `Add ${leading}.`
}

const describeColorGrading = (colorValue) => {
  const match = findOption(colorGrading, colorValue)
  if (!match || match.value === 'none') return ''

  const map = {
    natural: 'Use natural colour grading.',
    warm: 'Use warm colour grading.',
    cool: 'Use cool colour grading.',
    'kodak-film': 'Use Kodak-inspired film colour grading.',
    'faded-vintage': 'Use faded vintage colour grading.',
    matte: 'Use matte colour grading.',
    'high-contrast': 'Use high-contrast colour grading.',
    'soft-pastel': 'Use soft pastel colour grading.',
    earthy: 'Use earthy colour grading.',
    'black-and-white': 'Use black-and-white colour grading.',
    moody: 'Use moody colour grading.',
    vibrant: 'Use vibrant colour grading.',
    cinematic: 'Use cinematic colour grading.',
  }

  return map[match.value] || `Use ${match.label.toLowerCase()} colour grading.`
}

const subjectNouns = {
  boys: { noun: 'man', isFamily: false },
  girls: { noun: 'woman', isFamily: false },
  couples: { noun: 'couple', isFamily: false },
  family: { noun: 'family', isFamily: true },
}

const describeSubject = (subject, template) => {
  // The matched base template anchors the neutral subject opening only.
  // Its creative basePrompt text is intentionally NOT inserted into the prompt,
  // so no unselected creative direction is introduced.
  const cohort = (template && template.subject) || subject
  const data = subjectNouns[cohort] || subjectNouns[subject] || { noun: 'person', isFamily: false }
  const portrait = data.isFamily ? 'family portrait' : 'portrait'
  return `Create a ${portrait} of the ${data.noun} in my uploaded photograph.`
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

  promptParts.push(describeSubject(safe.subject, template))

  if (safe.identityPreservation !== false) {
    promptParts.push(describeIdentityPreservation())
  }

  promptParts.push(describePurpose(safe.purpose, safe.customAspectRatio))

  if (backgroundLabel && backgroundLabel.value !== 'none') {
    promptParts.push(`Place the subject ${describeBackground(backgroundLabel.value)}.`)
  }

  if (outfitLabel && outfitLabel.value !== 'none') {
    promptParts.push(`Dress the subject ${describeOutfit(outfitLabel.value)}.`)
  }

  if (poseLabel && poseLabel.value !== 'none') {
    promptParts.push(`Pose the subject ${describePose(poseLabel.value, safe.subject)}.`)
  }

  if (safe.expression || safe.mood || safe.lighting) {
    promptParts.push(describeMood(safe.mood, safe.expression, safe.lighting))
  }

  if ((timeLabel || weatherLabel) && shouldIncludeWeather(safe.background, safe.weather)) {
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
    promptParts.push(`Apply a ${styleLabel} visual treatment.`)
  }

  if (colorLabel) {
    promptParts.push(describeColorGrading(colorLabel.value))
  }

  const accessoryText = describeAccessories(safe.accessories)
  if (accessoryText) {
    promptParts.push(accessoryText)
  }

  const weatherIncluded = Boolean(
    weatherLabel &&
      weatherLabel.value !== 'none' &&
      shouldIncludeWeather(safe.background, safe.weather)
  )
  const effectText = describeEffects(
    weatherIncluded ? filterOverlappingEffects(safe.weather, safe.effects) : safe.effects
  )
  if (effectText) {
    promptParts.push(effectText)
  }

  if (safe.customInstruction && safe.customInstruction.trim()) {
    const custom = safe.customInstruction.trim()
    promptParts.push(custom)
  }

  promptParts.push(
    'Keep the result anatomically consistent, with no distorted facial features, duplicate faces, warped clothing, or obvious artificial artifacts.'
  )

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
    aspectRatio: purposeOption?.ratio || null,
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