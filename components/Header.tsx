import React, { useRef } from 'react';

type Page = 'generator' | 'packages' | 'clients' | 'dashboard' | 'companyProfile';

interface HeaderProps {
  setPage: (page: Page) => void;
  currentPage: Page;
  companyLogo: string | null;
  setCompanyLogo: React.Dispatch<React.SetStateAction<string | null>>;
  onDocuments: () => void;
  onImport: () => void;
}

const navItems: Array<{ label: string; page: Page; mark: string }> = [
  { label: 'Documents', page: 'generator', mark: 'D' },
  { label: 'Dashboard', page: 'dashboard', mark: 'O' },
  { label: 'Clients', page: 'clients', mark: 'C' },
  { label: 'Services & packages', page: 'packages', mark: 'S' },
  { label: 'Company profile', page: 'companyProfile', mark: 'P' },
];

export const Header: React.FC<HeaderProps> = ({ setPage, currentPage, companyLogo, setCompanyLogo, onDocuments, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCompanyLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <aside className="app-rail">
      <div className="rail-brand">
        <div className="brand-signal">B</div>
        <div>
          <div className="brand-name">Brief Doc X</div>
          <div className="brand-caption">Business document studio</div>
        </div>
      </div>

      <button className="rail-create" onClick={onDocuments}>
        <span className="rail-create-plus">+</span>
        <span>New document</span>
      </button>

      <div className="rail-label">Workspace</div>
      <nav className="rail-nav" aria-label="Primary navigation">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => { setPage(item.page); if (item.page === 'generator') onDocuments(); }}
            className={`rail-link ${currentPage === item.page ? 'is-active' : ''}`}
          >
            <span className="rail-link-mark" aria-hidden="true">{item.mark}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="rail-spacer" />
      <button className="rail-secondary" onClick={onImport}><span className="rail-link-mark" aria-hidden="true">↥</span>Import existing data</button>

      <div className="rail-profile">
        <div className="profile-avatar">
          {companyLogo ? <img src={companyLogo} alt="Company logo" /> : <span>BD</span>}
        </div>
        <div className="profile-copy">
          <span className="profile-name">Shared workspace</span>
          <span className="profile-status"><i /> Development mode</span>
        </div>
        <button className="profile-menu" aria-label="Upload company logo" onClick={() => fileInputRef.current?.click()}>•••</button>
        <input ref={fileInputRef} type="file" onChange={handleLogoUpload} accept="image/png, image/jpeg, image/svg+xml, image/gif" className="sr-only" />
      </div>
      {companyLogo && <button className="rail-remove-logo" onClick={() => setCompanyLogo(null)}>Remove logo</button>}
    </aside>
  );
};
