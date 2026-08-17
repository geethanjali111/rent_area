import React, { useState } from 'react';
import { User, Notification } from '../types';
import { 
  Building2, 
  Search, 
  Heart, 
  Calendar, 
  FileText, 
  CreditCard, 
  Wrench, 
  ShieldCheck, 
  Bell, 
  Plus, 
  CheckCheck,
  ExternalLink,
  Users,
  LayoutDashboard,
  ClipboardCheck,
  History
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  shortlistCount: number;
  onOpenAddProperty: () => void;
  onNotificationClick: (notif: Notification) => void;
  onMarkAllNotifsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  notifications,
  shortlistCount,
  onOpenAddProperty,
  onNotificationClick,
  onMarkAllNotifsRead
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const role = currentUser?.role || 'TENANT';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">RentMate</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Rental Management Platform</p>
            </div>
          </div>

          {/* Navigation Links based on Role */}
          <nav className="hidden md:flex items-center gap-1">
            {role === 'TENANT' && (
              <>
                <button
                  id="nav-explore"
                  onClick={() => setActiveTab('explore')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'explore' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Explore Properties
                </button>
                <button
                  id="nav-shortlist"
                  onClick={() => setActiveTab('shortlist')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer relative ${
                    activeTab === 'shortlist' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Shortlist
                  {shortlistCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                      {shortlistCount}
                    </span>
                  )}
                </button>
                <button
                  id="nav-visits"
                  onClick={() => setActiveTab('visits')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'visits' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  My Visits
                </button>
                <button
                  id="nav-applications"
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'applications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Applications
                </button>
                <button
                  id="nav-leases"
                  onClick={() => setActiveTab('leases')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'leases' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Leases & Rent
                </button>
                <button
                  id="nav-maintenance"
                  onClick={() => setActiveTab('maintenance')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'maintenance' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Maintenance
                </button>
              </>
            )}

            {role === 'OWNER' && (
              <>
                <button
                  id="nav-owner-dashboard"
                  onClick={() => setActiveTab('owner_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'owner_dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Properties & Stats
                </button>
                <button
                  id="nav-explore"
                  onClick={() => setActiveTab('explore')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'explore' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Marketplace View
                </button>
                <button
                  id="nav-applications"
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'applications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Applications
                </button>
                <button
                  id="nav-visits"
                  onClick={() => setActiveTab('visits')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'visits' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Tour Requests
                </button>
                <button
                  id="nav-leases"
                  onClick={() => setActiveTab('leases')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'leases' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Leases
                </button>
                <button
                  id="nav-payments"
                  onClick={() => setActiveTab('payments')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'payments' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Payments & Income
                </button>
                <button
                  id="nav-maintenance"
                  onClick={() => setActiveTab('maintenance')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'maintenance' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Maintenance
                </button>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <button
                  id="nav-admin-dashboard"
                  onClick={() => setActiveTab('admin_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'admin_dashboard' ? 'bg-purple-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  Platform Admin
                </button>
                <button
                  id="nav-explore"
                  onClick={() => setActiveTab('explore')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'explore' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  All Listings
                </button>
                <button
                  id="nav-applications"
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'applications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  All Applications
                </button>
                <button
                  id="nav-leases"
                  onClick={() => setActiveTab('leases')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'leases' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Tenancies
                </button>
                <button
                  id="nav-payments"
                  onClick={() => setActiveTab('payments')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'payments' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Financial Records
                </button>
                <button
                  id="nav-maintenance"
                  onClick={() => setActiveTab('maintenance')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'maintenance' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Maintenance
                </button>
              </>
            )}
          </nav>

          {/* Right Action Elements */}
          <div className="flex items-center gap-3">
            
            {/* Add Property Button (Owners & Admins) */}
            {(role === 'OWNER' || role === 'ADMIN') && (
              <button
                id="add-property-nav-btn"
                onClick={onOpenAddProperty}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>List Property</span>
              </button>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {notifOpen && (
                <div 
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotifsRead}
                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onNotificationClick(n);
                            setNotifOpen(false);
                          }}
                          className={`p-3 text-left transition cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                            !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !n.read ? 'bg-blue-600' : 'bg-transparent'
                          }`} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{currentUser.role}</p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
