import React, { useState, useEffect, useRef } from 'react';

export interface Document {
  type: string;
  html: string;
}

interface DocumentDisplayProps {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  onSaveToDashboard: (documents: Document[]) => void;
}

interface PdfOptions {
    pageSize: 'letter' | 'a4';
    orientation: 'portrait' | 'landscape';
}

// Add a declaration for the html2pdf library loaded via script tag
declare var html2pdf: any;

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const SaveIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.375c-.621 0-1.125.504-1.125 1.125v14.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V7.5M9 3.75V7.5h6" />
    </svg>
);

const PdfIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


export const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ documents, isLoading, error, onSaveToDashboard }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [localDocs, setLocalDocs] = useState<Document[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>({
    pageSize: 'letter',
    orientation: 'portrait'
  });

  useEffect(() => {
    setLocalDocs(documents);
    setActiveIndex(0);
    setSaved(false);
  }, [documents]);
  
  useEffect(() => {
      if (contentRef.current && localDocs[activeIndex]) {
          contentRef.current.innerHTML = localDocs[activeIndex].html;
      }
  }, [activeIndex, localDocs]);


  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);
  
  const updateLocalDocContent = () => {
      if (contentRef.current && localDocs[activeIndex]) {
          const newDocs = [...localDocs];
          newDocs[activeIndex] = {
              ...newDocs[activeIndex],
              html: contentRef.current.innerHTML,
          };
          setLocalDocs(newDocs);
          return newDocs;
      }
      return localDocs;
  }

  const handleTabClick = (index: number) => {
      updateLocalDocContent();
      setActiveIndex(index);
  }

  const handleCopy = () => {
    if (contentRef.current) {
      navigator.clipboard.writeText(contentRef.current.innerHTML).then(() => {
        setCopied(true);
      });
    }
  };

  const handleSave = () => {
    const updatedDocs = updateLocalDocContent();
    onSaveToDashboard(updatedDocs);
    setSaved(true);
  };
  
  const generatePdf = (htmlContent: string, filename: string, options: PdfOptions): Promise<void> => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.opacity = '0';
    container.style.zIndex = '-1';

    // Calculate width based on page size and orientation to help html2canvas
    const marginIn = 0.5;
    const dpi = 96;
    let paperWidthIn, paperHeightIn;

    if (options.pageSize === 'letter') {
        [paperWidthIn, paperHeightIn] = [8.5, 11];
    } else { // a4
        [paperWidthIn, paperHeightIn] = [8.27, 11.69];
    }

    const contentWidthIn = (options.orientation === 'portrait' ? paperWidthIn : paperHeightIn) - (marginIn * 2);
    container.style.width = `${contentWidthIn * dpi}px`;
    
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    const pdfGenOptions = {
      margin: marginIn,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'in', format: options.pageSize, orientation: options.orientation },
      pagebreak: { mode: ['css', 'legacy'] } 
    };

    return html2pdf().from(container).set(pdfGenOptions).save().then(() => {
      document.body.removeChild(container);
    });
  };

  const handleDownloadSinglePdf = () => {
    const docsWithLatestEdits = updateLocalDocContent();
    const activeDoc = docsWithLatestEdits[activeIndex];

    if (!activeDoc) {
      console.error("No active document to download.");
      return;
    }
    
    generatePdf(activeDoc.html, `${docTypesToTitle[activeDoc.type] || activeDoc.type}.pdf`, pdfOptions);
  };
  
  const handleDownloadAllPdfs = async () => {
    const docsWithLatestEdits = updateLocalDocContent();

    if (docsWithLatestEdits.length === 0) {
        console.error("No documents to download.");
        return;
    }
    
    setIsDownloadingAll(true);
    try {
        for (const doc of docsWithLatestEdits) {
            await generatePdf(doc.html, `${docTypesToTitle[doc.type] || doc.type}.pdf`, pdfOptions);
        }
    } catch (err) {
        console.error("An error occurred during sequential PDF download:", err);
    } finally {
        setIsDownloadingAll(false);
    }
  };
  
  const docTypesToTitle: Record<string, string> = {
      SLA: "Service Level Agreement",
      QUOTE: "Quotation",
      INVOICE: "Invoice",
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <svg className="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-xl font-semibold text-gray-900">Generating Your Documents</h3>
          <p className="text-gray-500">BizDoc AI is thinking... Please wait a moment.</p>
        </div>
      );
    }
    if (error) {
      return <div className="p-6 bg-red-100 border border-red-300 rounded-lg text-red-700">{error}</div>;
    }
    if (documents.length === 0) {
      return (
        <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-500">Your generated documents will appear here.</h3>
          <p className="text-gray-400 mt-2">Configure your request on the left and click "Generate Documents" to begin.</p>
        </div>
      );
    }
    return (
        <div
          id="printableArea"
          ref={contentRef}
          className="prose prose-p:text-gray-700 prose-strong:text-black prose-headings:text-black prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 max-w-none"
        />
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 min-h-[30rem] relative">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">2. Review & Edit Your Documents</h2>
        {documents.length > 0 && !isLoading && !error && (
            <div className="flex items-center space-x-2 flex-wrap gap-2">
                <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors border border-gray-300"
                    title="Save document set to dashboard"
                >
                    {saved ? <CheckIcon/> : <SaveIcon />}
                    <span>{saved ? 'Saved!' : 'Save to Dashboard'}</span>
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors border border-gray-300"
                    title="Copy raw HTML to clipboard"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span>{copied ? 'Copied!' : 'Copy HTML'}</span>
                </button>
            </div>
        )}
      </div>

      {documents.length > 0 && !isLoading && !error && (
          <>
            <div className="border-b border-gray-200 mt-4 mb-2">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {localDocs.map((doc, index) => (
                        <button
                            key={index}
                            onClick={() => handleTabClick(index)}
                            className={`${
                                index === activeIndex
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {docTypesToTitle[doc.type] || doc.type}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div>
                        <label htmlFor="pageSize" className="block text-xs font-medium text-gray-600 mb-1">Page Size</label>
                        <select
                            id="pageSize"
                            value={pdfOptions.pageSize}
                            onChange={(e) => setPdfOptions(prev => ({ ...prev, pageSize: e.target.value as PdfOptions['pageSize'] }))}
                            className="bg-white border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="letter">Letter</option>
                            <option value="a4">A4</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="orientation" className="block text-xs font-medium text-gray-600 mb-1">Orientation</label>
                        <select
                            id="orientation"
                            value={pdfOptions.orientation}
                            onChange={(e) => setPdfOptions(prev => ({ ...prev, orientation: e.target.value as PdfOptions['orientation'] }))}
                            className="bg-white border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </div>
                </div>

                <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleDownloadSinglePdf}
                        className="flex w-full sm:w-auto items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors border border-gray-300"
                        title="Download active document as PDF"
                    >
                        <PdfIcon />
                        <span>Download PDF</span>
                    </button>
                    <button
                        onClick={handleDownloadAllPdfs}
                        disabled={isDownloadingAll}
                        className="flex w-full sm:w-auto items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        title="Download each document as a separate PDF sequentially"
                    >
                        {isDownloadingAll ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <PdfIcon />
                                <span>Download All as PDFs</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
          </>
      )}

      <div className="mt-4 bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-[calc(25rem-50px)]">
        {renderContent()}
      </div>
    </div>
  );
};