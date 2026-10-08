const fs = require('fs');
let c = fs.readFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', 'utf8');

if (!c.includes('MarketResearchAgentSection')) {
  c = c.replace(/import \{ BrandIdentitySection \} from '\.\/components\/BrandIdentitySection';/, 
    'import { BrandIdentitySection } from \'./components/BrandIdentitySection\';\nimport { MarketResearchAgentSection } from \'./components/MarketResearchAgentSection\';');

  c = c.replace(/export type TabType = 'identity' \| 'voice' \| 'audience' \| 'ecosystem' \| 'design' \| 'trust';/, 
    'export type TabType = \'identity\' | \'voice\' | \'audience\' | \'ecosystem\' | \'design\' | \'trust\' | \'market\';');

  c = c.replace(/\{ id: 'trust', label: '6. ׳ ׳ž׳™׳ ׳•׳× ׳•׳¡׳œ׳™׳§׳”', icon: ShieldCheck \},/, 
    '{ id: \'trust\', label: \'6. אמינות וסליקה\', icon: ShieldCheck },\n    { id: \'market\', label: \'7. סוכן מחקר AI\', icon: Globe },');

  // Also import Globe if not imported
  if (!c.includes('Globe')) {
    c = c.replace(/import \{ Building2, Sliders, Target, Palette, ShieldCheck, CheckCircle2, ChevronRight, Wand2, Search, ExternalLink, Lightbulb, PlayCircle, FileText, Smartphone, LayoutTemplate, MessageSquare, Briefcase, Plus, Menu, X, Rocket, Image as ImageIcon, Layers \} from 'lucide-react';/, 
      'import { Building2, Sliders, Target, Palette, ShieldCheck, CheckCircle2, ChevronRight, Wand2, Search, ExternalLink, Lightbulb, PlayCircle, FileText, Smartphone, LayoutTemplate, MessageSquare, Briefcase, Plus, Menu, X, Rocket, Image as ImageIcon, Layers, Globe } from \'lucide-react\';');
  }

  // add ecosystem and market into activeTab switch
  const renderCode = `{activeTab === 'identity' && <BrandIdentitySection />}
                  {activeTab === 'voice' && <BrandVoiceSection />}
                  {activeTab === 'audience' && <TargetAudienceSection />}
                  {activeTab === 'ecosystem' && <BrandEcosystemSection />}
                  {activeTab === 'design' && <DesignTokensSection />}
                  {activeTab === 'trust' && <TrustCheckoutSection />}
                  {activeTab === 'market' && <MarketResearchAgentSection />}`;
  
  c = c.replace(/\{activeTab === 'identity' && <BrandIdentitySection \/>\}[\s\S]*?\{activeTab === 'trust' && <TrustCheckoutSection \/>\}/, renderCode);
  
  fs.writeFileSync('src/modules/brand-dna-hub/StandaloneView.tsx', c);
}
