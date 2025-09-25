import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">MediConnect AI</span>
            </div>
            <p className="text-gray-300 mb-4">
              Bridging healthcare gaps through technology. AI-powered telemedicine platform for accessible healthcare.
            </p>
            <p className="text-sm text-gray-400">
              © 2025 MediConnect AI. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li><button className="text-gray-300 hover:text-white text-left">For Patients</button></li>
              <li><button className="text-gray-300 hover:text-white text-left">For Providers</button></li>
              <li><button className="text-gray-300 hover:text-white text-left">Features</button></li>
              <li><button className="text-gray-300 hover:text-white text-left">Pricing</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li><button className="text-gray-300 hover:text-white text-left">Help Center</button></li>
              <li><button className="text-gray-300 hover:text-white text-left">Contact Us</button></li>
              <li><button className="text-gray-300 hover:text-white text-left">Privacy Policy</button></li>
              <li><button className="text-gray-300 hover:text-white text-left">Terms of Service</button></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
