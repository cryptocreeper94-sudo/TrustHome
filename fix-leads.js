const fs = require('fs');
let c = fs.readFileSync('D:/trusthome/app/leads.tsx', 'utf8');

c = c.replace(/<View style=\{\[styles\.root, \{ backgroundColor: colors\.background \}\]\}>/, `<View style={[styles.root, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>`);

c = c.replace(/<Header[\s\S]*?title="Leads & CRM"[\s\S]*?showBack/, `<Header 
        title="Leads & CRM" 
        showBack 
        transparent
        imageBanner={require('@/assets/images/luxury-bg.jpg')}`);

c = c.replace(/statCard: \{([\s\S]*?)\},/, `statCard: {
    minHeight: 84,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },`);

c = c.replace(/leadCard: \{([\s\S]*?)\},/, `leadCard: {
    marginBottom: 12,
    minHeight: 72,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },`);

c = c.replace(/filterChip: \{([\s\S]*?)\},/, `filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },`);

c = c.replace(/toggleBtn: \{([\s\S]*?)\},/, `toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },`);

c = c.replace(/sourcesAccordion: \{([\s\S]*?)\},/, `sourcesAccordion: {
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderRadius: 16,
  },`);

c = c.replace(/pipelineCard: \{([\s\S]*?)\},/, `pipelineCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },`);

fs.writeFileSync('D:/trusthome/app/leads.tsx', c);
