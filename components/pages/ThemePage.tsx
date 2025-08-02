"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { THEME_CLASSES, nandighoshTheme } from "@/lib/theme"
import { Palette, Brush, Eye, Settings } from "lucide-react"

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Nandighosh Theme System
          </h1>
          <p className="text-white/80 text-lg">
            Consistent branding and design system for Nandighosh Travels
          </p>
        </div>

        {/* Color Palette Section */}
        <section className="mb-12">
          <Card className={THEME_CLASSES.CARD_GLASS + " mb-8"}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Palette
              </CardTitle>
              <CardDescription className="text-white/80">
                Primary brand colors used throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primary Gradient */}
                <div className="text-center">
                  <div className="w-full h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-2"></div>
                  <p className="text-white text-sm font-medium">Primary</p>
                  <p className="text-white/60 text-xs">Blue to Purple</p>
                </div>

                {/* Accent Gradient */}
                <div className="text-center">
                  <div className="w-full h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg mb-2"></div>
                  <p className="text-white text-sm font-medium">Accent</p>
                  <p className="text-white/60 text-xs">Orange to Yellow</p>
                </div>

                {/* Glass Effect */}
                <div className="text-center">
                  <div className="w-full h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg mb-2"></div>
                  <p className="text-white text-sm font-medium">Glass</p>
                  <p className="text-white/60 text-xs">Translucent</p>
                </div>

                {/* Gold */}
                <div className="text-center">
                  <div className="w-full h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mb-2"></div>
                  <p className="text-white text-sm font-medium">Gold</p>
                  <p className="text-white/60 text-xs">Premium Accent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Button Variants */}
        <section className="mb-12">
          <Card className={THEME_CLASSES.CARD_GLASS + " mb-8"}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brush className="w-5 h-5" />
                Button Variants
              </CardTitle>
              <CardDescription className="text-white/80">
                Different button styles for various use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Button className={THEME_CLASSES.BUTTON_PRIMARY + " w-full mb-2"}>
                    Primary Button
                  </Button>
                  <p className="text-white/60 text-sm">Main actions</p>
                </div>

                <div className="text-center">
                  <Button className={THEME_CLASSES.BUTTON_SECONDARY + " w-full mb-2"}>
                    Secondary Button
                  </Button>
                  <p className="text-white/60 text-sm">Secondary actions</p>
                </div>

                <div className="text-center">
                  <Button className={THEME_CLASSES.BUTTON_ACCENT + " w-full mb-2"}>
                    Accent Button
                  </Button>
                  <p className="text-white/60 text-sm">Special actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Fields */}
        <section className="mb-12">
          <Card className={THEME_CLASSES.CARD_GLASS + " mb-8"}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Input Components
              </CardTitle>
              <CardDescription className="text-white/80">
                Form input styling with glass morphism effect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Glass Input
                  </label>
                  <Input
                    placeholder="Enter your email"
                    className={THEME_CLASSES.INPUT_GLASS}
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    With Icon
                  </label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                    <Input
                      placeholder="Password"
                      type="password"
                      className={THEME_CLASSES.INPUT_GLASS + " pl-10"}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Variants */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={THEME_CLASSES.CARD_GLASS}>
              <CardHeader>
                <CardTitle className="text-white">Glass Card</CardTitle>
                <CardDescription className="text-white/80">
                  Translucent card with backdrop blur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Perfect for overlays and modal dialogs with a modern glass morphism effect.
                </p>
              </CardContent>
            </Card>

            <Card className={THEME_CLASSES.CARD_SOLID + " bg-white text-gray-900"}>
              <CardHeader>
                <CardTitle>Solid Card</CardTitle>
                <CardDescription>
                  Traditional solid card design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Clean and professional look for main content areas and information display.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <Card className={THEME_CLASSES.CARD_GLASS}>
            <CardHeader>
              <CardTitle className="text-white">Usage Guidelines</CardTitle>
              <CardDescription className="text-white/80">
                How to implement the Nandighosh theme in your components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-white/90">
                <div>
                  <h4 className="font-semibold text-white mb-2">Import the theme:</h4>
                  <code className="bg-black/30 p-2 rounded text-sm block">
                    import &#123; THEME_CLASSES &#125; from "@/lib/theme"
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Use predefined classes:</h4>
                  <code className="bg-black/30 p-2 rounded text-sm block">
                    &lt;Button className=&#123;THEME_CLASSES.BUTTON_PRIMARY&#125;&gt;
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Color Usage:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Primary:</strong> Main CTAs, navigation active states</li>
                    <li><strong>Accent:</strong> Special offers, highlights, success states</li>
                    <li><strong>Glass:</strong> Overlays, modals, secondary content</li>
                    <li><strong>Gold:</strong> Premium features, achievements, special events</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
