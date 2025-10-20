import React, { useState, useEffect, useRef } from 'react';
import { Document } from './DocumentDisplay';
import { formatDate } from '../utils/date';

interface DocumentEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedDocuments: Document[]) => void;
    initialDocuments: Document[];
}

const docTypesToTitle: Record<string, string> = {
    SLA: "Service Level Agreement",
    QUOTE: "Quotation",
    INVOICE: "Invoice",
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ isOpen, onClose, onSave, initialDocuments }) => {
    const [localDocs, setLocalDocs] = useState<Document[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Deep copy to avoid mutating the original state
            setLocalDocs(JSON.parse(JSON.stringify(initialDocuments)));
            setActiveIndex(0);
        }
    }, [isOpen, initialDocuments]);

    useEffect(() => {
        if (contentRef.current && localDocs[activeIndex]) {
            contentRef.current.innerHTML = localDocs[activeIndex].html;
        }
    }, [activeIndex, localDocs]);

    if (!isOpen) {
        return null;
    }

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

    const handleSaveChanges = () => {
        const docsWithLastEdit = updateLocalDocContent();
        const currentDate = formatDate(new Date());
    
        const finalDocs = docsWithLastEdit.map(doc => {
            // Use a DOM parser to safely manipulate the HTML string
            const parser = new DOMParser();
            const docHtml = parser.parseFromString(doc.html, 'text/html');
            
            const dateElements = docHtml.querySelectorAll('[data-bizdoc-date="true"]');
            dateElements.forEach(el => {
                el.textContent = currentDate;
            });
            
            // Serialize the document body back to an HTML string
            const updatedHtml = docHtml.body.innerHTML;
    
            return { ...doc, html: updatedHtml };
        });
    
        onSave(finalDocs);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col p-4 sm:p-8" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl flex flex-col h-full w-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Documents</h2>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 px-4 flex-shrink-0">
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

                {/* Content */}
                <div className="flex-grow overflow-y-auto">
                    <div className="bg-gray-50 p-6">
                        <div
                            ref={contentRef}
                            className="prose prose-p:text-gray-700 prose-strong:text-black prose-headings:text-black prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 max-w-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};