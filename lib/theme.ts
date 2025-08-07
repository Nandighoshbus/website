// Theme utility for consistent Nandighosh branding
export const nandighoshTheme = {
  // Color palette
  colors: {
    primary: {
      main: 'from-blue-600 to-purple-600',
      hover: 'from-blue-700 to-purple-700',
      light: 'from-blue-500 to-purple-500',
      dark: 'from-blue-800 to-purple-800',
      border: 'border-blue-400/30 hover:border-blue-300/50'
    },
    accent: {
      main: 'from-orange-500 to-yellow-500',
      hover: 'from-orange-600 to-yellow-600',
      light: 'from-orange-400 to-yellow-400',
      dark: 'from-orange-700 to-yellow-700',
      border: 'border-orange-400/30 hover:border-orange-300/50'
    },
    glass: {
      light: 'bg-white/10 backdrop-blur-sm border border-white/20',
      medium: 'bg-white/20 backdrop-blur-md border border-white/30',
      dark: 'bg-white/30 backdrop-blur-lg border border-white/40'
    }
  },

  // Component styles
  components: {
    button: {
      primary: `
        bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-700 hover:to-purple-700 
        text-white border border-blue-400/30 hover:border-blue-300/50 
        shadow-2xl hover:shadow-3xl transform hover:scale-105 
        transition-all duration-300 px-6 py-2 rounded-xl 
        font-semibold btn-interactive ripple
      `,
      secondary: `
        bg-white/20 backdrop-blur-sm hover:bg-white/30 
        text-white border border-white/30 hover:border-white/50 
        shadow-2xl hover:shadow-3xl transform hover:scale-105 
        transition-all duration-300 px-6 py-2 rounded-xl 
        font-semibold btn-interactive ripple
      `,
      accent: `
        bg-gradient-to-r from-orange-500 to-yellow-500 
        hover:from-orange-600 hover:to-yellow-600 
        text-white border border-orange-400/30 hover:border-orange-300/50 
        shadow-2xl hover:shadow-3xl transform hover:scale-105 
        transition-all duration-300 px-6 py-2 rounded-xl 
        font-semibold btn-interactive ripple
      `,
      auth: `
        bg-gradient-to-r from-purple-600 to-pink-600 
        hover:from-purple-700 hover:to-pink-700 
        text-white border border-purple-400/30 hover:border-purple-300/50 
        shadow-2xl hover:shadow-3xl transform hover:scale-105 
        transition-all duration-300 px-6 py-2 rounded-xl 
        font-semibold btn-interactive ripple ring-2 ring-purple-300/20 hover:ring-purple-300/40
        shadow-purple-500/25 hover:shadow-purple-500/40 hover:shadow-2xl
        before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r 
        before:from-purple-400/20 before:to-pink-400/20 before:opacity-0 
        hover:before:opacity-100 before:transition-opacity before:duration-300
      `
    },

    card: {
      glass: `
        backdrop-blur-lg bg-white/15 border border-white/25 
        rounded-xl shadow-2xl
      `,
      solid: `
        bg-white border border-gray-200 rounded-xl shadow-lg 
        hover:shadow-xl transition-all duration-300
      `
    },

    input: {
      glass: `
        bg-gray-800/90 border-gray-600/50 text-white font-medium
        placeholder:text-gray-300 focus:border-purple-400/60 focus:bg-gray-700/90
        backdrop-blur-sm rounded-lg transition-all duration-200
        shadow-lg focus:shadow-xl
      `,
      solid: `
        bg-white border-gray-300 text-gray-900 
        placeholder:text-gray-500 focus:border-blue-500 
        rounded-lg
      `
    }
  },

  // Animation classes
  animations: {
    float: 'animate-float',
    pulse: 'animate-pulse',
    spin: 'animate-spin-slow',
    slideIn: 'animate-slide-in',
    bounce: 'animate-bounce',
    scale: 'hover:scale-105 transition-transform duration-300'
  },

  // Utility functions
  utils: {
    combineClasses: (...classes: string[]) => classes.filter(Boolean).join(' '),
    
    getButtonClasses: (variant: 'primary' | 'secondary' | 'accent' | 'auth' = 'primary') => {
      return nandighoshTheme.components.button[variant].replace(/\s+/g, ' ').trim()
    },

    getCardClasses: (variant: 'glass' | 'solid' = 'glass') => {
      return nandighoshTheme.components.card[variant].replace(/\s+/g, ' ').trim()
    },

    getInputClasses: (variant: 'glass' | 'solid' = 'glass') => {
      return nandighoshTheme.components.input[variant].replace(/\s+/g, ' ').trim()
    }
  }
}

// Export individual color utilities
export const themeColors = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600',
  primaryHover: 'hover:from-blue-700 hover:to-purple-700',
  accent: 'bg-gradient-to-r from-orange-500 to-yellow-500',
  accentHover: 'hover:from-orange-600 hover:to-yellow-600',
  glass: 'bg-white/20 backdrop-blur-sm border border-white/30',
  glassHover: 'hover:bg-white/30'
}

// CSS class name constants for consistency
export const THEME_CLASSES = {
  // Buttons
  BUTTON_PRIMARY: nandighoshTheme.utils.getButtonClasses('primary'),
  BUTTON_SECONDARY: nandighoshTheme.utils.getButtonClasses('secondary'),
  BUTTON_ACCENT: nandighoshTheme.utils.getButtonClasses('accent'),
  BUTTON_AUTH: nandighoshTheme.utils.getButtonClasses('auth'),
  
  // Cards
  CARD_GLASS: nandighoshTheme.utils.getCardClasses('glass'),
  CARD_SOLID: nandighoshTheme.utils.getCardClasses('solid'),
  
  // Inputs
  INPUT_GLASS: nandighoshTheme.utils.getInputClasses('glass'),
  INPUT_SOLID: nandighoshTheme.utils.getInputClasses('solid'),
  
  // Common animations
  HOVER_SCALE: 'hover:scale-105 transition-transform duration-300',
  FADE_IN: 'animate-fade-in',
  SLIDE_UP: 'animate-slide-up'
} as const

export default nandighoshTheme
