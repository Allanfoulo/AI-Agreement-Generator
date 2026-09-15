import React, { useState } from 'react';
import { Header } from './components/Header';
import { ItemPackagesPage } from './pages/ItemPackages';
import { ClientsPage } from './pages/Clients';
import { DashboardPage } from './pages/Dashboard';
import { CompanyProfilePage } from './pages/CompanyProfile';
import { Document } from './components/DocumentDisplay';
import { useWorkspace } from './src/adapters/use-workspace';
import { BackendDocuments } from './pages/BackendDocuments';
import { LegacyImport } from './pages/LegacyImport';

export interface ClientDetails { name: string; company: string; address: string; }
export interface Client extends ClientDetails { id: string; notes: string; }
export interface Item { name: string; description: string; price: number; }
export interface ItemPackage { id: string; name: string; items: Item[]; }
export interface SavedDocumentSet { id: string; savedAt: string; clientCompany: string; documents: Document[]; }
export interface CompanyProfile { repName: string; repTitle: string; companyName: string; address: string; phone: string; email: string; bankName: string; accountName: string; accountNumber: string; branchCode: string; accountType: string; swiftCode: string; }

type Page = 'generator' | 'packages' | 'clients' | 'dashboard' | 'companyProfile';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('generator');
  const [view, setView] = useState<'documents' | 'classic' | 'import'>('documents');
  const { data, error, pending, setCompanyLogo, setCompanyProfile, setClients, setItemPackages, saveDocumentSet, deleteDocumentSet } = useWorkspace();
  const companyLogo = data?.logo ?? null;
  const companyProfile = data?.profile;
  const clients = data?.clients ?? [];
  const itemPackages = data?.packages ?? [];
  const savedDocumentSets = data?.documents ?? [];

  if (!data) return <p role="status" className="connection-state">Connecting to workspace...</p>;

  const renderPage = () => {
    switch (page) {
      case 'packages': return <ItemPackagesPage packages={itemPackages} setPackages={setItemPackages} />;
      case 'clients': return <ClientsPage clients={clients} setClients={setClients} />;
      case 'dashboard': return <DashboardPage documentSets={savedDocumentSets} onUpdateDocumentSet={saveDocumentSet} onDeleteDocumentSet={deleteDocumentSet} />;
      case 'companyProfile': return <CompanyProfilePage profile={companyProfile} setProfile={setCompanyProfile} />;
      default: return <BackendDocuments clients={clients} />;
    }
  };

  return (
    <div className="brief-shell">
      <Header
        setPage={pageValue => { setPage(pageValue); if (pageValue !== 'generator') setView('classic'); }}
        currentPage={page}
        companyLogo={companyLogo}
        setCompanyLogo={setCompanyLogo}
        onDocuments={() => { setPage('generator'); setView('documents'); }}
        onImport={() => setView('import')}
      />
      <main className="brief-main">
        <div className="main-topline">
          <span className="eyebrow">YOUR WORKSPACE <span aria-hidden="true">/</span> <strong>THE STUDIO</strong></span>
          <span className="workspace-chip">Shared workspace</span>
        </div>
        {pending > 0 && <p role="status" className="sync-note">Saving changes...</p>}
        {error && <p role="alert" className="error-note">{error}</p>}
        {view === 'documents' ? <BackendDocuments clients={clients} /> : view === 'import' ? <LegacyImport /> : renderPage()}
      </main>
    </div>
  );
};

export default App;
