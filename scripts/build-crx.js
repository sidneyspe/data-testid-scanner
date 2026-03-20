const fs = require('fs');
const path = require('path');
const ChromeExtension = require('crx');

const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf8'));
const version = manifest.version;
const extName = 'data-test-id-scanner';
const pemFile = '../extension_private_key.pem';
const crxFile = path.resolve(__dirname, '..', `${extName}-v${version}.crx`);

console.log('📦 Building CRX for', manifest.name, `v${version}`);

// Check for private key
if (!fs.existsSync(pemFile)) {
  console.error('❌ Private key not found:', pemFile);
  console.log('💡 The extension_private_key.pem file is required to build CRX');
  process.exit(1);
}

const crx = new ChromeExtension({
  privateKey: fs.readFileSync(pemFile),
});

crx
  .load(path.resolve(__dirname, '..', 'dist'))
  .then((crx) => crx.pack())
  .then((crxBuffer) => {
    fs.writeFileSync(crxFile, crxBuffer);
    console.log('✅ CRX created:', crxFile);
    console.log('📊 File size:', (crxBuffer.length / 1024).toFixed(2), 'KB');
    console.log('\n💡 To install:');
    console.log('   Chrome: Drag', crxFile, 'to chrome://extensions/');
    console.log('   Edge: Drag', crxFile, 'to edge://extensions/');
  })
  .catch((err) => {
    console.error('❌ Error building CRX:', err.message);
    process.exit(1);
  });
