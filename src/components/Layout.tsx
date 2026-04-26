import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, Database, Info, UserPlus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Clinic Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Register Volunteer', path: '/register', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">Clini<span className="text-blue-600">Match</span></span>
          </Link>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  location.pathname === item.path ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Prototype v1.0 • Built for Community Health</p>
        </div>
      </footer>
    </div>
  );
}

