import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Generator } from './pages/Generator';
import { ItemPackagesPage } from './pages/ItemPackages';
import { ClientsPage } from './pages/Clients';
import { DashboardPage } from './pages/Dashboard';
import { CompanyProfilePage } from './pages/CompanyProfile';
import { Document } from './components/DocumentDisplay';
import { extractClientCompanyFromHtml } from './utils/parser';
import { 
    CLIENT_DETAILS_KEY,
    ITEM_PACKAGES_KEY,
    CLIENTS_KEY,
    INVOICE_COUNTER_KEY,
    QUOTE_COUNTER_KEY,
    COMPANY_LOGO_KEY,
    SAVED_DOCUMENT_SETS_KEY,
    COMPANY_PROFILE_KEY
} from './constants';

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
  
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    try {
        return localStorage.getItem(COMPANY_LOGO_KEY);
    } catch (e) {
        return null;
    }
  });

  const [clientDetails, setClientDetails] = useState<ClientDetails>(() => {
    try {
        const saved = localStorage.getItem(CLIENT_DETAILS_KEY);
        return saved ? JSON.parse(saved) : { 
            name: 'Innovate Corp', 
            company: 'Innovate Corporation', 
            address: '123 Tech Avenue, Silicon Valley, CA 94043' 
        };
    } catch (e) {
        return { name: '', company: '', address: '' };
    }
  });
  
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    try {
        const saved = localStorage.getItem(COMPANY_PROFILE_KEY);
        return saved ? JSON.parse(saved) : {
            repName: 'Tonderai M M P Mlauzi',
            repTitle: 'Director',
            companyName: 'Innovation Imperial',
            address: 'Waterfall Ridge, Vorna Valley, Midrand, South Africa',
            phone: '+27 69 790 6374',
            email: 'tonderai@innovationimperial.co.za',
            bankName: 'FNB',
            accountName: 'Tonderai M M P Mlauzi',
            accountNumber: '62719875932',
            branchCode: '250655',
            accountType: 'Cheque',
            swiftCode: 'FIRNZAJJ'
        };
    } catch (e) {
        return { repName: '', repTitle: '', companyName: '', address: '', phone: '', email: '', bankName: '', accountName: '', accountNumber: '', branchCode: '', accountType: '', swiftCode: '' };
    }
  });

  const [itemPackages, setItemPackages] = useState<ItemPackage[]>(() => {
    try {
        const saved = localStorage.getItem(ITEM_PACKAGES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
        const saved = localStorage.getItem(CLIENTS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  const [invoiceCounter, setInvoiceCounter] = useState<number>(() => {
    try {
        const saved = localStorage.getItem(INVOICE_COUNTER_KEY);
        const num = saved ? parseInt(saved, 10) : 1;
        return isNaN(num) ? 1 : num;
    } catch (e) {
        return 1;
    }
  });

  const [quoteCounter, setQuoteCounter] = useState<number>(() => {
    try {
        const saved = localStorage.getItem(QUOTE_COUNTER_KEY);
        const num = saved ? parseInt(saved, 10) : 1;
        return isNaN(num) ? 1 : num;
    } catch (e) {
        return 1;
    }
  });
  
  const [savedDocumentSets, setSavedDocumentSets] = useState<SavedDocumentSet[]>(() => {
    try {
        const saved = localStorage.getItem(SAVED_DOCUMENT_SETS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  useEffect(() => {
    if (companyLogo) {
      localStorage.setItem(COMPANY_LOGO_KEY, companyLogo);
    } else {
      localStorage.removeItem(COMPANY_LOGO_KEY);
    }
  }, [companyLogo]);

  useEffect(() => {
    localStorage.setItem(CLIENT_DETAILS_KEY, JSON.stringify(clientDetails));
  }, [clientDetails]);
  
  useEffect(() => {
    localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem(ITEM_PACKAGES_KEY, JSON.stringify(itemPackages));
  }, [itemPackages]);
  
  useEffect(() => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(INVOICE_COUNTER_KEY, invoiceCounter.toString());
  }, [invoiceCounter]);

  useEffect(() => {
    localStorage.setItem(QUOTE_COUNTER_KEY, quoteCounter.toString());
  }, [quoteCounter]);
  
  useEffect(() => {
    localStorage.setItem(SAVED_DOCUMENT_SETS_KEY, JSON.stringify(savedDocumentSets));
  }, [savedDocumentSets]);

  const handleSaveDocumentSet = useCallback((documents: Document[]) => {
    if (documents.length === 0) return;
    
    // Extract client name from the first available document for the card display
    const clientCompany = extractClientCompanyFromHtml(documents[0].html);

    const newSet: SavedDocumentSet = {
      id: new Date().toISOString(),
      savedAt: new Date().toISOString(),
      clientCompany: clientCompany,
      documents: documents,
    };

    setSavedDocumentSets(prevSets => [newSet, ...prevSets]);
  }, []);


  const renderPage = () => {
    switch(page) {
      case 'generator':
        return (
          <Generator
            onSaveDocumentSet={handleSaveDocumentSet}
            clientDetails={clientDetails}
            onClientDetailsChange={setClientDetails}
            itemPackages={itemPackages}
            clients={clients}
            invoiceCounter={invoiceCounter}
            setInvoiceCounter={setInvoiceCounter}
            quoteCounter={quoteCounter}
            setQuoteCounter={setQuoteCounter}
            companyLogo={companyLogo}
            companyProfile={companyProfile}
          />
        );
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
            setDocumentSets={setSavedDocumentSets}
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
        {renderPage()}
      </main>
    </div>
  );
};

export default App;