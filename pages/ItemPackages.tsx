import React, { useState } from 'react';
import { Item, ItemPackage } from '../App';

interface ItemPackagesPageProps {
    packages: ItemPackage[];
    setPackages: React.Dispatch<React.SetStateAction<ItemPackage[]>>;
}

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


export const ItemPackagesPage: React.FC<ItemPackagesPageProps> = ({ packages, setPackages }) => {
    const [newPackageName, setNewPackageName] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const handleAddItem = () => {
        const price = parseFloat(newItemPrice);
        if (newItemName && newItemDescription && !isNaN(price) && price > 0) {
            setItems([...items, { name: newItemName, description: newItemDescription, price }]);
            setNewItemName('');
            setNewItemDescription('');
            setNewItemPrice('');
        } else {
            alert('Please enter a valid item name, description, and price.');
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    }

    const handleSavePackage = () => {
        if (newPackageName && items.length > 0) {
            const newPackage: ItemPackage = {
                id: new Date().toISOString(),
                name: newPackageName,
                items: items,
            };
            setPackages([...packages, newPackage]);
            // Reset form
            setNewPackageName('');
            setItems([]);
        } else {
            alert('Please enter a package name and add at least one item.');
        }
    };

    const handleDeletePackage = (id: string) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            setPackages(packages.filter(pkg => pkg.id !== id));
        }
    };

    const total = items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Create Package Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Create a New Package</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="packageName" className="block text-sm font-medium text-gray-600 mb-2">Package Name</label>
                        <input
                            type="text"
                            id="packageName"
                            value={newPackageName}
                            onChange={(e) => setNewPackageName(e.target.value)}
                            placeholder="e.g., Premium Web Design Package"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3"
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Items to Package</h3>
                        <div className="space-y-3">
                           <div className="flex-grow">
                                <label htmlFor="itemName" className="block text-sm font-medium text-gray-600 mb-1">Item Name</label>
                                <input type="text" id="itemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g., 5-Page Website" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2" />
                            </div>
                             <div className="flex-grow">
                                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-600 mb-1">Item Description</label>
                                <input type="text" id="itemDescription" value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} placeholder="e.g., Includes Home, About, Services..." className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2" />
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="w-32">
                                    <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-600 mb-1">Price (R)</label>
                                    <input type="number" id="itemPrice" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="e.g., 5000" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2" />
                                </div>
                                <button onClick={handleAddItem} className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 h-10"><PlusIcon /></button>
                            </div>
                        </div>
                    </div>
                    
                    {items.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                             {items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                                    <div>
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <p className="font-medium text-gray-800">R {item.price.toFixed(2)}</p>
                                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-3 mt-3">
                                <p>Total</p>
                                <p>R {total.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSavePackage}
                        className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700"
                    >
                        Save Package
                    </button>
                </div>
            </div>

            {/* Existing Packages */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Existing Packages</h2>
                <div className="space-y-4">
                    {packages.length === 0 ? (
                        <p className="text-gray-500">You haven't created any packages yet. Use the form on the left to get started.</p>
                    ) : (
                        packages.map(pkg => {
                            const pkgTotal = pkg.items.reduce((sum, item) => sum + item.price, 0);
                            return (
                                <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-lg text-indigo-700">{pkg.name}</h3>
                                        <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                    </div>
                                    <div className="space-y-2">
                                        {pkg.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-start text-sm">
                                                <div>
                                                    <p className="font-semibold text-gray-700">{item.name}</p>
                                                    <p className="text-gray-500 pl-2">{item.description}</p>
                                                </div>
                                                <p className="font-medium text-gray-800 whitespace-nowrap">R {item.price.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-right font-bold mt-3 border-t pt-2">Total: R {pkgTotal.toFixed(2)}</p>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
};