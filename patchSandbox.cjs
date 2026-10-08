const fs = require('fs');
const p = 'src/modules/saas-storefront-composer/components/InteractiveTrialSandbox.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import \{ VideoProducerStudioView \} from '..\/..\/video-producer-studio';/, "const VideoProducerStudioView = React.lazy(() => import('../../video-producer-studio').then(m => ({ default: m.VideoProducerStudioView })));");
c = c.replace(/import \{ SmartFormBuilderStandaloneView \} from '..\/..\/smart-form-builder';/, "const SmartFormBuilderStandaloneView = React.lazy(() => import('../../smart-form-builder').then(m => ({ default: m.SmartFormBuilderStandaloneView })));");
c = c.replace(/import \{ FlowPlayerEngineStandaloneView \} from '..\/..\/flow-player-engine';/, "const FlowPlayerEngineStandaloneView = React.lazy(() => import('../../flow-player-engine').then(m => ({ default: m.FlowPlayerEngineStandaloneView })));");

if (!c.includes('Suspense')) {
  c = c.replace("import React, { useState } from 'react';", "import React, { useState, Suspense } from 'react';");
}

c = c.replace("{renderDemoContent()}", "<Suspense fallback={<div className=\"p-8 text-center\">Loading...</div>}>{renderDemoContent()}</Suspense>");

fs.writeFileSync(p, c);
console.log('Sandbox Patched');
