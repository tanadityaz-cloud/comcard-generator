import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  LayoutGrid,
  Sparkles,
  Settings,
  Award,
  Contact,
  Crown,
  HardDrive,
  ExternalLink,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'orland-showcase'
  | 'my-comcards'
  | 'templates'
  | 'google-drive'
  | 'brand-kit'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenUpgrade: () => void;
  className?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpgrade,
  className = '',
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orland-showcase' as NavTab, label: 'Orland Showcase', icon: Crown, highlight: true },
    { id: 'my-comcards' as NavTab, label: 'My Comcards', icon: CreditCard },
    { id: 'templates' as NavTab, label: 'Templates', icon: LayoutGrid },
    { id: 'google-drive' as NavTab, label: 'Google Drive Cloud', icon: HardDrive },
    { id: 'brand-kit' as NavTab, label: 'Brand Kit Orland', icon: Sparkles },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-screen flex flex-col py-8 px-4 z-40 bg-white border-r border-[#E7E5E0] w-64 transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-10 h-10 rounded-lg bg-[#171717] flex items-center justify-center text-[#D4A737] shadow-sm">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-[0.2em] text-[#171717] leading-tight">
              ORLAND
            </div>
            <div className="text-[9px] font-bold tracking-[0.2em] text-[#A38220] mt-0.5">
              MANAGEMENT & COMPS
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#171717] text-white shadow-sm font-semibold scale-[0.98]'
                    : 'text-[#5E5E5E] hover:bg-[#F5F4F0] hover:text-[#171717]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? 'text-[#D4A737]'
                        : item.highlight
                        ? 'text-[#C9A227]'
                        : 'text-[#6B6B6B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="text-[9px] bg-[#FAF3DC] text-[#A38220] font-bold px-1.5 py-0.5 rounded-md font-mono">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 100% Free Badge Card */}
        <div className="mt-auto pt-6 px-1">
          <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#C8E6C9] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold tracking-wider text-emerald-900 uppercase">100% Free App</span>
            </div>
            <p className="text-[12px] text-emerald-800 mb-3.5 leading-relaxed font-medium">
              All templates, brand kit, and 300 DPI exports are 100% free forever!
            </p>
            <button
              onClick={onOpenUpgrade}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2 rounded-lg text-xs transition-colors shadow-xs active:scale-[0.99]"
            >
              See Free Features
            </button>
          </div>

          {/* Open in new tab link */}
          <button
            onClick={() => window.open(window.location.href, '_blank')}
            className="w-full mt-2 py-2 px-3 flex items-center justify-center gap-2 text-[11px] font-medium text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F5F4F0] rounded-lg transition-colors"
            title="Buka di tab browser baru untuk otorisasi Google tanpa batas"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Buka di Tab Baru</span>
          </button>
        </div>
      </nav>
    </>
  );
};
