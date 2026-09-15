import {
  accessories,
  backgrounds,
  cameraSettings,
  colorGrading,
  compatibility,
  cultural,
  effects,
  lighting,
  moods,
  poses,
  purposes,
  styles,
  subjects,
  timeOptions,
  weather,
  outfits,
} from '../data/createBuilderOptions.js'
import { createDefaultBuilderSelections } from './promptBuilder.js'

const pickRandom = (items = []) => (items.length ? items[Math.floor(Math.random() * items.length)] : null)

const pickRandomSubset = (items = [], maxCount = 2) => {
  const list = [...items]
  const count = Math.min(maxCount, list.length)
  const selected = []

  while (selected.length < count && list.length > 0) {
    const index = Math.floor(Math.random() * list.length)
    selected.push(list.splice(index, 1)[0])
  }

  return selected
}

export function randomizeBuilderSelections(currentSelections = createDefaultBuilderSelections()) {
  const subject = pickRandom(subjects.map((option) => option.value)) || currentSelections.subject
  const subjectRules = compatibility.subjectRules[subject] || {}
  const relevantPoses = subjectRules.relevantPoses || []
  const relevantOutfits = subjectRules.relevantOutfits || []
  const recommendedBackgrounds = subjectRules.recommendedBackgrounds || []

  const posePool = poses.filter(
    (option) =>
      relevantPoses.includes(option.value) ||
      ['standing', 'sitting', 'looking-at-camera', 'casual-standing'].includes(option.value)
  )

  const outfitPool = Object.values(outfits)
    .flat()
    .filter(
      (option) =>
        relevantOutfits.includes(option.value) ||
        ['casual', 'formal', 'traditional', 'custom'].includes(option.value)
    )

  const backgroundPool = Object.values(backgrounds)
    .flat()
    .filter(
      (option) =>
        recommendedBackgrounds.includes(option.value) ||
        option.value === 'studio' ||
        option.value === 'garden' ||
        option.value === 'cafe'
    )

  const purposePool = purposes.filter((option) => {
    if (subject === 'couples') {
      return ['general-portrait', 'facebook-post', 'instagram-post', 'facebook-story', 'instagram-reels', 'facebook-profile'].includes(option.value)
    }
    if (subject === 'family') {
      return ['general-portrait', 'facebook-post', 'instagram-post', 'facebook-cover', 'facebook-profile'].includes(option.value)
    }
    return ['general-portrait', 'instagram-post', 'facebook-profile', 'youtube-thumbnail', 'instagram-reels', 'facebook-post'].includes(option.value)
  })

  const stylePool = styles.filter((option) => {
    if (subject === 'couples') {
      return ['cinematic', 'romantic', 'luxury', 'editorial', 'vintage', 'traditional', 'street-style', 'modern'].includes(option.value)
    }
    if (subject === 'family') {
      return ['cinematic', 'documentary', 'traditional', 'luxury', 'modern', 'vintage', 'casual'].includes(option.value)
    }
    return ['cinematic', 'modern', 'luxury', 'editorial', 'street-style', 'traditional', 'vintage', 'soft-aesthetic'].includes(option.value)
  })

  const result = createDefaultBuilderSelections({
    ...currentSelections,
    subject,
    purpose: pickRandom(purposePool.map((option) => option.value)) || currentSelections.purpose,
    style: pickRandom(stylePool.map((option) => option.value)) || currentSelections.style,
    background: pickRandom(backgroundPool.map((option) => option.value)) || currentSelections.background,
    outfit: pickRandom(outfitPool.map((option) => option.value)) || currentSelections.outfit,
    pose: pickRandom(posePool.map((option) => option.value)) || currentSelections.pose,
    mood: pickRandom(moods.map((option) => option.value)) || currentSelections.mood,
    lighting: pickRandom(lighting.map((option) => option.value)) || currentSelections.lighting,
    expression: pickRandom(['natural', 'happy', 'smiling', 'confident', 'calm', 'romantic', 'professional']) || currentSelections.expression,
    time: pickRandom(timeOptions.map((option) => option.value)) || currentSelections.time,
    weather: pickRandom(weather.map((option) => option.value)) || currentSelections.weather,
    colorGrading: pickRandom(colorGrading.map((option) => option.value)) || currentSelections.colorGrading,
    cultural: pickRandom(cultural.map((option) => option.value)) || currentSelections.cultural,
    camera: pickRandom(cameraSettings.camera.map((option) => option.value)) || currentSelections.camera,
    lens: pickRandom(cameraSettings.lens.map((option) => option.value)) || currentSelections.lens,
    framing: pickRandom(cameraSettings.framing.map((option) => option.value)) || currentSelections.framing,
    photographyStyle: pickRandom(cameraSettings.photographyStyle.map((option) => option.value)) || currentSelections.photographyStyle,
    accessories: pickRandomSubset(accessories.filter((option) => option.value !== 'none').map((option) => option.value), 2),
    effects: pickRandomSubset(effects.map((option) => option.value), 1),
    identityPreservation: true,
    customInstruction: currentSelections.customInstruction || '',
  })

  return result
}

export default randomizeBuilderSelections
