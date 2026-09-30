const fs = require('fs');
const path = require('path');

const appDir = 'D:/trusthome/app';
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx'));

const bannerMap = {
  'media-studio.tsx': 'guide-media.jpg',
  'properties.tsx': 'guide-properties.jpg',
  'transactions.tsx': 'guide-transactions.jpg',
  'documents.tsx': 'guide-documents.jpg',
  'messages.tsx': 'guide-messages.jpg',
  'business.tsx': 'guide-business.jpg',
  'leads.tsx': 'guide-leads.jpg',
  'marketing.tsx': 'guide-marketing.jpg',
  'analytics.tsx': 'guide-analytics.jpg'
};

files.forEach(f => {
  if (!bannerMap[f]) return;
  const p = path.join(appDir, f);
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  // 1. Add imageBanner if missing
  if (!content.includes('imageBanner')) {
    // find <Header ... /> and insert imageBanner before />
    // Wait, some <Header> tags span multiple lines!
    content = content.replace(/<Header([\s\S]*?)\/>/g, (match, p1) => {
       return `<Header${p1} imageBanner={require('@/assets/images/${bannerMap[f]}')} />`;
    });
  }

  // 2. Move Header into ScrollView
  // Search for <Header ... /> then optional whitespace then <ScrollView ... >
  const regex = /(<Header[\s\S]*?imageBanner[\s\S]*?\/>)\s*(<ScrollView[^>]*>)/;
  const m = content.match(regex);
  if (m) {
    const headerStr = m[1];
    const scrollStr = m[2];
    content = content.replace(regex, scrollStr + '\n        ' + headerStr);
  } else {
     // What if ScrollView wraps Animated.View?
     // We just look for the first ScrollView and put Header right inside it
     const headerRegex = /(<Header[\s\S]*?imageBanner[\s\S]*?\/>)\s*/;
     const hMatch = content.match(headerRegex);
     if (hMatch && !content.includes('<ScrollView>\n        <Header')) {
        const headerCode = hMatch[1];
        // remove header from its current place
        let tempContent = content.replace(headerRegex, '');
        // find scroll view and insert
        tempContent = tempContent.replace(/(<ScrollView[^>]*>)/, `$1\n        ${headerCode}\n`);
        content = tempContent;
     }
  }

  if (content !== original) {
    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  }
});
