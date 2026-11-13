import { copyFileSync, existsSync } from 'node:fs'

const source = 'dist/index.html'
const fallback = 'dist/200.html'

if (!existsSync(source)) {
  console.error(`Cannot create Surge fallback: ${source} does not exist. Run "npm run build" first.`)
  process.exitCode = 1
} else {
  copyFileSync(source, fallback)
  console.log(`Created Surge SPA fallback: ${fallback}`)
}
