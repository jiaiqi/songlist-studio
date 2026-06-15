import { useTheme } from '@/theme/ThemeProvider'
import { type ThemeId, themes } from '@/theme/themes'

function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme()

  return (
    <label className="theme-switcher">
      <span>主题</span>
      <select value={themeId} onChange={(event) => setThemeId(event.target.value as ThemeId)}>
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default ThemeSwitcher
