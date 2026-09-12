import { Outlet } from 'react-router-dom'
import promptStyles from './data/prompts.js'

function App() {
  console.log('Prompt styles sample count:', promptStyles.length)

  return <Outlet />
}
