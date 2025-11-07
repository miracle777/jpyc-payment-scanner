'use client';

import { motion } from 'framer-motion';
import { QrCode, Wallet, History } from 'lucide-react';

type Tab = 'scan' | 'wallet' | 'history';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'scan', label: 'スキャン', icon: QrCode },
    { id: 'wallet', label: 'ウォレット', icon: Wallet },
    { id: 'history', label: '履歴', icon: History },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg -z-10"
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}