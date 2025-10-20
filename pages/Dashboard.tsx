import React, { useState } from 'react';
import { SavedDocumentSet } from '../App';
import { DocumentEditor } from '../components/DocumentEditor';
import { formatDate } from '../utils/date';

interface DashboardPageProps {
    documentSets: SavedDocumentSet[];
    setDocumentSets: React.Dispatch<React.SetStateAction<SavedDocumentSet[]>>;
}

const DocIcon: React.FC<{ type: string }> = ({ type }) => {
    let icon;
    let color = 'text-gray-500';
    let label = 'Doc';
    switch(type) {
        case 'INVOICE':
            icon = <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
            color = 'text-green-500';
            label = 'Invoice';
            break;
        case 'QUOTE':
            icon = <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />;
            color = 'text-blue-500';
            label = 'Quote';
            break;
        case 'SLA':
            icon = <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />;
            color = 'text-purple-500';
            label = 'SLA';
            break;
        default:
             icon = <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />;
    }
    return (
        <div className={`flex items-center space-x-1.5 p-1 px-2 rounded-full text-xs font-medium bg-opacity-20 ${color.replace('text', 'bg').replace('-500', '-100')} ${color}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icon}</svg>
            <span>{label}</span>
        </div>
    );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ documentSets, setDocumentSets }) => {
    const [editingSet, setEditingSet] = useState<SavedDocumentSet | null>(null);
    const [deletingSetId, setDeletingSetId] = useState<string | null>(null);

    const handleEdit = (docSet: SavedDocumentSet) => {
        setEditingSet(docSet);
    };

    const handleSaveEdits = (updatedDocuments: SavedDocumentSet['documents']) => {
        if (!editingSet) return;
        
        const updatedSet = { 
            ...editingSet, 
            documents: updatedDocuments,
            savedAt: new Date().toISOString(),
        };
        setDocumentSets(prevSets => 
            prevSets.map(set => set.id === editingSet.id ? updatedSet : set)
        );
        setEditingSet(null);
    };

    const handleDeleteRequest = (id: string) => {
        setDeletingSetId(id);
    };

    const confirmDeletion = () => {
        if (deletingSetId) {
            setDocumentSets(prevSets => prevSets.filter(set => set.id !== deletingSetId));
            setDeletingSetId(null);
        }
    };
    
    return (
        <>
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Document Dashboard</h1>
                <p className="text-gray-600 mt-1">View, edit, and manage all your saved business documents.</p>
            </div>

            {documentSets.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-semibold text-gray-800">No Documents Saved Yet</h3>
                    <p className="mt-1 text-gray-500">Go to the 'Generator' page to create and save your first document set.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {documentSets.map(docSet => (
                        <div key={docSet.id} className="bg-white rounded-xl border border-gray-200 shadow-md flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="p-5 flex-grow">
                                <p className="text-xs text-gray-500 mb-2">Saved on: {formatDate(new Date(docSet.savedAt))}</p>
                                <h3 className="font-bold text-indigo-700 text-lg truncate" title={docSet.clientCompany}>{docSet.clientCompany}</h3>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {docSet.documents.map(doc => <DocIcon key={doc.type} type={doc.type} />)}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                                <button onClick={() => handleDeleteRequest(docSet.id)} className="text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-1 rounded-md transition-colors">Delete</button>
                                <button onClick={() => handleEdit(docSet)} className="text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1 rounded-md transition-colors">View / Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingSet && (
                <DocumentEditor
                    isOpen={!!editingSet}
                    onClose={() => setEditingSet(null)}
                    onSave={handleSaveEdits}
                    initialDocuments={editingSet.documents}
                />
            )}

            {deletingSetId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this document set? This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setDeletingSetId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">Cancel</button>
                            <button onClick={confirmDeletion} autoFocus className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};