import React, { useState } from 'react';
import { ClientDetails, ItemPackage, Client, CompanyProfile } from '../App';
import { formatDate } from '../utils/date';

interface UserInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
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

const docTypes = {
  SLA: "Service Level Agreement",
  Quote: "Quotation",
  Invoice: "Invoice",
};

export const UserInput: React.FC<UserInputProps> = ({ 
    onGenerate, 
    isLoading, 
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
  const [prompt, setPrompt] = useState<string>('A web development project.');
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({
    SLA: true,
    Quote: true,
    Invoice: false,
  });
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const handleClientDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onClientDetailsChange(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (doc: string) => {
    setSelectedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);

    if (clientId) {
      const selectedClient = clients.find(c => c.id === clientId);
      if (selectedClient) {
        onClientDetailsChange({
          name: selectedClient.name,
          company: selectedClient.company,
          address: selectedClient.address,
        });
      }
    } else {
      // "Manual entry" selected, clear the fields for fresh input
      onClientDetailsChange({ name: '', company: '', address: '' });
    }
  };

  const handleSubmit = () => {
    const selectedDocNames = Object.entries(selectedDocs)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => docTypes[key as keyof typeof docTypes]);
    
    if (selectedDocNames.length === 0) {
      alert("Please select at least one document type to generate.");
      return;
    }

    let finalPrompt = `Generate the following document(s): ${selectedDocNames.join(', ')}.`;

    const currentDate = formatDate(new Date());
    finalPrompt += ` All date fields, including [[Date]], should be set to "${currentDate}".`;

    if (companyLogo) {
        const logoHtml = `<img src="${companyLogo}" alt="Company Logo" style="max-height: 70px; width: auto; margin-bottom: 1rem;" />`;
        finalPrompt += ` Replace the [[Company Logo]] placeholder with the following HTML: '${logoHtml}'.`;
    } else {
        finalPrompt += ` The [[Company Logo]] placeholder should be removed (replace with an empty string).`;
    }
    
    // Add company profile details
    const profileDetails = [];
    if (companyProfile.companyName) profileDetails.push(`Company Name: "${companyProfile.companyName}"`);
    if (companyProfile.address) profileDetails.push(`Company Address: "${companyProfile.address}"`);
    if (companyProfile.phone) profileDetails.push(`Company Phone: "${companyProfile.phone}"`);
    if (companyProfile.email) profileDetails.push(`Company Email: "${companyProfile.email}"`);
    if (companyProfile.repName) profileDetails.push(`Company Representative Name: "${companyProfile.repName}"`);
    if (companyProfile.repTitle) profileDetails.push(`Company Representative Title: "${companyProfile.repTitle}"`);
    if (companyProfile.bankName) profileDetails.push(`Bank Name: "${companyProfile.bankName}"`);
    if (companyProfile.accountName) profileDetails.push(`Account Name: "${companyProfile.accountName}"`);
    if (companyProfile.accountNumber) profileDetails.push(`Account Number: "${companyProfile.accountNumber}"`);
    if (companyProfile.branchCode) profileDetails.push(`Branch Code: "${companyProfile.branchCode}"`);
    if (companyProfile.accountType) profileDetails.push(`Account Type: "${companyProfile.accountType}"`);
    if (companyProfile.swiftCode) profileDetails.push(`Swift Code: "${companyProfile.swiftCode}"`);

    if (profileDetails.length > 0) {
      finalPrompt += ` Use the following company information for all placeholders like [[Company Name]], [[Bank Name]], etc.: ${profileDetails.join(', ')}.`;
    }

    // Add client details
    const detailsToAdd = [];
    if (clientDetails.name) detailsToAdd.push(`Client Name: "${clientDetails.name}"`);
    if (clientDetails.company) detailsToAdd.push(`Client Company: "${clientDetails.company}"`);
    if (clientDetails.address) detailsToAdd.push(`Client Address: "${clientDetails.address}"`);
    if (detailsToAdd.length > 0) {
        finalPrompt += ` Use the following client information: ${detailsToAdd.join(', ')}.`;
    }

    // Add package details OR the manual prompt
    const selectedPackage = itemPackages.find(p => p.id === selectedPackageId);
    if (selectedPackage) {
        const total = selectedPackage.items.reduce((sum, item) => sum + item.price, 0);

        // For Quote's "Cost Breakdown" table which has 3 columns: Item, Description, Amount
        const quoteBreakdownHtml = selectedPackage.items.map(item => 
          `<tr><td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${item.name}</td><td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${item.description}</td><td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid #eee;">${item.price.toFixed(2)}</td></tr>`
        ).join('');
        
        // For Invoice's items table which has 4 columns: Description, Rate, Qty, Amount
        const invoiceBreakdownHtml = selectedPackage.items.map(item =>
          `<tr><td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${item.name}: ${item.description}</td><td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid #eee;">${item.price.toFixed(2)}</td><td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid #eee;">1</td><td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid #eee;">${item.price.toFixed(2)}</td></tr>`
        ).join('');

        finalPrompt += ` Project Scope: ${selectedPackage.name}.`;
        finalPrompt += ` For the QUOTE document, populate the "Cost Breakdown" table's <tbody> with the following exact HTML: '${quoteBreakdownHtml}'.`;
        finalPrompt += ` For the INVOICE document, populate the items table's <tbody> with the following exact HTML, completely replacing any placeholder rows: '${invoiceBreakdownHtml}'.`;
        finalPrompt += ` The total project cost is R ${total.toFixed(2)}.`;
        finalPrompt += ` The deposit is 40% and the final balance is 60%.`;
    } else {
        finalPrompt += ` Project Details: ${prompt}.`;
    }
    
    // Handle document numbering
    let nextInvoiceCounter = invoiceCounter;
    let nextQuoteCounter = quoteCounter;

    if (selectedDocs['Invoice']) {
        const invoiceNumberFormatted = `INV${String(nextInvoiceCounter).padStart(4, '0')}`;
        finalPrompt += ` The Invoice Number is "${invoiceNumberFormatted}".`;
        nextInvoiceCounter++;
    }

    if (selectedDocs['Quote']) {
        const today = new Date();
        const dateString = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        const quoteNumberFormatted = `INV-QT-${String(nextQuoteCounter).padStart(3, '0')}-${dateString}`;
        finalPrompt += ` The Quotation Reference is "${quoteNumberFormatted}".`;
        nextQuoteCounter++;
    }

    // Update the counters' state in App.tsx
    setInvoiceCounter(nextInvoiceCounter);
    setQuoteCounter(nextQuoteCounter);

    onGenerate(finalPrompt);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-28">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Configure Your Documents</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">Select Document Types:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.keys(docTypes).map((doc) => (
            <label key={doc} className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedDocs[doc] ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              <input
                type="checkbox"
                checked={selectedDocs[doc]}
                onChange={() => handleCheckboxChange(doc)}
                className="h-4 w-4 rounded border-gray-400 bg-gray-200 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium">{doc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
          <label htmlFor="itemPackage" className="block text-sm font-medium text-gray-600 mb-2">Select a Package (Overrides Project Description):</label>
          <select
            id="itemPackage"
            value={selectedPackageId}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
              <option value="">-- Use Custom Project Description Below --</option>
              {itemPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
              ))}
          </select>
      </div>

      <div className="mb-6">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-600 mb-2">Or Describe Your Project Manually:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A brand identity and logo design for 'Starlight Cafe'."
          rows={3}
          disabled={!!selectedPackageId}
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="client" className="block text-sm font-medium text-gray-600 mb-2">Select a Client:</label>
        <select
            id="client"
            value={selectedClientId}
            onChange={handleClientSelect}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
            <option value="">-- Enter Details Manually Below --</option>
            {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company} ({client.name})</option>
            ))}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Client Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-600 mb-2">Client Name:</label>
              <input
                type="text"
                id="clientName"
                name="name"
                value={clientDetails.name}
                onChange={handleClientDetailChange}
                placeholder="e.g., Jane Doe"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="clientCompany" className="block text-sm font-medium text-gray-600 mb-2">Client Company:</label>
              <input
                type="text"
                id="clientCompany"
                name="company"
                value={clientDetails.company}
                onChange={handleClientDetailChange}
                placeholder="e.g., Innovate Corp"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-600 mb-2">Client Address:</label>
            <textarea
                id="clientAddress"
                name="address"
                value={clientDetails.address}
                onChange={handleClientDetailChange}
                rows={2}
                placeholder="e.g., 123 Main St, Anytown, USA"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
          </div>
        </div>
      </div>


      <div className="space-y-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Documents'
          )}
        </button>
      </div>
    </div>
  );
};