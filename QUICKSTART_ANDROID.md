# Quick Start: Testing Your Android App

## Test Your App Now (5 minutes)

### Option 1: Open in Android Studio (Recommended)

```bash
npm run cap:open:android
```

This will open Android Studio. Then:
1. Wait for Gradle sync to complete (status bar at bottom)
2. Click the green "Run" ▶️ button
3. Select a device (emulator or connected phone)
4. Your app will install and launch!

### Option 2: Build APK for Testing

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

Transfer this file to your Android phone and install it.

## Making Changes

After updating your web app code:

```bash
npm run cap:sync
```

Then run the app again in Android Studio.

## Common Issues

**"Command not found: cap"**
- Solution: Use `npx cap` instead, or the npm scripts

**Gradle build fails**
- Solution: Open Android Studio, let it download dependencies

**App crashes on launch**
- Solution: Check if your backend server is running
- Check Android Studio Logcat for errors

## Next: Deploy to Play Store

See [PLAYSTORE_DEPLOYMENT.md](PLAYSTORE_DEPLOYMENT.md) for complete instructions.
