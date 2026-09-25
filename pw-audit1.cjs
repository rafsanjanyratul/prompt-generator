const { chromium, EDGE, URL, results, ok, fail } = require('./pw-helper.cjs')
;(async () => {
  const browser = await chromium.launch({ executablePath: EDGE })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 160)))
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2500)
  const getPrompt = async () => {
    try { return ((await page.locator('div.max-h-\\[290px\\] p').first().innerText({ timeout: 6000 })) || '').replace(/\s+/g, ' ') }
    catch { return '' }
  }
  const hasCreate = (await page.content()).includes('Customize your image')
  hasCreate ? ok('page-renders') : fail('page-renders', 'missing heading')
  for (const [name, needle] of [['Family', 'family'], ['Couples', 'couple'], ['Women', 'woman'], ['Men', 'man']]) {
    await page.getByRole('button', { name: `Select subject ${name}` }).click()
    await page.waitForTimeout(400)
    const p = await getPrompt()
    p.toLowerCase().includes(needle) ? ok(`subject-${name}`) : fail(`subject-${name}`, p.slice(0, 160))
  }
  await page.getByRole('button', { name: 'Select purpose Facebook Profile' }).click()
  await page.waitForTimeout(300)
  let p = await getPrompt()
  /1:1/.test(p) ? ok('format-fb-1:1') : fail('format-fb-1:1', p.slice(0, 140))
  const customPurpose = page.locator('#custom-purpose')
  await customPurpose.fill('WIDE BANNER FEEL AUDIT')
  await page.waitForTimeout(300)
  p = await getPrompt()
  p.includes('WIDE BANNER FEEL AUDIT') ? ok('format-custom-purpose') : fail('format-custom-purpose', p.slice(0, 200))
  await customPurpose.fill('')
  await page.getByRole('button', { name: 'Select style Vintage' }).click()
  await page.waitForTimeout(300)
  p = await getPrompt()
  p.toLowerCase().includes('vintage') ? ok('style-vintage') : fail('style-vintage', p.slice(0, 140))
  const customStyle = page.locator('#custom-style')
  await customStyle.fill('NEON NOIR AUDIT')
  await page.waitForTimeout(300)
  p = await getPrompt()
  p.includes('NEON NOIR AUDIT') ? ok('style-custom') : fail('style-custom', p.slice(0, 200))
  await customStyle.fill('')
  await browser.close()
  console.log(results.join('\n'))
  process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0)
})().catch((e) => { console.error('AUDIT-CRASH ' + String(e).slice(0, 300)); process.exit(2) })
