const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const url = 'https://amaravenkatatanishq27.github.io/campus-navigator/';
const publicDir = path.join(__dirname, '..', 'public');

async function generate() {
  const pngPath = path.join(publicDir, 'hurry-msrit-qr.png');
  const svgPath = path.join(publicDir, 'hurry-msrit-qr.svg');

  await QRCode.toFile(pngPath, url, {
    width: 800,
    margin: 2,
    color: {
      dark: '#050811',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });

  await QRCode.toFile(svgPath, url, {
    width: 800,
    margin: 2,
    color: {
      dark: '#050811',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });

  console.log('Successfully generated QR codes at:', pngPath, svgPath);
}

generate().catch(console.error);
