import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// Các theme màu sắc có sẵn
export const THEME_COLORS = {
  blue: {
    name: 'Xanh dương',
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    }
  },
  green: {
    name: 'Xanh lá',
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    }
  },
  purple: {
    name: 'Tím',
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    }
  },
  red: {
    name: 'Đỏ',
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    }
  },
  orange: {
    name: 'Cam',
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    }
  },
  indigo: {
    name: 'Chàm',
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    }
  },
}

const baseTheme = { color: 'blue', logo: null, logoUrl: null, mode: 'light' }

const getDefaultTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return {
        ...baseTheme,
        ...parsed,
        mode: parsed.mode === 'dark' ? 'dark' : 'light',
      }
    } catch {
      return baseTheme
    }
  }
  return baseTheme
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getDefaultTheme())

  // Áp dụng theme vào CSS variables
  const applyTheme = (themeData) => {
    const root = document.documentElement
    const colors = THEME_COLORS[themeData.color]?.primary || THEME_COLORS.blue.primary

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, value)
    })
  }

  const applyMode = (mode) => {
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('color-scheme', 'dark')
    } else {
      root.classList.remove('dark')
      root.style.setProperty('color-scheme', 'light')
    }
  }

  // Khởi tạo theme khi component mount
  useEffect(() => {
    applyTheme(theme)
    applyMode(theme.mode)
  }, [])

  // Lưu theme vào localStorage và áp dụng khi thay đổi
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme))
    applyTheme(theme)
    applyMode(theme.mode)
  }, [theme])

  const changeColor = (color) => {
    setTheme(prev => ({ ...prev, color }))
  }

  const changeLogo = (logoFile, logoUrl) => {
    setTheme(prev => ({ ...prev, logo: logoFile, logoUrl }))
  }

  const removeLogo = () => {
    setTheme(prev => ({ ...prev, logo: null, logoUrl: null }))
  }

  const resetTheme = () => {
    setTheme(baseTheme)
  }

  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }))
  }

  const setMode = (nextMode) => {
    setTheme(prev => ({
      ...prev,
      mode: nextMode === 'dark' ? 'dark' : 'light',
    }))
  }

  const value = {
    theme,
    changeColor,
    changeLogo,
    removeLogo,
    resetTheme,
    toggleMode,
    setMode,
    currentColors: THEME_COLORS[theme.color]?.primary || THEME_COLORS.blue.primary,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

