# 🚌 Nandighosh Bus Service - Premium Travel Experience

A modern, responsive web application for Nandighosh Bus Service built with Next.js, TypeScript, and Tailwind CSS. This application provides a comprehensive bus booking platform with multilingual support, premium UI/UX, and advanced features.

## 🌟 Features

- **Modern Responsive Design**: Fully responsive design that works on all devices
- **Multilingual Support**: English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ) language options
- **Premium UI/UX**: Advanced animations, 3D effects, and modern design patterns
- **Route Management**: Display and manage bus routes with real-time information
- **Fleet Showcase**: Interactive carousel showcasing different bus types
- **Booking System**: User-friendly booking interface with multiple options
- **Contact Forms**: Integrated contact and inquiry forms
- **Real-time Features**: Live seat availability, weather updates, and time display
- **Mobile Optimized**: Fully optimized for mobile devices with PWA capabilities

## 🏗️ Project Structure

```
Bus service/
├── 📁 app/                          # Next.js App Router directory
│   ├── 📄 globals.css              # Global styles and animations
│   ├── 📄 imageImports.ts          # Image import configurations
│   ├── 📄 layout.tsx               # Root layout component
│   ├── 📄 page.tsx                 # Main landing page component
│   ├── 📁 assets/                  # Static assets used in components
│   │   ├── 🖼️ bus-fleet.jpg        # Fleet showcase image
│   │   ├── 🖼️ nandighosh-logo-updated.png
│   │   ├── 🖼️ nandighosh-logo.png
│   │   └── 🖼️ premium-bus.jpg
│   ├── 📁 debug-images/            # Debug and testing pages
│   │   └── 📄 page.tsx
│   └── 📁 test-images/             # Image testing pages
│       └── 📄 page.tsx
├── 📁 components/                   # Reusable React components
│   ├── 📄 theme-provider.tsx       # Theme context provider
│   └── 📁 ui/                      # UI component library (shadcn/ui)
│       ├── 📄 accordion.tsx
│       ├── 📄 alert-dialog.tsx
│       ├── 📄 alert.tsx
│       ├── 📄 avatar.tsx
│       ├── 📄 badge.tsx
│       ├── 📄 button.tsx
│       ├── 📄 card.tsx
│       ├── 📄 carousel.tsx
│       ├── 📄 input.tsx
│       ├── 📄 progress.tsx
│       ├── 📄 tabs.tsx
│       ├── 📄 textarea.tsx
│       └── ... (additional UI components)
├── 📁 hooks/                       # Custom React hooks
│   ├── 📄 use-mobile.tsx          # Mobile detection hook
│   └── 📄 use-toast.ts            # Toast notification hook
├── 📁 lib/                        # Utility libraries
│   └── 📄 utils.ts                # Utility functions
├── 📁 public/                     # Static public assets
│   ├── 📁 images/                 # Image assets
│   │   ├── 🖼️ bckgrond.png        # Background images
│   │   ├── 🖼️ bus-fleet.jpg       # Bus fleet images
│   │   ├── 🖼️ buses2.jpeg
│   │   ├── 🖼️ homepage.jpeg       # Homepage hero image
│   │   ├── 🖼️ interior.jpeg       # Bus interior images
│   │   ├── 🖼️ livery1.png         # Bus livery designs
│   │   ├── 🖼️ livery2.png
│   │   ├── 🖼️ nandighosh-logo-updated.png
│   │   ├── 🖼️ nandighosh-logo.png
│   │   ├── 🖼️ premium-bus.jpg
│   │   └── 🖼️ scenery.png
│   ├── 📄 site.webmanifest        # PWA manifest
│   └── 📄 test-images.html        # Image testing page
├── 📁 styles/                     # Additional stylesheets
│   └── 📄 globals.css             # Global CSS styles
├── 📄 components.json             # shadcn/ui configuration
├── 📄 next-env.d.ts              # Next.js TypeScript declarations
├── 📄 next.config.mjs            # Next.js configuration
├── 📄 package.json               # Project dependencies and scripts
├── 📄 pnpm-lock.yaml            # Package manager lock file
├── 📄 postcss.config.mjs        # PostCSS configuration
├── 📄 tailwind.config.ts        # Tailwind CSS configuration
└── 📄 tsconfig.json             # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm/yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Bus service"
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

### Build for Production

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Deploy (custom script)
pnpm run build && pnpm start
```

