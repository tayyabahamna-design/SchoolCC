# Google Play Store Submission Checklist

Use this checklist to track your progress toward publishing TaleemHub on the Google Play Store.

## Pre-Submission Setup

### Google Account Setup
- [ ] Create Google Play Developer account
- [ ] Pay $25 registration fee
- [ ] Verify email and identity
- [ ] Accept developer agreement

### App Testing
- [ ] Test app on Android device/emulator
- [ ] Test all major features:
  - [ ] User login/authentication
  - [ ] Data requests
  - [ ] File uploads
  - [ ] School visits
  - [ ] Voice recording
  - [ ] Reports/exports
- [ ] Test offline behavior
- [ ] Test on different screen sizes
- [ ] Test on Android 8+ (different versions)

### Required Assets

#### App Icons & Screenshots
- [ ] App icon (✅ already generated)
- [ ] At least 2 phone screenshots (1080 x 1920 px)
- [ ] Optional: Tablet screenshots
- [ ] Feature graphic (1024 x 500 px) - REQUIRED
- [ ] Optional: Promo video

#### Store Listing Text
- [ ] App title (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] What's new (release notes)

#### Legal & Policy
- [ ] Privacy Policy URL (REQUIRED)
  - Must be hosted on accessible URL
  - Must explain data collection/usage
  - Can use generator: https://www.privacypolicygenerator.info/
- [ ] App content rating (fill out questionnaire)
- [ ] Target audience and content declarations

### Technical Preparation

#### Release Build
- [ ] Generate release keystore:
  ```bash
  cd android/app
  keytool -genkey -v -keystore taleemhub-release.keystore \
    -alias taleemhub -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Create `android/gradle.properties` with signing config
- [ ] Backup keystore file securely (CRITICAL!)
- [ ] Build release AAB:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
- [ ] Verify AAB file exists: `android/app/build/outputs/bundle/release/app-release.aab`

#### App Configuration
- [ ] Verify app name in `android/app/src/main/res/values/strings.xml`
- [ ] Verify version code/name in `android/app/build.gradle`
- [ ] Verify package ID: com.taleemabad.taleemhub
- [ ] Test backend connection from mobile app

## Play Console Setup

### App Creation
- [ ] Log in to Play Console: https://play.google.com/console
- [ ] Click "Create app"
- [ ] Fill in:
  - [ ] App name
  - [ ] Default language
  - [ ] App or game: App
  - [ ] Free or paid: Free (recommended)
- [ ] Declare if app is for children
- [ ] Accept declarations

### Store Listing
- [ ] Upload app icon (512 x 512 px)
- [ ] Upload feature graphic (1024 x 500 px)
- [ ] Upload phone screenshots (minimum 2)
- [ ] Add app title
- [ ] Add short description
- [ ] Add full description
- [ ] Add contact email
- [ ] Add privacy policy URL
- [ ] Select app category: Education
- [ ] Add tags (optional)
- [ ] Click "Save"

### Content Rating
- [ ] Start questionnaire
- [ ] Select app category
- [ ] Answer all questions honestly
- [ ] Submit for rating
- [ ] Wait for rating certificate
- [ ] Apply rating

### Pricing & Distribution
- [ ] Set price (Free recommended)
- [ ] Select countries (all or specific)
- [ ] Set content rating
- [ ] Confirm app follows content policies
- [ ] Accept export laws
- [ ] Accept US export laws (if applicable)
- [ ] Click "Save"

### App Content
- [ ] Privacy policy
- [ ] Ads declaration (Does your app contain ads?)
- [ ] Target audience
- [ ] News app declaration
- [ ] COVID-19 contact tracing/status apps
- [ ] Data safety section:
  - [ ] Declare what data you collect
  - [ ] Explain how data is used
  - [ ] Explain data sharing practices

### Release Setup
- [ ] Go to "Production" in left menu
- [ ] Click "Create new release"
- [ ] Upload AAB file (`app-release.aab`)
- [ ] Add release name (e.g., "Initial release")
- [ ] Add release notes (what's new)
- [ ] Click "Save"

## Pre-Launch Report
- [ ] Wait for automated testing (optional, ~1 hour)
- [ ] Review any issues found
- [ ] Fix critical issues if any

## Final Submission
- [ ] Review all sections (check for warnings)
- [ ] Ensure all required fields are complete
- [ ] Review "Why can't I publish?" if button is disabled
- [ ] Click "Send for review"
- [ ] Confirm submission

## Post-Submission

### Monitoring
- [ ] Wait for review (typically 1-7 days)
- [ ] Check email for updates
- [ ] Respond to any review feedback
- [ ] Monitor Play Console dashboard

### After Approval
- [ ] Celebrate! 🎉
- [ ] Share Play Store link
- [ ] Monitor crashes and ANRs
- [ ] Respond to user reviews
- [ ] Plan first update

## Common Rejection Reasons (Avoid These!)

- ❌ Missing privacy policy
- ❌ Privacy policy not accessible
- ❌ App crashes on launch
- ❌ Broken features
- ❌ Misleading description/screenshots
- ❌ Missing content rating
- ❌ Inappropriate content
- ❌ Security vulnerabilities
- ❌ Incomplete store listing

## Important Reminders

### Backend Server
⚠️ Your app requires backend: `https://taleemhub-rawalpindi.replit.app`
- Ensure it's always accessible
- Consider upgrading Replit for 24/7 uptime
- OR migrate to production hosting before launch

### Version Management
- First release: Version 1.0 (Code: 1)
- Updates must have higher version code
- Update `android/app/build.gradle` for each release

### Keystore Security
🔒 **CRITICAL:**
- Backup keystore file multiple locations
- Never share keystore publicly
- If lost, you CANNOT update your app!

### Testing Checklist Before Submission
- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Login works
- [ ] All permissions work correctly
- [ ] Network calls succeed
- [ ] File uploads work
- [ ] App handles no internet gracefully
- [ ] Back button works properly
- [ ] App respects Android system UI

## Estimated Timeline

- Account creation: Instant
- Asset preparation: 2-4 hours
- Building AAB: 10 minutes
- Console setup: 1-2 hours
- Review process: 1-7 days
- **Total:** 2-7 days from start to published

## Helpful Resources

- Play Console: https://play.google.com/console
- Content Policy: https://play.google.com/about/developer-content-policy/
- Privacy Policy Generator: https://www.privacypolicygenerator.info/
- Android Developer: https://developer.android.com/distribute

## Need Help?

1. Check PLAYSTORE_DEPLOYMENT.md for detailed steps
2. Review Play Console help documentation
3. Check Android Developer documentation
4. Review rejection reasons if declined

---

**Current Progress:** Setup complete, ready for testing
**Next Step:** Test app thoroughly, then prepare assets

Good luck with your Play Store submission! 🚀
