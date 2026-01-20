# TaleemHub Logo Integration Guide

## 📋 Overview
This guide will help you replace the current logo with the new official TaleemHub logo across all platforms (Web, PWA, and Android).

## 🎯 Integration Checklist

### ✅ Step 1: Prepare the Logo File

**Action Required:**
1. Save your TaleemHub logo image to: `client/public/taleemhub-logo.png`
2. Ensure the image is high quality (minimum 1024x1024 recommended)
3. Format: PNG with transparent background preferred

**Quick Upload:**
```bash
# If you have the image file, copy it to the public folder:
cp /path/to/your/logo.png client/public/taleemhub-logo.png
```

### ✅ Step 2: Generate All Required Sizes

Once you place the logo in `client/public/taleemhub-logo.png`, run:

```bash
# Generate all icon sizes for PWA and Android
npm run generate:icons
```

This will create:
- `client/public/pwa-192x192.png` (PWA home screen icon)
- `client/public/pwa-512x512.png` (PWA splash screen)
- `client/public/favicon.png` (Browser tab icon)
- `resources/icon.png` (Source for Android icons)
- All Android icon sizes in `android/app/src/main/res/mipmap-*/`

### ✅ Step 3: Logo Usage in App

The logo currently appears in these locations:

#### 1. **Login Page** (2 instances)
- **Desktop view:** Left panel (large logo - 128x128px container)
- **Mobile view:** Top of card (80x80px)
- File: `client/src/pages/Login.tsx`
- Lines: 68, 117

#### 2. **Navigation/Headers** (Check these files)
Files to review:
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/DEODashboard.tsx`
- `client/src/pages/CEODashboard.tsx`
- `client/src/pages/AEOActivityHub.tsx`
- `client/src/contexts/auth.tsx`

#### 3. **PWA Manifest**
- App name: "TaleemHub - Education Command Center"
- Icons automatically updated when you run generate:icons
- File: `dist/public/manifest.webmanifest`

#### 4. **Android App**
- App launcher icon
- Splash screen
- Navigation drawer (if applicable)

## 🔧 Implementation Steps

### Method 1: Automated (Recommended)

**Once you upload the logo to `client/public/taleemhub-logo.png`:**

```bash
# 1. Generate all sizes
node scripts/generate-all-logos.mjs

# 2. Update Android icons
npx capacitor-assets generate --android

# 3. Rebuild the app
npm run build

# 4. Sync to Android
npx cap sync android
```

### Method 2: Manual Upload

**Where to place your logo:**

1. **Main logo (SVG or PNG):**
   ```
   client/public/taleemhub-logo.png  (or .svg)
   ```

2. **PWA Icons:**
   ```
   client/public/pwa-192x192.png
   client/public/pwa-512x512.png
   ```

3. **Favicon:**
   ```
   client/public/favicon.png
   ```

4. **Android source:**
   ```
   resources/icon.png (1024x1024)
   resources/splash.png (2732x2732)
   ```

## 📱 Platform-Specific Requirements

### Web App
- **Format:** PNG or SVG
- **Sizes:**
  - Desktop header: 128x128px
  - Mobile header: 80x80px
  - Favicon: 32x32px, 16x16px

### PWA (Progressive Web App)
- **192x192px:** Home screen icon (Android/Desktop)
- **512x512px:** Splash screen / Install prompt
- **Format:** PNG with transparent or white background

### Android App
- **Launcher Icon Sizes:**
  - ldpi: 36x36px
  - mdpi: 48x48px
  - hdpi: 72x72px
  - xhdpi: 96x96px
  - xxhdpi: 144x144px
  - xxxhdpi: 192x192px
- **Adaptive Icons:** Foreground + Background layers
- **Format:** PNG

## 🎨 Design Guidelines

### Logo Specifications
1. **Background:** The current logo has a circular frame with white/light background
2. **Colors:**
   - Primary: Green (#52B788 or similar)
   - Secondary: Navy blue (#0A2463 or similar)
   - Accent: Gold/Orange
3. **Safe Area:** Keep 10% padding around edges for icon crops

### Color Integration
- **App Theme Colors:**
  - Primary: `#0ea5e9` (Sky Blue)
  - Background: `#ffffff` (White)
  - Dark mode: `#0a0a0a` (Black)

**Recommendation:** The logo's background can be made transparent or matched to app theme colors

### Image Quality Checklist
- [ ] High resolution (minimum 1024x1024)
- [ ] Clear and legible at small sizes (48x48)
- [ ] Works on both light and dark backgrounds
- [ ] Transparent background or app-color background
- [ ] Square aspect ratio (1:1) or can be cropped to square

## 🔍 Current Logo Instances

### In Code (Need Update)
1. **Login.tsx** (Line 68): Desktop logo
   ```tsx
   <img src="/taleemhub-logo.svg" alt="TaleemHub Logo" className="w-full h-full" />
   ```

2. **Login.tsx** (Line 117): Mobile logo
   ```tsx
   <img src="/taleemhub-logo.svg" alt="TaleemHub Logo" className="w-20 h-20 mb-3" />
   ```

### Action Items
- [ ] Check if other components use logo
- [ ] Update all references from `/taleemhub-logo.svg` to `/taleemhub-logo.png`
- [ ] Verify logo displays correctly on all screen sizes
- [ ] Test on actual devices (mobile, tablet, desktop)

## 📸 Visual Testing Checklist

After integration, test these views:

### Authentication Screens
- [ ] Login page (desktop - large logo)
- [ ] Login page (mobile - small logo)
- [ ] Signup page (if logo present)

### Dashboard Views
- [ ] CEO Dashboard
- [ ] DEO Dashboard
- [ ] DDEO Dashboard
- [ ] AEO Dashboard
- [ ] Teacher Dashboard
- [ ] Head Teacher Dashboard

### PWA Installation
- [ ] Install prompt shows correct icon
- [ ] Home screen icon (Android)
- [ ] Home screen icon (iOS)
- [ ] Home screen icon (Desktop)
- [ ] Splash screen shows logo

### Android App
- [ ] App launcher icon
- [ ] Navigation drawer icon (if any)
- [ ] Splash screen
- [ ] About screen (if any)

### Browser
- [ ] Favicon in browser tab
- [ ] Bookmark icon
- [ ] History icon

## 🚀 Quick Start (After Logo Upload)

**I'm ready to help! Once you upload the logo:**

1. **Tell me:** "I've uploaded the logo to [path]"
2. **I'll:** Generate all sizes and update all references
3. **You'll:** Review the changes
4. **We'll:** Deploy to production

**Estimated Time:** 5-10 minutes for complete integration

## 📞 Need Help?

If you encounter any issues:
1. Check the logo file path
2. Verify file format (PNG recommended)
3. Ensure file size is reasonable (<5MB)
4. Run `npm run build` after changes
5. Clear browser cache to see updates

---

**Status:** ⏳ Awaiting logo file upload to begin integration

**Next Step:** Please upload the TaleemHub logo image, and I'll handle the rest!
