const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(assetsDir, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function main() {
  const sizes = [16, 24, 32, 48, 64, 96, 128, 256];
  
  // Generate PNGs for each size
  for (const size of sizes) {
    const pngPath = path.join(assetsDir, `icon_${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✅ ${pngPath} (${size}x${size})`);
  }
  
  // ICO: Use the largest PNG as source; sharp doesn't write ICO natively,
  // but we can use png-to-ico if needed. For now generate 256x256 PNG as main icon.
  // electron-builder actually prefers PNG, so copy icon_256x256 as icon.png
  fs.copyFileSync(
    path.join(assetsDir, 'icon_256x256.png'),
    path.join(assetsDir, 'icon.png')
  );
  console.log(`✅ ${path.join(assetsDir, 'icon.png')} (electron-builder source)`);
  
  // Also create a logo (larger)
  const logoPath = path.join(assetsDir, 'logo.png');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(logoPath);
  console.log(`✅ ${logoPath} (512x512)`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
