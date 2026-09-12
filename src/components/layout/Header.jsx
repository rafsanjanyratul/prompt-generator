import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Styles', to: '/styles/featured' },
]

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="brand" aria-label="PromptMuse home">
          <span className="brand-mark">P</span>
          <span>PromptMuse</span>
        </NavLink>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