## 🎨 Design System

### Color Palette
- **Primary**: Orange (#ea580c) - Represents warmth and energy
- **Secondary**: Red (#dc2626) - Adds vibrancy and urgency
- **Accent**: Yellow (#f59e0b) - Highlights important elements
- **Background**: Gradient from orange to red tones
- **Text**: Various shades of gray for optimal readability

### Typography
- **Headings**: Bold, modern font weights
- **Body**: Clean, readable typography
- **Multilingual**: Optimized for English, Hindi, and Odia scripts

### Components
- **Cards**: 3D effects with hover animations
- **Buttons**: Gradient backgrounds with ripple effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Glass morphism design

## 🌐 Multilingual Support

The application supports three languages:

### English 🇬🇧
- Default language
- Complete translation coverage

### Hindi 🇮🇳 (हिंदी)
- Full Hindi translation
- Proper Devanagari script support

### Odia 🏛️ (ଓଡ଼ିଆ)
- Complete Odia translation
- Proper Odia script rendering

### Adding New Languages

1. Update the `languages` object in `app/page.tsx`
2. Add translation keys for all UI elements
3. Update the language selector in the navigation

## 🎯 Key Features Breakdown

### 1. Hero Section
- **Dynamic Background**: Animated particles and gradients
- **Logo Animation**: Floating and pulsing effects
- **Multilingual Content**: Dynamic text based on language selection
- **Statistics Cards**: Real-time data display
- **CTA Buttons**: Animated call-to-action buttons

### 2. Booking System
- **Route Search**: Interactive search with filters
- **Live Tracking**: GPS-based bus tracking
- **QR Code Scanning**: Modern booking methods
- **Seat Selection**: Visual seat map interface

### 3. Routes Section
- **Route Cards**: Detailed route information
- **Live Availability**: Real-time seat availability
- **Pricing Display**: Dynamic pricing with offers
- **Amenities Tags**: Visual amenity indicators

### 4. Fleet Showcase
- **Horizontal Carousel**: Smooth scrolling fleet display
- **Image Gallery**: High-quality bus images
- **Badge System**: Type indicators for different buses
- **Navigation Controls**: Previous/Next buttons

### 5. Features Section
- **Icon Grid**: Service feature highlights
- **3D Cards**: Interactive feature cards
- **Amenities Display**: Visual amenity showcase
- **Interior Gallery**: Bus interior images

### 6. Contact Section
- **Contact Form**: Multi-field inquiry form
- **Contact Information**: Multiple contact methods
- **App Download**: Mobile app promotion
- **Service Status**: Real-time service updates

## 🎨 Styling and Animations

### CSS Features
- **Custom Animations**: Floating, pulsing, and morphing effects
- **3D Effects**: Card transformations and hover states
- **Glass Morphism**: Modern frosted glass effects
- **Gradient Backgrounds**: Dynamic color transitions
- **Responsive Design**: Mobile-first approach

### Animation Classes
```css
.animate-float         /* Floating animation */
.animate-pulse-glow    /* Pulsing glow effect */
.card-3d              /* 3D card transformation */
.tilt-card            /* Subtle tilt on hover */
.magnetic             /* Magnetic hover effect */
.breathe              /* Breathing animation */
.ripple               /* Button ripple effect */
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

### Mobile Features
- **Touch Optimized**: Large touch targets
- **Swipe Navigation**: Touch-friendly carousels
- **Collapsible Menu**: Mobile navigation drawer
- **Optimized Images**: Responsive image loading

## 🔧 Configuration Files

### Next.js Configuration (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
}
```

### Tailwind Configuration (`tailwind.config.ts`)
- Custom color palette
- Extended animations
- Component utilities
- Responsive variants

### TypeScript Configuration (`tsconfig.json`)
- Strict type checking
- Modern ES features
- Path mapping for imports

## 🚀 Deployment

### Build Process
1. **Static Generation**: Pre-rendered at build time
2. **Image Optimization**: Automatic image optimization
3. **Code Splitting**: Automatic code splitting for better performance
4. **SEO Optimization**: Meta tags and structured data

### Deployment Options
- **Vercel**: Recommended (Next.js optimized)
- **Netlify**: Static site hosting
- **AWS**: Scalable cloud deployment
- **Traditional Hosting**: Any Node.js hosting

### Environment Variables
Create a `.env.local` file for local development:
```bash
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

## 🧪 Testing and Development

### Debug Features
- **Image Testing**: `/debug-images` and `/test-images` pages
- **Component Testing**: Individual component testing
- **Responsive Testing**: Built-in responsive design testing

### Development Tools
- **TypeScript**: Type safety and better development experience
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Hot Reload**: Instant development feedback

## 📈 Performance Optimization

### Image Optimization
- **Next.js Image Component**: Automatic optimization
- **WebP Format**: Modern image formats
- **Lazy Loading**: Progressive image loading
- **Responsive Images**: Multiple sizes for different devices

### Code Optimization
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Automatic bundle splitting
- **Minification**: Production code minification
- **Compression**: Gzip/Brotli compression

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Code Style
- Follow TypeScript best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Maintain consistent formatting

## 📞 Support and Contact

For questions, issues, or support:

- **Email**: info@nandighoshbus.com
- **Phone**: +91 98765 43210
- **WhatsApp**: +91 98765 43210

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Shadcn/ui**: For the beautiful UI components
- **Lucide React**: For the comprehensive icon library
- **Vercel**: For hosting and deployment platform

---

**Built with ❤️ for Nandighosh Bus Service - Connecting Communities, Creating Memories**

## 🔒 Anti-Copy Protection & Security Features

This application includes advanced anti-copy protection mechanisms and watermarking systems:

### 🛡️ Protection Layers
- **Code Obfuscation**: Critical functions are obfuscated
- **Fingerprint Detection**: Unique device and browser fingerprinting
- **Hidden Watermarks**: Invisible watermarks embedded throughout the UI
- **License Validation**: Runtime license checking
- **Copy Detection**: Automatic detection of unauthorized usage

### ⚠️ Legal Notice
**UNAUTHORIZED COPYING, DISTRIBUTION, OR MODIFICATION OF THIS SOFTWARE IS STRICTLY PROHIBITED**

This software is protected by:
- **Copyright Law**: © 2025 Nandighosh Bus Service
- **Digital Watermarks**: Embedded throughout the codebase
- **Tracking Systems**: Usage monitoring and unauthorized access detection
- **Legal Protection**: Full legal action will be taken against violators

### 🔍 Watermark System
The application contains multiple invisible watermarks:
- **Code-level watermarks**: Embedded in JavaScript bundles
- **UI watermarks**: Hidden in CSS and DOM elements
- **Image watermarks**: Steganographic marks in all images
- **Metadata tracking**: Unique identifiers in all files

### 📋 Terms of Use
1. This software is licensed exclusively for Nandighosh Bus Service
2. Any unauthorized copying will result in immediate legal action
3. All usage is monitored and logged
4. Violators will be prosecuted to the full extent of the law

**WARNING: Attempting to copy, reverse engineer, or distribute this software without permission will result in severe legal consequences including but not limited to monetary damages, injunctive relief, and criminal prosecution.**
