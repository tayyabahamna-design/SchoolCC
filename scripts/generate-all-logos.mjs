import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Source logo - user should place their logo here
const sourceLogoPath = join(projectRoot, 'client/public/taleemhub-logo.png');

// Check if source logo exists
if (!existsSync(sourceLogoPath)) {
  console.error('❌ Logo not found!');
  console.error(`Please upload your logo to: ${sourceLogoPath}`);
  console.error('\nThe logo should be:');
  console.error('- High resolution (minimum 1024x1024)');
  console.error('- PNG format');
  console.error('- Transparent or white background');
  process.exit(1);
}

// Output directories
const publicDir = join(projectRoot, 'client/public');
const resourcesDir = join(projectRoot, 'resources');

// Ensure directories exist
[publicDir, resourcesDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Icon specifications
const icons = [
  // PWA icons
  { size: 192, output: join(publicDir, 'pwa-192x192.png'), name: 'PWA 192x192' },
  { size: 512, output: join(publicDir, 'pwa-512x512.png'), name: 'PWA 512x512' },

  // Favicon
  { size: 32, output: join(publicDir, 'favicon.png'), name: 'Favicon 32x32' },
  { size: 16, output: join(publicDir, 'favicon-16x16.png'), name: 'Favicon 16x16' },

  // Resources for Capacitor
  { size: 1024, output: join(resourcesDir, 'icon.png'), name: 'Android Source Icon' },
  { size: 2732, output: join(resourcesDir, 'splash.png'), name: 'Android Splash Source' },
];

async function generateIcon(sourceFile, size, outputPath, name, background = null) {
  try {
    let pipeline = sharp(sourceFile).resize(size, size, {
      fit: 'contain',
      background: background || { r: 255, g: 255, b: 255, alpha: 0 }
    });

    await pipeline.png().toFile(outputPath);

    console.log(`✓ Generated ${name}: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to generate ${name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎨 TaleemHub Logo Generator');
  console.log('═'.repeat(50));
  console.log(`Source: ${sourceLogoPath}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const icon of icons) {
    const success = await generateIcon(
      sourceLogoPath,
      icon.size,
      icon.output,
      icon.name
    );

    if (success) successCount++;
    else failCount++;
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✓ Success: ${successCount} icons generated`);
  if (failCount > 0) {
    console.log(`✗ Failed: ${failCount} icons`);
  }

  if (successCount > 0) {
    console.log('\n📱 Next Steps:');
    console.log('1. Generate Android icons:');
    console.log('   npx capacitor-assets generate --android');
    console.log('\n2. Rebuild the app:');
    console.log('   npm run build');
    console.log('\n3. Sync to Android:');
    console.log('   npx cap sync android');
    console.log('\n4. Test the logo on all screens!');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
