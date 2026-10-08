const fs = require('fs');

const shellPath = 'src/modules/client-receiver-platform/components/DynamicClientShell.tsx';
let content = fs.readFileSync(shellPath, 'utf8');

const oldImports = // Import standalone views of our modules
import { VideoProducerStudioView } from '../../video-producer-studio';
import { DbConnectorHubStandaloneView } from '../../db-connector-hub';
import { CrmAnalyticsStandaloneView } from '../../crm-analytics';
import { PageBuilderStandaloneView } from '../../page-builder';
import { AuthPortalStandaloneView } from '../../auth-portal';
import { FlowPlayerEngineStandaloneView } from '../../flow-player-engine';
import { MediaGalleryHubStandaloneView } from '../../media-gallery-hub';
import { DbCollectionsHubStandaloneView } from '../../db-collections-hub';
import { TemplateStandaloneView } from '../../_template';
import { Globe, ShoppingBag, Sparkles } from 'lucide-react';;

const newImports = // Import standalone views of our modules Dynamically
const VideoProducerStudioView = React.lazy(() => import('../../video-producer-studio').then(m => ({ default: m.VideoProducerStudioView })));
const DbConnectorHubStandaloneView = React.lazy(() => import('../../db-connector-hub').then(m => ({ default: m.DbConnectorHubStandaloneView })));
const CrmAnalyticsStandaloneView = React.lazy(() => import('../../crm-analytics').then(m => ({ default: m.CrmAnalyticsStandaloneView })));
const PageBuilderStandaloneView = React.lazy(() => import('../../page-builder').then(m => ({ default: m.PageBuilderStandaloneView })));
const AuthPortalStandaloneView = React.lazy(() => import('../../auth-portal').then(m => ({ default: m.AuthPortalStandaloneView })));
const FlowPlayerEngineStandaloneView = React.lazy(() => import('../../flow-player-engine').then(m => ({ default: m.FlowPlayerEngineStandaloneView })));
const MediaGalleryHubStandaloneView = React.lazy(() => import('../../media-gallery-hub').then(m => ({ default: m.MediaGalleryHubStandaloneView })));
const DbCollectionsHubStandaloneView = React.lazy(() => import('../../db-collections-hub').then(m => ({ default: m.DbCollectionsHubStandaloneView })));
const TemplateStandaloneView = React.lazy(() => import('../../_template').then(m => ({ default: m.TemplateStandaloneView })));
import { Globe, ShoppingBag, Sparkles } from 'lucide-react';;

content = content.replace(oldImports, newImports);

// Ensure Suspense import
if (!content.includes('Suspense')) {
  content = content.replace(/import React, { useState } from 'react';/, "import React, { useState, Suspense } from 'react';");
}

const oldRender = {renderActiveModuleView()};
const newRender = <Suspense fallback={<div className="flex items-center justify-center p-12 text-gray-500">׳˜׳•׳¢׳Ÿ ׳¨׳›׳™׳‘...</div>}>\n            {renderActiveModuleView()}\n          </Suspense>;

content = content.replace(oldRender, newRender);

fs.writeFileSync(shellPath, content, 'utf8');
console.log('DynamicClientShell patched.');
