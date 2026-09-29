function normalizeForComparison(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordsOf(normalizedText) {
  return normalizedText.split(' ').filter(Boolean)
}

function stripLeadingEcho(echoTail, candidateKey, candidateText) {
  const tailWords = wordsOf(echoTail)
  const candidateWords = wordsOf(candidateKey)
  const rawWords = candidateText.split(/\s+/).filter(Boolean)
  if (!tailWords.length || !candidateWords.length) {
    return { key: candidateKey, text: candidateText }
  }

  let overlap = 0
  const maxOverlap = Math.min(tailWords.length, candidateWords.length)
  for (let size = maxOverlap; size > 0; size -= 1) {
    const tailSlice = tailWords.slice(tailWords.length - size).join(' ')
    const candidateSlice = candidateWords.slice(0, size).join(' ')
    if (tailSlice === candidateSlice) {
      overlap = size
      break
    }
  }

  if (overlap === 0) return { key: candidateKey, text: candidateText }
  const remainingRaw = rawWords.slice(overlap).join(' ')
  const remainingKey = candidateWords.slice(overlap).join(' ')
  return { key: remainingKey, text: remainingRaw }
}

function runVoiceTranscriptSimulation() {
  // Node-only mirror of the page's onresult/onend bookkeeping. Kept in this
  // temporary script (not shipped) to exercise the exact duplicate paths.
  const committed = { value: '' }
  const runFinals = []
  let runMaxIndex = -1
  let overlapTail = ''
  let interim = ''
  const shown = []

  const rebuild = () => {
    const sessionText = runFinals.map((entry) => entry.display).join(' ')
    const combined = [committed.value.trim(), sessionText.trim()].filter(Boolean).join(' ')
    return combined ? `${combined} ` : ''
  }
  const render = () => {
    shown.push(`${committed.value}${runFinals.map((entry) => entry.display).join(' ')}${runFinals.length ? ' ' : ''}${interim}`.trim())
  }
  const onEndRestartFold = () => {
    committed.value = rebuild()
    overlapTail = normalizeForComparison(committed.value)
    runFinals.length = 0
    runMaxIndex = -1
    interim = ''
    render()
  }
  const onResult = (resultIndex, results) => {
    interim = ''
    for (let index = resultIndex; index < results.length; index += 1) {
      const result = results[index]
      const display = (result.text ?? '').trim()
      if (!display) continue
      const key = normalizeForComparison(display)
      if (!result.isFinal) {
        interim += result.text
        continue
      }
      if (index <= runMaxIndex) {
        committed.value = rebuild()
        overlapTail = normalizeForComparison(`${committed.value}`)
        runFinals.length = 0
        runMaxIndex = -1
        interim = ''
      }
      const existing = runFinals.find((entry) => entry.index === index)
      if (existing) {
        if (existing.key === key) continue
        existing.key = key
        existing.display = display
      } else {
        let nextDisplay = display
        let nextKey = key
        if (overlapTail) {
          const stripped = stripLeadingEcho(overlapTail, key, display)
          nextDisplay = stripped.text
          nextKey = stripped.key
          overlapTail = ''
        }
        if (!nextDisplay.trim()) continue
        runFinals.push({ index, key: nextKey, display: nextDisplay })
      }
      runMaxIndex = Math.max(runMaxIndex, index)
      interim = ''
    }
    render()
  }

  const final = (text) => ({ text, isFinal: true })
  const part = (text) => ({ text, isFinal: false })
  const check = (name, actual, expected) => {
    const ok = actual === expected
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`)
    if (!ok) process.exitCode = 1
  }

  // 1. Repeated interim hypotheses for one phrase must replace, not append.
  onResult(0, [part('My uploaded')])
  onResult(0, [part('My uploaded photo')])
  check('interim-replace', shown[shown.length - 1], 'My uploaded photo')

  // 2. Interim followed by final commits exactly once.
  onResult(0, [final('My uploaded photo')])
  check('interim-then-final', shown[shown.length - 1], 'My uploaded photo')

  // 3. Same final refired with same index must not duplicate.
  onResult(0, [final('My uploaded photo')])
  check('same-final-refire', shown[shown.length - 1], 'My uploaded photo')

  // 4. Cumulative final containing the whole phrase twice appends once.
  committed.value = ''
  runFinals.length = 0
  runMaxIndex = -1
  overlapTail = ''
  onResult(0, [final('My uploaded photo')])
  onResult(0, [final('My uploaded photo'), final('My uploaded photo My uploaded photo')])
  check('cumulative-redelivery', shown[shown.length - 1], 'My uploaded photo')

  // 5. Automatic restart replaying the previous phrase must not duplicate.
  onEndRestartFold()
  onResult(0, [final('My uploaded photo')])
  onResult(0, [final('My uploaded photo'), final('My uploaded photo My uploaded photo')])
  check('restart-replay', shown[shown.length - 1], 'My uploaded photo')

  // 6. Genuinely new words after a restart still append.
  onResult(1, [final('My uploaded photo'), final('with golden light')])
  check('new-words-after-restart', shown[shown.length - 1], 'My uploaded photo with golden light')

  // 7. Intentional in-run repeat ("photo photo") is preserved verbatim.
  committed.value = ''
  runFinals.length = 0
  runMaxIndex = -1
  overlapTail = ''
  onResult(0, [final('photo photo')])
  check('intentional-repeat', shown[shown.length - 1], 'photo photo')

  // 8. Bengali restart echo is stripped while new Bengali words still append.
  committed.value = ''
  runFinals.length = 0
  runMaxIndex = -1
  overlapTail = ''
  onResult(0, [final('আমার আপলোড করা ছবি')])
  onEndRestartFold()
  onResult(0, [final('আমার আপলোড করা ছবি')])
  check('bengali-restart-echo', shown[shown.length - 1], 'আমার আপলোড করা ছবি')
  onResult(1, [final('আমার আপলোড করা ছবি'), final('সোনালি আলো')])
  check('bengali-new-words', shown[shown.length - 1], 'আমার আপলোড করা ছবি সোনালি আলো')
}

runVoiceTranscriptSimulation()
