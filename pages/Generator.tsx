import React, { useState, useCallback } from 'react';
import { UserInput } from '../components/UserInput';
import { DocumentDisplay, Document } from '../components/DocumentDisplay';
import { generateDocument } from '../services/geminiService';
import { ClientDetails, ItemPackage, Client, CompanyProfile } from '../App';

interface GeneratorProps {
    onSaveDocumentSet: (documents: Document[]) => void;
    clientDetails: ClientDetails;
    onClientDetailsChange: React.Dispatch<React.SetStateAction<ClientDetails>>;
    itemPackages: ItemPackage[];
    clients: Client[];
    invoiceCounter: number;
    setInvoiceCounter: React.Dispatch<React.SetStateAction<number>>;
    quoteCounter: number;
    setQuoteCounter: React.Dispatch<React.SetStateAction<number>>;
    companyLogo: string | null;
    companyProfile: CompanyProfile;
}

export const Generator: React.FC<GeneratorProps> = ({
    onSaveDocumentSet,
    clientDetails,
    onClientDetailsChange,
    itemPackages,
    clients,
    invoiceCounter,
    setInvoiceCounter,
    quoteCounter,
    setQuoteCounter,
    companyLogo,
    companyProfile
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setDocuments([]);

    try {
      const rawHtml = await generateDocument(prompt);
      if (rawHtml.includes('Error:')) {
          setError(rawHtml.replace(/<[^>]*>?/gm, ''));
          setDocuments([]);
      } else {
          const parsedDocs: Document[] = [];
          const regex = /<!-- START_DOC:(.*?) -->(.*?)<!-- END_DOC:\1 -->/gs;
          let match;
          while ((match = regex.exec(rawHtml)) !== null) {
              parsedDocs.push({
                  type: match[1].trim(),
                  html: match[2].trim()
              });
          }
          
          if (parsedDocs.length > 0) {
              setDocuments(parsedDocs);
          } else {
              setDocuments([{ type: 'Document', html: rawHtml }]);
          }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate document: ${errorMessage}`);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [setDocuments]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <UserInput 
            onGenerate={handleGenerate} 
            isLoading={isLoading}
            clientDetails={clientDetails}
            onClientDetailsChange={onClientDetailsChange}
            itemPackages={itemPackages}
            clients={clients}
            invoiceCounter={invoiceCounter}
            setInvoiceCounter={setInvoiceCounter}
            quoteCounter={quoteCounter}
            setQuoteCounter={setQuoteCounter}
            companyLogo={companyLogo}
            companyProfile={companyProfile}
        />
        <DocumentDisplay 
            documents={documents} 
            isLoading={isLoading} 
            error={error}
            onSaveToDashboard={onSaveDocumentSet}
        />
    </div>
  );
};