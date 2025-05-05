import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const Footer = () => {
  const [language, setLanguage] = useState('English');
  
  // Detect country based on browser locale
  const country = new Intl.DisplayNames(['en'], { type: 'region' })
    .of(navigator.language.split('-')[1] || 'US') || 'India';

  const footerLinks = [
    [
      { name: 'FAQ', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Account', href: '#' },
      { name: 'Media Center', href: '#' },
    ],
    [
      { name: 'Investor Relations', href: '#' },
      { name: 'Jobs', href: '#' },
      { name: 'Redeem Gift Cards', href: '#' },
      { name: 'Buy Gift Cards', href: '#' },
    ],
    [
      { name: 'Ways to Watch', href: '#' },
      { name: 'Terms of Use', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Cookie Preferences', href: '#' },
    ],
    [
      { name: 'Corporate Information', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Speed Test', href: '#' },
      { name: 'Legal Notices', href: '#' },
    ]
  ];

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <footer className="w-full bg-[#141414] border-t border-[#333] mt-12 sm:mt-16 py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8 lg:px-16 text-[#757575]">
      <div className="max-w-7xl mx-auto">
        {/* Footer top section - social links or contact info */}
        <div className="mb-5 sm:mb-8">
          <p className="text-sm">
            Questions? Call <a href="tel:1-844-505-2993" className="hover:underline">1-844-505-2993</a>
          </p>
        </div>

        {/* Main footer links section - adjusts to 1-4 columns based on screen size */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-4 sm:gap-y-6">
          {footerLinks.map((column, columnIndex) => (
            <div key={`column-${columnIndex}`} className={`flex flex-col space-y-3 ${columnIndex >= 2 ? 'col-span-1' : ''}`}>
              {column.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-xs md:text-sm hover:text-[#e5e5e5] transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 focus:ring-offset-[#141414] rounded"
                >
                  {link.name}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Language selector and copyright - made mobile-friendly */}
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div className="relative inline-flex items-center border border-[#333] rounded overflow-hidden">
            <div className="absolute left-2 pointer-events-none text-[#757575]">
              <Globe size={16} />
            </div>
            <label htmlFor="language-selector" className="sr-only">Select Language</label>
            <select
              id="language-selector"
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none bg-[#141414] text-xs sm:text-sm py-1.5 pl-8 pr-8 text-[#757575] focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer rounded min-w-[120px]"
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 pointer-events-none" />
          </div>

          <div className="text-xs sm:text-sm">
            <p className="font-medium">Netflix {country}</p>
            <p className="mt-2 sm:mt-3">&copy; {new Date().getFullYear()} Netflix, Inc.</p>
          </div>
        </div>

        {/* Mobile-optimized attribution */}
        <div className="mt-5 sm:mt-6 text-[10px] sm:text-xs opacity-60">
          <p className="font-light">Created for a hackathon project inspired by Netflix</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 