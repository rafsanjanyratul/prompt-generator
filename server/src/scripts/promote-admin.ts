import mongoose from 'mongoose'

import { connectToDatabase } from '../config/database.js'
import { User } from '../modules/users/user.model.js'

const TARGET_EMAIL = 'rafsanjany903@gmail.com'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function main(): Promise<void> {
  try {
    await connectToDatabase()

    const user = await User.findOne({
      email: {
        $regex: `^${escapeRegExp(TARGET_EMAIL)}$`,
        $options: 'i',
      },
    }).select('_id email role')

    if (!user) {
      console.error(`No user found for email: ${TARGET_EMAIL}`)
      process.exitCode = 1
      return
    }

    const result = await User.updateOne(
      { _id: user._id },
      { $set: { role: 'admin' } },
    )

    if (result.modifiedCount === 0) {
      console.log(`User already has admin role: ${user.email}`)
      return
    }

    console.log(`Promoted user to admin: ${user.email}`)
  } catch (error) {
    console.error('Admin promotion failed:', error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB connection closed.')
  }
}

await main()
