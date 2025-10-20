import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../App';

interface CompanyProfilePageProps {
    profile: CompanyProfile;
    setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);


export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ profile, setProfile }) => {
    const [formData, setFormData] = useState<CompanyProfile>(profile);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
                <p className="text-gray-600 mb-6">This information will be used to automatically populate your generated documents.</p>
                
                <form onSubmit={handleSave} className="space-y-8">
                    {/* Company Details */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-600 mb-2">Company Name</label>
                                <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-2">Company Address</label>
                                <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                                    <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Representative */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Representative</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="repName" className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                                <input type="text" name="repName" id="repName" value={formData.repName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div>
                                <label htmlFor="repTitle" className="block text-sm font-medium text-gray-600 mb-2">Position / Title</label>
                                <input type="text" name="repTitle" id="repTitle" value={formData.repTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                        </div>
                    </div>

                    {/* Banking Details */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Banking Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-600 mb-2">Bank Name</label>
                                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div>
                                <label htmlFor="accountName" className="block text-sm font-medium text-gray-600 mb-2">Account Name</label>
                                <input type="text" name="accountName" id="accountName" value={formData.accountName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                             <div>
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-600 mb-2">Account Number</label>
                                <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div>
                                <label htmlFor="branchCode" className="block text-sm font-medium text-gray-600 mb-2">Branch Code</label>
                                <input type="text" name="branchCode" id="branchCode" value={formData.branchCode} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div>
                                <label htmlFor="accountType" className="block text-sm font-medium text-gray-600 mb-2">Account Type</label>
                                <input type="text" name="accountType" id="accountType" value={formData.accountType} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                            <div>
                                <label htmlFor="swiftCode" className="block text-sm font-medium text-gray-600 mb-2">Swift Code</label>
                                <input type="text" name="swiftCode" id="swiftCode" value={formData.swiftCode} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="w-full sm:w-auto flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                        >
                             {saved ? (
                                <>
                                    <CheckIcon className="mr-2" />
                                    <span>Saved!</span>
                                </>
                            ) : (
                                'Save Company Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};