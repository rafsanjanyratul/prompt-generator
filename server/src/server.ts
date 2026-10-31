import app from './app.js'
import { connectToDatabase } from './config/database.js'
import { env } from './config/env.js'

const port = env.PORT

async function startServer() {
  try {
    await connectToDatabase()

    app.listen(port, () => {
      console.log(`PromptMuse API running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start server: MongoDB connection error')
    console.error(error)
    process.exit(1)
  }
}

startServer()
