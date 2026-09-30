const fs = require('fs');
const path = require('path');

const appDir = 'D:/trusthome/app';
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx'));

const bannerMap = {
  'media-studio.tsx': "imageBanner={require('@/assets/images/guide-media.jpg')}",
  'properties.tsx': "imageBanner={require('@/assets/images/guide-properties.jpg')}",
  'transactions.tsx': "imageBanner={require('@/assets/images/guide-transactions.jpg')}",
  'documents.tsx': "imageBanner={require('@/assets/images/guide-documents.jpg')}",
  'messages.tsx': "imageBanner={require('@/assets/images/guide-messages.jpg')}",
  'business.tsx': "imageBanner={require('@/assets/images/guide-business.jpg')}",
  'leads.tsx': "imageBanner={require('@/assets/images/guide-leads.jpg')}",
  'marketing.tsx': "imageBanner={require('@/assets/images/guide-marketing.jpg')}",
  'analytics.tsx': "imageBanner={require('@/assets/images/guide-analytics.jpg')}"
};

files.forEach(f => {
  if (!bannerMap[f]) return;
  const p = path.join(appDir, f);
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  // Insert imageBanner after showBack or title if showBack isn't there
  // e.g. <Header title="Walkthrough Maker" showBack transparent={false} />
  
  if (!content.includes('imageBanner={require(')) {
    content = content.replace(/(<Header[\s\S]*?)(transparent=\{false\})/g, `$1$2\n        ${bannerMap[f]}`);
  }

  if (content !== original) {
    fs.writeFileSync(p, content);
    console.log(`Added banner to ${f}`);
  }
});
