import React from 'react';
import { CredentialsBar } from './CredentialsBar';
import { CollectionListSidebar } from './CollectionListSidebar';
import { DocumentDataGrid } from './DocumentDataGrid';
import { CredentialsModal } from './CredentialsModal';
import { DocumentDetailModal } from './DocumentDetailModal';
import { DocumentEditorModal } from './DocumentEditorModal';

export const MainView: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 overflow-hidden" dir="rtl">
      {/* Top Credentials & Status Bar */}
      <CredentialsBar />

      {/* Workspace Area: Sidebar + Data Grid */}
      <div className="flex-1 flex overflow-hidden">
        <CollectionListSidebar />
        <DocumentDataGrid />
      </div>

      {/* Overlay Modals */}
      <CredentialsModal />
      <DocumentDetailModal />
      <DocumentEditorModal />
    </div>
  );
};
