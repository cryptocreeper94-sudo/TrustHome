const fs = require('fs');
let c = fs.readFileSync('D:/trusthome/app/media-studio.tsx', 'utf8');

c = c.replace(/uploadZone: \{([\s\S]*?)\},/, `uploadZone: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },`);

c = c.replace(/pill: \{([\s\S]*?)\},/, `pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.3)',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },`);

c = c.replace(/voicePill: \{([\s\S]*?)\},/, `voicePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },`);

c = c.replace(/createBtn: \{([\s\S]*?)\},/, `createBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },`);

fs.writeFileSync('D:/trusthome/app/media-studio.tsx', c);
