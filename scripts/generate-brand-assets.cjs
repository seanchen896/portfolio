// Editable vector sources; regenerate the browser-ready assets with this script.
const fs = require('node:fs/promises');
const sharp = require('sharp');
const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f5f5f2"/>
<g fill="none" stroke="#d5d5d0"><circle cx="1040" cy="300" r="235"/><circle cx="1040" cy="300" r="180"/><circle cx="1040" cy="300" r="100"/><path d="M760 300h440M1040 20v560"/></g>
<g fill="#111" font-family="Helvetica,Arial,sans-serif">
<text x="64" y="88" font-size="18" letter-spacing="2">SELECTED WORK / PORTFOLIO</text>
<text x="57" y="285" font-size="146" font-weight="700" letter-spacing="-9">Sean Chen</text>
<text x="64" y="354" font-size="40" letter-spacing="-1">Mechanical Engineer</text>
<text x="64" y="414" font-size="22" fill="#555">Product design. Precision controls. Research.</text>
<path d="M64 505h1072" stroke="#111"/>
<text x="64" y="554" font-size="18">UC BERKELEY</text><text x="1136" y="554" text-anchor="end" font-size="18">DESIGN / BUILD / TEST</text>
</g></svg>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#111"/><g fill="none" stroke="#fff" stroke-width="40" stroke-linecap="square" stroke-linejoin="round"><path d="M216 166h-80v90h80v90h-80M380 166h-88v180h88"/></g></svg>`;
async function main() {
 await fs.writeFile('public/brand/og-preview.svg', preview);
 await fs.writeFile('public/brand/icon.svg', icon);
 await sharp(Buffer.from(preview)).png().toFile('public/og-image.png');
 for (const size of [32,192,512]) await sharp(Buffer.from(icon)).resize(size,size).png().toFile(`public/icon-${size}.png`);
 await sharp(Buffer.from(icon)).resize(180,180).png().toFile('public/apple-touch-icon.png');
 const sizes = [16,32,48];
 const images = await Promise.all(sizes.map(size => sharp(Buffer.from(icon)).resize(size,size).png().toBuffer()));
 const header = Buffer.alloc(6 + 16 * sizes.length); header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
 let offset=header.length;
 images.forEach((data,i) => { const p=6+16*i; header[p]=sizes[i];header[p+1]=sizes[i];header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(data.length,p+8);header.writeUInt32LE(offset,p+12);offset+=data.length; });
 await fs.writeFile('public/favicon.ico',Buffer.concat([header,...images]));
}
main().catch(error => {console.error(error);process.exitCode=1;});
