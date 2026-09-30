const fs = require('fs');
let c = fs.readFileSync('D:/trusthome/app/media-studio.tsx', 'utf8');

c = c.replace(/tabsRow: \{([\s\S]*?)\},/, `tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },`);

c = c.replace(/voiceTabs: \{([\s\S]*?)\},/, `voiceTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },`);

c = c.replace(/tab: \{([\s\S]*?)\},/, `tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },`);

c = c.replace(/voiceTab: \{([\s\S]*?)\},/, `voiceTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },`);

c = c.replace(/settingRow: \{([\s\S]*?)\},/, `settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },`);

fs.writeFileSync('D:/trusthome/app/media-studio.tsx', c);
