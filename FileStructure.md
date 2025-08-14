# Nandighosh Bus Service - File Structure

## Root Directory
```
Bus service/
├── .env.local
├── .git/
├── .gitignore
├── .next/
├── .vscode/
├── components.json
├── FileStructure.md
├── MULTI_USER_AUTH_GUIDE.md
├── next-env.d.ts
├── next.config.mjs
├── node_modules/
├── package-lock.json
├── package.json
├── PHONE_NUMBER_FIX.md
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── SETUP.md
├── tailwind.config.ts
├── tsconfig.json
├── app/
├── backend/
├── components/
├── hooks/
├── lib/
├── public/
├── scripts/
└── styles/
```

## App Directory (Next.js App Router)
```
app/
├── about/
│   └── page.tsx
├── admin/
│   └── signup/
├── agent/
│   ├── login/
│   ├── register/
│   └── signup/
├── assets/
│   ├── bus-fleet.jpg
│   ├── nandighosh-logo-updated.png
│   ├── nandighosh-logo.png
│   └── premium-bus.jpg
├── booking/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── features/
│   └── page.tsx
├── offers/
│   └── page.tsx
├── routes/
│   └── page.tsx
├── signin/
│   └── page.tsx
├── theme/
│   └── page.tsx
├── error.tsx
├── global-error.tsx
├── globals.css
├── imageImports.ts
├── layout.tsx
├── loading.tsx
├── not-found.tsx
└── page.tsx
```

## Components Directory
```
components/
├── context/
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── layout/
│   ├── ClientLayout.tsx
│   ├── ClientRootLayout.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── SimpleNavbar.tsx
├── pages/
│   ├── AboutPage.tsx
│   ├── AdminSignUpPage.tsx
│   ├── AgentLoginPage.tsx
│   ├── AgentRegisterPage.tsx
│   ├── AgentSignUpPage.tsx
│   ├── BookingPage.tsx
│   ├── ContactPage.tsx
│   ├── FeaturesPage.tsx
│   ├── HomePage.tsx
│   ├── OffersPage.tsx
│   ├── RoutesPage.tsx
│   ├── SignInPage.tsx
│   └── ThemePage.tsx
├── ui/
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── aspect-ratio.tsx
│   ├── avatar.tsx
│   ├── BackgroundParticles.tsx
│   ├── badge.tsx
│   ├── breadcrumb.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── carousel.tsx
│   ├── chart.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── command.tsx
│   ├── context-menu.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── hover-card.tsx
│   ├── input-otp.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── menubar.tsx
│   ├── navigation-menu.tsx
│   ├── pagination.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── resizable.tsx
│   ├── RouteMap.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── sonner.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── toggle-group.tsx
│   ├── toggle.tsx
│   ├── tooltip.tsx
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── theme-provider.tsx
```

## Backend Directory
```
backend/
├── database/
│   ├── fix-user-profiles.sql
│   ├── multi-user-auth-schema.sql
│   ├── sample-data.sql
│   └── schema.sql
├── dist/
├── node_modules/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── nodemon.json
├── package-lock.json
├── package.json
├── README.md
├── setup.bat
├── setup.sh
└── tsconfig.json
```

## Public Directory
```
public/
├── images/
├── test-images/
├── vdo/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── placeholder-logo.png
├── placeholder-logo.svg
├── placeholder-user.jpg
├── placeholder.jpg
├── placeholder.svg
├── site.webmanifest
└── test-images.html
```

## Other Directories
```
hooks/
├── use-mobile.tsx
└── use-toast.ts

lib/
├── supabase.ts
├── theme.ts
└── utils.ts

scripts/
└── validate-protection.js

styles/
└── globals.css
```

## Key Files Description

### Configuration Files
- **package.json** - Project dependencies and scripts
- **next.config.mjs** - Next.js configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration
- **components.json** - UI components configuration

### Environment Files
- **.env.local** - Local environment variables (frontend)
- **backend/.env** - Backend environment variables

### Documentation Files
- **README.md** - Project documentation
- **SETUP.md** - Setup instructions
- **MULTI_USER_AUTH_GUIDE.md** - Authentication guide
- **PHONE_NUMBER_FIX.md** - Phone number fix documentation
- **FileStructure.md** - This file structure documentation

### Main Application Files
- **app/layout.tsx** - Root layout component
- **app/page.tsx** - Home page component
- **app/globals.css** - Global styles
- **backend/src/server.ts** - Backend server entry point

This structure represents a full-stack Next.js application with a separate backend API, comprehensive UI components, and proper organization for a bus service booking system.