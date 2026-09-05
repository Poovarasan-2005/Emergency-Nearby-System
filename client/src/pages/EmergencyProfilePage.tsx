import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Lock, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';

export const EmergencyProfilePage: React.FC = () => {
  const { emergencyProfile, updateEmergencyProfile } = useEmergency();

  const [bloodGroup, setBloodGroup] = useState(emergencyProfile.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(emergencyProfile.allergies || '');
  const [medications, setMedications] = useState(emergencyProfile.medications || '');
  const [medicalConditions, setMedicalConditions] = useState(emergencyProfile.medicalConditions || '');
  const [emergencyNote, setEmergencyNote] = useState(emergencyProfile.emergencyNote || '');
  const [preferredLanguage, setPreferredLanguage] = useState(emergencyProfile.preferredLanguage || 'English');
  const [organDonor, setOrganDonor] = useState(emergencyProfile.organDonor ?? true);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmergencyProfile({
      bloodGroup,
      allergies,
      medications,
      medicalConditions,
      emergencyNote,
      preferredLanguage,
      organDonor,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Confidential Emergency Medical Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Voluntary information provided for critical first responders during an active incident.
          </p>
        </div>
      </div>

      {/* Strict Privacy Shield Warning */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 my-6 flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">HIPAA & Privacy Architecture Protection:</span>
          This data is stored encrypted and confidential. It is <strong>never displayed on public tracking links</strong> and is accessible only to your authenticated device or verified attending emergency medical personnel.
        </div>
      </div>

      {savedNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Emergency medical profile updated and saved securely!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Preferred Spoken Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Mandarin', 'Portuguese', 'Japanese'].map(
                (lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Severe Allergies (e.g. Penicillin, Latex, Peanuts, Bee Stings)
          </label>
          <input
            type="text"
            placeholder="e.g. Penicillin, Tree Nuts"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Current Daily Medications
          </label>
          <input
            type="text"
            placeholder="e.g. Albuterol inhaler, Metformin 500mg, Lisinopril"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Chronic Medical Conditions (e.g. Asthma, Diabetes Type 1, Epilepsy, Pacemaker)
          </label>
          <input
            type="text"
            placeholder="e.g. Type 2 Diabetes, Mild Hypertension"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Critical Emergency Note for First Responders
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Epipen in backpack front pouch. Deaf in left ear. Emergency contact speaks Spanish."
            value={emergencyNote}
            onChange={(e) => setEmergencyNote(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="organDonor"
            checked={organDonor}
            onChange={(e) => setOrganDonor(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-rose-600 focus:ring-rose-500 focus:ring-offset-slate-900 bg-slate-950"
          />
          <label htmlFor="organDonor" className="text-xs font-medium text-slate-300 cursor-pointer">
            Registered Organ Donor
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-900/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Emergency Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
