const fs = require('fs');
const AdmZip = require('adm-zip');

const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf8'));
const version = manifest.version;
const extName = 'data-test-id-scanner';
const zipFile = `../${extName}-v${version}.zip`;

console.log('📦 Building ZIP for', manifest.name, `v${version}`);

const zip = new AdmZip();
zip.addLocalFolder('dist');
zip.writeZip(zipFile);

console.log('✅ ZIP created:', zipFile);
console.log(
  '📊 File size:',
  (fs.statSync(zipFile).size / 1024).toFixed(2),
  'KB',
);
console.log('\n💡 To install:');
console.log('   1. Unzip the file');
console.log('   2. Open chrome://extensions/');
console.log('   3. Enable "Developer mode"');
console.log('   4. Click "Load unpacked"');
console.log('   5. Select the unzipped folder');
