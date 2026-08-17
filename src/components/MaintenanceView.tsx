import React, { useState } from 'react';
import { MaintenanceRequest, MaintenanceCategory, MaintenancePriority, User, Property } from '../types';
import { 
  Wrench, 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  X, 
  MessageSquare, 
  Send, 
  UserCheck, 
  DollarSign, 
  Image as ImageIcon,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MaintenanceViewProps {
  tickets: MaintenanceRequest[];
  properties: Property[];
  currentUser: User | null;
  onCreateTicket: (data: any) => Promise<void>;
  onUpdateTicket: (ticketId: string, updates: Partial<MaintenanceRequest>) => Promise<void>;
  onAddComment: (ticketId: string, message: string) => Promise<void>;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  tickets,
  properties,
  currentUser,
  onCreateTicket,
  onUpdateTicket,
  onAddComment
}) => {
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Create Form State
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('PLUMBING');
  const [priority, setPriority] = useState<MaintenancePriority>('MEDIUM');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800');
  const [submitting, setSubmitting] = useState(false);

  // Chat message in selected ticket
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Landlord resolution state
  const [assignedVendor, setAssignedVendor] = useState('');
  const [costInput, setCostInput] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  const filteredTickets = tickets.filter(t => {
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !propertyId) {
      alert('Please fill in title, description, and select a property');
      return;
    }
    setSubmitting(true);
    try {
      await onCreateTicket({
        propertyId,
        title,
        description,
        category,
        priority,
        images: photoUrl ? [photoUrl] : []
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      confetti({ particleCount: 50, spread: 60 });
    } catch (err: any) {
      alert(err.message || 'Failed to submit maintenance ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await onAddComment(selectedTicket.id, replyMessage.trim());
      setReplyMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send comment');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusUpdate = async (newStatus: MaintenanceRequest['status']) => {
    if (!selectedTicket) return;
    try {
      await onUpdateTicket(selectedTicket.id, {
        status: newStatus,
        assignedTo: assignedVendor || undefined,
        cost: costInput ? Number(costInput) : undefined,
        resolutionNotes: resolutionNotes || undefined
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'EMERGENCY':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-600 text-white animate-pulse">Emergency</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">High Priority</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">Medium</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const getStatusBadge = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Ticket Open</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full"><Wrench className="w-3 h-3" /> Technician Dispatched</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">Closed</span>;
    }
  };

  // Keep selectedTicket sync with updated tickets list
  const activeTicket = selectedTicket ? tickets.find(t => t.id === selectedTicket.id) || selectedTicket : null;

  return (
    <div id="maintenance-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance & Repairs Service Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Log repair tickets, track technician dispatches, and communicate in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Maintenance Request</span>
        </button>
      </div>

      {/* Main Grid: Ticket List + Selected Ticket Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="HVAC">HVAC & Heating</option>
              <option value="APPLIANCE">Appliances</option>
              <option value="STRUCTURAL">Structural</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No maintenance requests found.
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                  activeTicket?.id === ticket.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(ticket.priority)}
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      activeTicket?.id === ticket.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.category}
                    </span>
                  </div>
                  <div>{getStatusBadge(ticket.status)}</div>
                </div>

                <h3 className={`font-bold text-sm line-clamp-1 ${activeTicket?.id === ticket.id ? 'text-white' : 'text-slate-900'}`}>
                  {ticket.title}
                </h3>
                <p className={`text-xs mt-1 line-clamp-2 ${activeTicket?.id === ticket.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {ticket.description}
                </p>

                <div className={`mt-3 pt-2.5 border-t text-[11px] flex items-center justify-between ${
                  activeTicket?.id === ticket.id ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'
                }`}>
                  <span className="line-clamp-1">{ticket.propertyTitle}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Ticket Inspection & Discussion Pane */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full min-h-[580px]">
              
              {/* Top Banner */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {getPriorityBadge(activeTicket.priority)}
                    <span className="text-xs font-mono text-slate-400 font-medium">Ticket #{activeTicket.id.slice(0, 8)}</span>
                    {getStatusBadge(activeTicket.status)}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{activeTicket.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeTicket.propertyTitle} • Logged by {activeTicket.tenantName}</p>
                </div>

                {/* Status change actions for Owner/Admin */}
                {isOwnerOrAdmin && (
                  <div className="flex flex-col gap-1.5 items-end">
                    {activeTicket.status === 'OPEN' && (
                      <button
                        onClick={() => handleStatusUpdate('IN_PROGRESS')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Dispatch Technician
                      </button>
                    )}
                    {activeTicket.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusUpdate('RESOLVED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    {activeTicket.status === 'RESOLVED' && (
                      <button
                        onClick={() => handleStatusUpdate('CLOSED')}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Description Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Description</h4>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{activeTicket.description}</p>
                  
                  {activeTicket.images && activeTicket.images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {activeTicket.images.map((img, i) => (
                        <div key={i} className="w-24 h-16 rounded-xl overflow-hidden border border-slate-300">
                          <img src={img} alt="issue" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dispatch & Cost Details */}
                {(activeTicket.assignedTo || activeTicket.cost || activeTicket.resolutionNotes) && (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Resolution & Vendor Report</h4>
                    {activeTicket.assignedTo && (
                      <p className="text-emerald-900"><strong>Contractor:</strong> {activeTicket.assignedTo}</p>
                    )}
                    {activeTicket.cost !== undefined && (
                      <p className="text-emerald-900"><strong>Repair Cost:</strong> ${activeTicket.cost.toLocaleString()}</p>
                    )}
                    {activeTicket.resolutionNotes && (
                      <p className="text-emerald-900"><strong>Resolution Notes:</strong> {activeTicket.resolutionNotes}</p>
                    )}
                  </div>
                )}

                {/* Live Message Thread */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" /> Communication Log ({activeTicket.comments.length})
                  </h4>

                  {activeTicket.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No messages in this ticket yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {activeTicket.comments.map(c => (
                        <div
                          key={c.id}
                          className={`p-3 rounded-2xl text-xs max-w-lg ${
                            c.userId === currentUser?.id
                              ? 'bg-slate-900 text-white ml-auto rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 mr-auto rounded-tl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-semibold">
                            <span>{c.userName} ({c.userRole})</span>
                            <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="leading-snug">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Post update or response to ticket..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 h-full flex flex-col items-center justify-center">
              <Wrench className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Select a Maintenance Ticket</h3>
              <p className="text-xs text-slate-500 mt-1">View resolution history, contractor assignment, and live chat logs.</p>
            </div>
          )}
        </div>

      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div id="new-maintenance-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">New Maintenance Request</h3>
                <p className="text-xs text-slate-500">Report an issue for property management review</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.address})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Bathroom Shower Drain Slow"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="HVAC">HVAC & Heating</option>
                    <option value="APPLIANCE">Appliance</option>
                    <option value="STRUCTURAL">Structural</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Priority</option>
                    <option value="EMERGENCY">Emergency (Leak / Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when the issue started and any troubleshooting steps..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Attachment URL (Optional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Photo image URL..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Dispatch Request'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
