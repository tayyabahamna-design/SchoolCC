# TaleemHub - Android App

Your TaleemHub web application has been converted to a native Android app using Capacitor.

## 📱 Quick Start

### Test Your App (5 minutes)

```bash
# Open in Android Studio
npm run cap:open:android
```

Then click the green Run button ▶️

### Make Changes

After updating your web app:

```bash
# Build and sync changes
npm run cap:sync
```

## 📚 Documentation

- **[QUICKSTART_ANDROID.md](QUICKSTART_ANDROID.md)** - Get started in 5 minutes
- **[PLAYSTORE_DEPLOYMENT.md](PLAYSTORE_DEPLOYMENT.md)** - Complete deployment guide
- **[PLAYSTORE_CHECKLIST.md](PLAYSTORE_CHECKLIST.md)** - Step-by-step checklist
- **[ANDROID_SETUP_SUMMARY.md](ANDROID_SETUP_SUMMARY.md)** - What was set up

## 🎯 App Details

- **Name:** TaleemHub
- **Package:** com.taleemabad.taleemhub
- **Version:** 1.0
- **Backend:** https://taleemhub-rawalpindi.replit.app

## 🛠️ Available Commands

```bash
# Development
npm run cap:sync              # Build web + sync to Android
npm run cap:open:android      # Open in Android Studio
npm run cap:run:android       # Build, sync, and run on device

# Update icons/splash screens
npx capacitor-assets generate --android

# Release build
cd android
./gradlew bundleRelease       # For Play Store (AAB)
./gradlew assembleRelease     # For testing (APK)
```

## 📦 Project Structure

```
android/                    # Native Android project
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── res/            # Icons & splash screens
│   │   └── assets/         # Web app files
│   └── build.gradle        # Build configuration
resources/                  # Icon/splash source files
client/src/lib/
├── config.ts              # API base URL config
└── api.ts                 # API helpers
capacitor.config.ts        # Capacitor configuration
```

## 🎨 Updating Icons

1. Replace `resources/icon.png` (1024x1024 px recommended)
2. Replace `resources/splash.png` (2732x2732 px recommended)
3. Run: `npx capacitor-assets generate --android`
4. Run: `npm run cap:sync`

## 🔒 Important Security Notes

- Keep your keystore file safe (required for Play Store)
- Never commit keystore files to git
- Never commit `gradle.properties` with passwords
- Backup keystore - if lost, you can't update your app!

## ⚠️ Backend Server

Your app connects to: `https://taleemhub-rawalpindi.replit.app`

**Important:**
- Ensure this server is always running
- Consider Replit upgrade for 24/7 availability
- OR migrate to production hosting before Play Store launch

## 🐛 Troubleshooting

### Build fails
```bash
cd android
./gradlew clean
```

### Can't connect to backend
1. Check if server is running
2. Check `client/src/lib/config.ts`
3. Verify CORS settings on backend

### App crashes
- Check Android Studio Logcat
- Verify backend accessibility
- Test permissions

## 🚀 Releasing to Play Store

1. Follow **[PLAYSTORE_CHECKLIST.md](PLAYSTORE_CHECKLIST.md)**
2. Create release keystore
3. Build AAB file
4. Submit to Play Console
5. Wait for approval (1-7 days)

## 📱 Testing Requirements

Before submitting to Play Store:
- ✅ Test on real Android device
- ✅ Test all app features
- ✅ Test offline behavior
- ✅ Test on different screen sizes
- ✅ Create privacy policy
- ✅ Prepare screenshots (minimum 2)
- ✅ Create feature graphic (1024x500 px)

## 📞 Support

- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer: https://developer.android.com
- Play Console: https://play.google.com/console

## 🎉 Next Steps

1. Test the app in Android Studio
2. Review [PLAYSTORE_DEPLOYMENT.md](PLAYSTORE_DEPLOYMENT.md)
3. Prepare assets for Play Store
4. Create Google Play Developer account
5. Submit your app!

---

**Status:** ✅ Ready for testing and deployment

**Questions?** Check the documentation files in this directory.
