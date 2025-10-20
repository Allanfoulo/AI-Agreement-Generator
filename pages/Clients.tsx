import React, { useState } from 'react';
import { Client } from '../App';

interface ClientsPageProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


export const ClientsPage: React.FC<ClientsPageProps> = ({ clients, setClients }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null);

    const handleSaveClient = () => {
        if (name && company && address) {
            const newClient: Client = {
                id: new Date().toISOString(),
                name,
                company,
                address,
                notes,
            };
            setClients(prev => [...prev, newClient].sort((a, b) => a.company.localeCompare(b.company)));
            // Reset form
            setName('');
            setCompany('');
            setAddress('');
            setNotes('');
        } else {
            alert('Please fill in the Client Name, Company, and Address fields.');
        }
    };

    const handleDeleteRequest = (id: string) => {
        setClientToDeleteId(id);
    };

    const confirmDeletion = () => {
        if (clientToDeleteId) {
            setClients(clients.filter(client => client.id !== clientToDeleteId));
            setClientToDeleteId(null); // Close the dialog
        }
    };
    
    const cancelDeletion = () => {
        setClientToDeleteId(null); // Close the dialog
    };


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Create Client Form */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">Add a New Client</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="clientName" className="block text-sm font-medium text-gray-600 mb-2">Client Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="clientName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., John Doe"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="clientCompany" className="block text-sm font-medium text-gray-600 mb-2">Company Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="clientCompany"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="e.g., Acme Innovations"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-600 mb-2">Address <span className="text-red-500">*</span></label>
                            <textarea
                                id="clientAddress"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                placeholder="e.g., 456 Business Rd, Commerce City, USA"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="clientNotes" className="block text-sm font-medium text-gray-600 mb-2">Notes (Optional)</label>
                            <textarea
                                id="clientNotes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="e.g., Primary contact for marketing projects."
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <button
                            onClick={handleSaveClient}
                            className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700"
                        >
                            Save Client
                        </button>
                    </div>
                </div>

                {/* Existing Clients */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">Client List</h2>
                    <div className="space-y-4">
                        {clients.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">You haven't added any clients yet. Use the form on the left to get started.</p>
                        ) : (
                            clients.map(client => (
                                <div key={client.id} className="border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-indigo-700">{client.company}</h3>
                                            <p className="text-sm text-gray-600 font-medium">{client.name}</p>
                                        </div>
                                        <button onClick={() => handleDeleteRequest(client.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete Client">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-2">
                                        <p><strong className="font-medium text-gray-500">Address:</strong> {client.address.replace(/\n/g, ', ')}</p>
                                        {client.notes && <p className="bg-gray-50 p-2 rounded-md border border-gray-200"><strong className="font-medium text-gray-500">Notes:</strong> {client.notes}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {clientToDeleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all"
                         role="alertdialog"
                         aria-labelledby="dialog-title"
                    >
                        <h3 id="dialog-title" className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to delete this client? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={cancelDeletion}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeletion}
                                autoFocus
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};