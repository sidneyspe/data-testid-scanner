const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
const version = manifest.version;
const extName = 'data-test-id-scanner';
const pemFile = `${extName}.pem`;
const crxFile = `${extName}-v${version}.crx`;
const zipFile = `${extName}-temp.zip`;

console.log('📦 Building CRX for', manifest.name, `v${version}`);

// 1. Create ZIP of extension files
const zip = new AdmZip();
zip.addLocalFolder('assets', 'assets');
zip.addLocalFolder('src', 'src');
zip.addLocalFolder('test', 'test');
zip.addLocalFile('manifest.json');
zip.writeZip(zipFile);
console.log('✅ Created ZIP:', zipFile);

// 2. Generate or load PEM key
let privateKey;
if (fs.existsSync(pemFile)) {
  privateKey = fs.readFileSync(pemFile);
  console.log('🔑 Using existing PEM key');
} else {
  // Generate RSA key pair
  const { publicKey, privateKey: privKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  privateKey = privKey;
  fs.writeFileSync(pemFile, privateKey);
  console.log('🔑 Generated new PEM key:', pemFile);
}

// 3. Read ZIP buffer
const zipBuffer = fs.readFileSync(zipFile);

// 4. Sign the ZIP
const sign = crypto.createSign('SHA256');
sign.update(zipBuffer);
sign.end();
const signature = sign.sign(privateKey);

// 5. Get public key
const publicKey = crypto.createPublicKey(privateKey).export({
  type: 'spki',
  format: 'der',
});

// 6. Create CRX header
// CRX3 format: magic number (4) + version (4) + header length (4) + header + zip + signature
const magic = Buffer.from('Cr24');
const crxVersion = Buffer.from([3, 0, 0, 0]);

// Create header (simplified CRX3)
const headerParts = [];
const pubKeyLen = Buffer.alloc(4);
pubKeyLen.writeUInt32LE(publicKey.length);
const sigLen = Buffer.alloc(4);
sigLen.writeUInt32LE(signature.length);

headerParts.push(pubKeyLen, publicKey, sigLen, signature);
const header = Buffer.concat(headerParts);

const headerLen = Buffer.alloc(4);
headerLen.writeUInt32LE(header.length);

const crxBuffer = Buffer.concat([
  magic,
  crxVersion,
  headerLen,
  header,
  zipBuffer,
]);

// 7. Write CRX file
fs.writeFileSync(crxFile, crxBuffer);

// 8. Clean up temp ZIP
fs.unlinkSync(zipFile);

console.log('✅ CRX created:', crxFile);
console.log('📊 File size:', (crxBuffer.length / 1024).toFixed(2), 'KB');
console.log(
  '\n⚠️  Keep',
  pemFile,
  'safe - you need it to update the extension!',
);
console.log('\n💡 To install:');
console.log('   Chrome: Drag', crxFile, 'to chrome://extensions/');
console.log('   Edge: Drag', crxFile, 'to edge://extensions/');
