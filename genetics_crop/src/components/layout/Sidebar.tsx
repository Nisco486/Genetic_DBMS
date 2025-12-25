import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Database,
  Upload,
  Users,
  Settings,
  LineChart,
  Leaf,
  FlaskConical,
  CloudSun,
  FileSpreadsheet,
  Brain,
  ChevronLeft,
  Dna,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const adminLinks = [
  { icon: LayoutDashboard, label: 'Admin Terminal', href: '/admin/dashboard' },
  { icon: Database, label: 'Records Management', href: '/admin/data-management' },
  { icon: LineChart, label: 'System Health', href: '/admin/monitoring' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const userLinks = [
  { icon: Brain, label: 'Prediction Workspace', href: '/dashboard' },
  { icon: FileSpreadsheet, label: 'Research Reports', href: '/dashboard/reports' },
  { icon: Database, label: 'Data Explorer', href: '/dashboard/crops' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border",
          "flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <img src="/rvce-logo.png" alt="RVCE Logo" className="h-8 w-auto" />
          </Link>

          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 text-sidebar-foreground transition-transform duration-300",
              !isOpen && "rotate-180"
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "group relative",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <link.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                )} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Badge */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent",
            !isOpen && "justify-center px-0"
          )}>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
