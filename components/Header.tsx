import React, { useRef } from 'react';

interface HeaderProps {
    setPage: (page: 'generator' | 'packages' | 'clients' | 'dashboard' | 'companyProfile') => void;
    currentPage: 'generator' | 'packages' | 'clients' | 'dashboard' | 'companyProfile';
    companyLogo: string | null;
    setCompanyLogo: React.Dispatch<React.SetStateAction<string | null>>;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({ setPage, currentPage, companyLogo, setCompanyLogo }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
            {/* Logo */}
            <div className="bg-indigo-100 p-2 rounded-lg border border-indigo-200 mr-4 h-14 w-14 flex items-center justify-center">
                {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
                    </svg>
                )}
            </div>

            {/* Title and Logo Actions */}
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">BizDoc AI</h1>
                <p className="text-sm text-gray-500">Your Intelligent Business Agreement Generator</p>
                 <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png, image/jpeg, image/svg+xml, image/gif"
                      className="hidden"
                    />
                    <button onClick={triggerFileUpload} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                        Upload Logo
                    </button>
                    {companyLogo && (
                        <>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setCompanyLogo(null)} className="text-xs font-medium text-red-500 hover:text-red-700">
                                Remove
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <NavButton onClick={() => setPage('generator')} isActive={currentPage === 'generator'}>
                Generator
            </NavButton>
             <NavButton onClick={() => setPage('dashboard')} isActive={currentPage === 'dashboard'}>
                Dashboard
            </NavButton>
            <NavButton onClick={() => setPage('packages')} isActive={currentPage === 'packages'}>
                Packages
            </NavButton>
            <NavButton onClick={() => setPage('clients')} isActive={currentPage === 'clients'}>
                Clients
            </NavButton>
            <NavButton onClick={() => setPage('companyProfile')} isActive={currentPage === 'companyProfile'}>
                Company Profile
            </NavButton>
        </nav>
      </div>
    </header>
  );
};