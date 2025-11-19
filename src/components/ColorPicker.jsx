import { useTheme, THEME_COLORS } from '../contexts/ThemeContext'
import { Check } from 'lucide-react'

const ColorPicker = () => {
  const { theme, changeColor } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Chọn màu chủ đạo</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Object.entries(THEME_COLORS).map(([key, colorData]) => (
            <button
              key={key}
              onClick={() => changeColor(key)}
              className={`relative h-16 w-16 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                theme.color === key
                  ? 'border-slate-900 ring-4 ring-primary-500 ring-opacity-30 ring-offset-2 ring-offset-white dark:border-slate-100 dark:ring-offset-slate-900'
                  : 'border-slate-200 hover:border-primary-200 dark:border-slate-700 dark:hover:border-primary-400'
              }`}
              title={colorData.name}
            >
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${colorData.primary[600]} 0%, ${colorData.primary[700]} 100%)`
                }}
              />
              {theme.color === key && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <Check className="text-white drop-shadow-lg" size={20} />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Màu hiện tại: <span className="font-medium">{THEME_COLORS[theme.color]?.name}</span>
        </p>
      </div>
    </div>
  )
}

export default ColorPicker





