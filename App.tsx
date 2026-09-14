import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ItemPackagesPage } from './pages/ItemPackages';
import { ClientsPage } from './pages/Clients';
import { DashboardPage } from './pages/Dashboard';
import { CompanyProfilePage } from './pages/CompanyProfile';
import { Document } from './components/DocumentDisplay';
import { extractClientCompanyFromHtml } from './utils/parser';
import { useWorkspace } from './src/adapters/use-workspace';
import { BackendDocuments } from './pages/BackendDocuments';
import { LegacyImport } from './pages/LegacyImport';

export interface ClientDetails {
  name: string;
  company: string;
  address: string;
}

export interface Client extends ClientDetails {
  id: string;
  notes: string;
}

export interface Item {
  name: string;
  description: string;
  price: number;
}

export interface ItemPackage {
  id: string;
  name: string;
  items: Item[];
}

export interface SavedDocumentSet {
  id: string;
  savedAt: string;
  clientCompany: string;
  documents: Document[];
}

export interface CompanyProfile {
  repName: string;
  repTitle: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  swiftCode: string;
}

const App: React.FC = () => {
  const [page, setPage] = useState<'generator' | 'packages' | 'clients' | 'dashboard' | 'companyProfile'>('generator');
  
  const { data, error, pending, setCompanyLogo, setCompanyProfile, setClients, setItemPackages, saveDocumentSet, deleteDocumentSet } = useWorkspace();
  const [clientDetails, setClientDetails] = useState<ClientDetails>({ name: '', company: '', address: '' });
  const [view, setView] = useState<'classic' | 'documents' | 'import'>('documents');
  const companyLogo = data?.logo ?? null;
  const companyProfile = data?.profile;
  const clients = data?.clients ?? [];
  const itemPackages = data?.packages ?? [];
  const savedDocumentSets = data?.documents ?? [];
  const handleSaveDocumentSet = (documents: Document[]) => saveDocumentSet({ id: crypto.randomUUID(), savedAt: new Date().toISOString(), clientCompany: clientDetails.company || 'Draft', documents });
  const handleUpdateDocumentSet = (set: SavedDocumentSet) => saveDocumentSet(set);
  const handleDeleteDocumentSet = (id: string) => deleteDocumentSet(id);
  if (!data) return <p role="status" className="p-8">Connecting to workspace…</p>;
  const renderPage = () => {
    switch(page) {
      case 'generator':
        return <BackendDocuments clients={clients} />;
      case 'packages':
        return (
          <ItemPackagesPage
            packages={itemPackages}
            setPackages={setItemPackages}
          />
        );
      case 'clients':
        return (
          <ClientsPage
            clients={clients}
            setClients={setClients}
          />
        );
       case 'dashboard':
        return (
          <DashboardPage
            documentSets={savedDocumentSets}
            onUpdateDocumentSet={handleUpdateDocumentSet}
            onDeleteDocumentSet={handleDeleteDocumentSet}
          />
        );
      case 'companyProfile':
        return (
            <CompanyProfilePage
                profile={companyProfile}
                setProfile={setCompanyProfile}
            />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        setPage={setPage} 
        currentPage={page}
        companyLogo={companyLogo}
        setCompanyLogo={setCompanyLogo}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <nav className="flex gap-4 mb-4"><button onClick={() => setView('documents')}>Documents</button><button onClick={() => setView('classic')}>Company, clients & packages</button><button onClick={() => setView('import')}>Import existing data</button></nav>
        {pending > 0 && <p role="status">Saving…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {view === 'documents' ? <BackendDocuments clients={clients} /> : view === 'import' ? <LegacyImport /> : renderPage()}
      </main>
    </div>
  );
};

export default App;
