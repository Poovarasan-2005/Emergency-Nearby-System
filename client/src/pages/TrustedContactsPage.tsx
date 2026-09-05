import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Send,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import { ContactPriority, TrustedContact } from '../types/emergency.types';

export const TrustedContactsPage: React.FC = () => {
  const {
    trustedContacts,
    addTrustedContact,
    updateTrustedContact,
    deleteTrustedContact,
    testAlertContact,
  } = useEmergency();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [testAlertNotice, setTestAlertNotice] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState<ContactPriority>('primary');
  const [notifyBySms, setNotifyBySms] = useState(true);

  const resetForm = () => {
    setName('');
    setRelationship('Family');
    setPhone('');
    setEmail('');
    setPriority('primary');
    setNotifyBySms(true);
    setEditingContact(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: TrustedContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setPriority(contact.priority);
    setNotifyBySms(contact.notifyBySms);
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingContact) {
      updateTrustedContact(editingContact.id, {
        name,
        relationship,
        phone,
        email,
        priority,
        notifyBySms,
      });
    } else {
      addTrustedContact({
        name,
        relationship,
        phone,
        email,
        priority,
        notifyBySms,
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleTestAlert = (contact: TrustedContact) => {
    const res = testAlertContact(contact);
    setTestAlertNotice(res.message);
    setTimeout(() => setTestAlertNotice(null), 5000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trusted Emergency Contacts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Designate family and friends who will automatically receive your GPS pinpoint during SOS activation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 py-3 px-5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-rose-900/30 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Test Notice Toast */}
      {testAlertNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{testAlertNotice}</span>
        </div>
      )}

      {/* Privacy Guarantee Box */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 mb-8 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Minimal-Disclosure Safety Standard:</span>
          Emergency notifications contain only your name, timestamp, and a secure temporary location link. Medical history, private notes, and account details are never shared via SMS or emails.
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trustedContacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-white">{contact.name}</span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        contact.priority === 'primary'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {contact.priority}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Relationship: <strong className="text-slate-200">{contact.relationship}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTrustedContact(contact.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 py-3 border-y border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono truncate">{contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Notification Trigger */}
            <button
              onClick={() => handleTestAlert(contact)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Send Test Emergency Alert</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter valid contact numbers equipped to receive urgent SMS notifications.
            </p>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Sanchez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Partner">Partner / Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Doctor / Physician</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ContactPriority)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number (SMS Enabled)</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
