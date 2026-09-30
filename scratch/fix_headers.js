const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('D:/trusthome/app').filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  let content = fs.readFileSync(path.join('D:/trusthome/app', f), 'utf8');
  if (!content.includes('<Header ')) return;
  let match = content.match(/imageBanner=\{require\('([^']+)'\)\}/);
  let bannerStr = match ? match[0] : null;
  
  if (!bannerStr) {
    const filename = path.basename(f, '.tsx');
    const maybeImage = '@/assets/images/guide-' + filename + '.jpg';
    if (fs.existsSync(path.join('D:/trusthome/assets/images', 'guide-' + filename + '.jpg'))) {
      bannerStr = `imageBanner={require('${maybeImage}')}`;
    }
  }
  
  if (bannerStr) {
    // Remove the old prop wherever it might be
    content = content.replace(/\s*imageBanner=\{require\('[^']+'\)\}/g, '');
    // Insert it into the <Header >
    content = content.replace(/<Header /g, '<Header ' + bannerStr + ' ');
    fs.writeFileSync(path.join('D:/trusthome/app', f), content, 'utf8');
    console.log('Fixed ' + f);
  }
});
