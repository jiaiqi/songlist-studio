import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import ThemeSwitcher from './ThemeSwitcher'

const navItems = [
  { label: '工作台', to: '/' },
  { label: '我的曲库', to: '/library' },
  { label: '生成歌单', to: '/generate' },
  { label: '发布历史', to: '/history' },
  { label: '文档', to: '/docs' },
]

function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">S</span>
          <div>
            <strong>SongList Studio</strong>
            <span>曲库 · 分类 · 发布历史</span>
          </div>
        </div>
        <nav className="main-nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ThemeSwitcher />
      </header>
      {children}
    </div>
  )
}

export default AppFrame
