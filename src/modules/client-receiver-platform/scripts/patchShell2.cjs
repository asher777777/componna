const fs = require('fs');
const shellPath = 'src/modules/client-receiver-platform/components/DynamicClientShell.tsx';
let c = fs.readFileSync(shellPath, 'utf8');

c = c.replace(/import \{ VideoProducerStudioView \} from '..\/..\/video-producer-studio';/, "const VideoProducerStudioView = React.lazy(() => import('../../video-producer-studio').then(m => ({ default: m.VideoProducerStudioView })));");
c = c.replace(/import \{ DbConnectorHubStandaloneView \} from '..\/..\/db-connector-hub';/, "const DbConnectorHubStandaloneView = React.lazy(() => import('../../db-connector-hub').then(m => ({ default: m.DbConnectorHubStandaloneView })));");
c = c.replace(/import \{ CrmAnalyticsStandaloneView \} from '..\/..\/crm-analytics';/, "const CrmAnalyticsStandaloneView = React.lazy(() => import('../../crm-analytics').then(m => ({ default: m.CrmAnalyticsStandaloneView })));");
c = c.replace(/import \{ PageBuilderStandaloneView \} from '..\/..\/page-builder';/, "const PageBuilderStandaloneView = React.lazy(() => import('../../page-builder').then(m => ({ default: m.PageBuilderStandaloneView })));");
c = c.replace(/import \{ AuthPortalStandaloneView \} from '..\/..\/auth-portal';/, "const AuthPortalStandaloneView = React.lazy(() => import('../../auth-portal').then(m => ({ default: m.AuthPortalStandaloneView })));");
c = c.replace(/import \{ FlowPlayerEngineStandaloneView \} from '..\/..\/flow-player-engine';/, "const FlowPlayerEngineStandaloneView = React.lazy(() => import('../../flow-player-engine').then(m => ({ default: m.FlowPlayerEngineStandaloneView })));");
c = c.replace(/import \{ MediaGalleryHubStandaloneView \} from '..\/..\/media-gallery-hub';/, "const MediaGalleryHubStandaloneView = React.lazy(() => import('../../media-gallery-hub').then(m => ({ default: m.MediaGalleryHubStandaloneView })));");
c = c.replace(/import \{ DbCollectionsHubStandaloneView \} from '..\/..\/db-collections-hub';/, "const DbCollectionsHubStandaloneView = React.lazy(() => import('../../db-collections-hub').then(m => ({ default: m.DbCollectionsHubStandaloneView })));");
c = c.replace(/import \{ TemplateStandaloneView \} from '..\/..\/_template';/, "const TemplateStandaloneView = React.lazy(() => import('../../_template').then(m => ({ default: m.TemplateStandaloneView })));");

c = c.replace("import React, { useState } from 'react';", "import React, { useState, Suspense } from 'react';");
c = c.replace("{renderActiveModuleView()}", "<Suspense fallback={<div className=\"p-8 text-center text-gray-500\">Loading module...</div>}>{renderActiveModuleView()}</Suspense>");

fs.writeFileSync(shellPath, c);
console.log('Done');
