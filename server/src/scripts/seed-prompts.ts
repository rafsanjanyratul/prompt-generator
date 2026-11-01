import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

import { connectToDatabase } from '../config/database.js'
import { Prompt } from '../modules/prompts/prompt.model.js'

type PromptSeedRecord = {
  id: number
  slug: string
  title: string
  shortDescription: string
  category: string
  gender: string
  style: string
  tags: string[]
  image: string
  prompt: string
  featured: boolean
  trending: boolean
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../../..')
const promptsPath = path.resolve(projectRoot, 'src/data/prompts.json')

async function importPrompts(): Promise<void> {
  const fileContents = await fs.readFile(promptsPath, 'utf-8')
  const prompts = JSON.parse(fileContents) as PromptSeedRecord[]

  if (!Array.isArray(prompts)) {
    throw new Error('Prompt data file does not contain a valid array of prompt records.')
  }

  const operations = prompts.map((prompt) => ({
    updateOne: {
      filter: { slug: prompt.slug },
      update: { $set: prompt },
      upsert: true,
    },
  }))

  const result = await Prompt.bulkWrite(operations, { ordered: false })

  const processedCount = result.upsertedCount + result.modifiedCount
  console.log(`Seeded prompts: ${processedCount} records processed (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`)
}

async function main(): Promise<void> {
  try {
    await connectToDatabase()
    await importPrompts()
  } catch (error) {
    console.error('Prompt seeding failed:', error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB connection closed.')
  }
}

await main()
