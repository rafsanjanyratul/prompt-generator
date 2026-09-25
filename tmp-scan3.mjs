import fs from 'fs'

const p = 'src/pages/CreatePage.jsx'
const s = fs.readFileSync(p, 'utf8')
const L = s.split('\n')

const has = (t) => (s.includes(t) ? 'YES' : 'no ')
const out = []
out.push('lines=' + L.length)
out.push('CRLF=' + (s.split('\r\n').length - 1) + ' loneLF=' + ((s.match(/\n/g) || []).length - (s.split('\r\n').length - 1)))
out.push('BOM=' + (s.charCodeAt(0) === 0xfeff))
out.push('visibleBackgrounds=' + has('visibleBackgrounds'))
out.push('relevantBackgrounds=' + has('relevantBackgrounds'))
out.push('appearanceBackgroundsBySubject=' + has('appearanceBackgroundsBySubject'))
out.push('garmentOptions=' + has('garmentOptions'))
out.push('outfitColorGroups=' + has('outfitColorGroups'))
out.push('outfitGarments=' + has('outfitGarments'))
out.push('outfitColors=' + has('outfitColors'))
out.push('garmentColorGroupKeys=' + has('garmentColorGroupKeys'))
out.push('toggleMultiSelect=' + has('toggleMultiSelect'))
out.push('backgrounds=' + has('backgrounds'))
out.push('Specific Clothing=' + has('Specific Clothing'))
out.push('')
out.push('--- lines containing key markers ---')
L.forEach((line, i) => {
  if (/visibleBackgrounds|relevantBackgrounds|appearanceBackgroundsBySubject|garmentOptions|outfitColorGroups|outfitGarments|outfitColors|garmentColorGroupKeys|toggleMultiSelect|Specific Clothing|visibleOutfits|relevantOutfits/.test(line)) {
    out.push((i + 1) + ': ' + line.trim().slice(0, 150))
  }
})

fs.writeFileSync('tmp-scan3.txt', out.join('\n'), 'utf8')
console.log('WROTE tmp-scan3.txt')
