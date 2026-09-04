'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X, Camera, MapPin, Mail, Phone, ShieldCheck, CheckCircle2,
  Edit3, Save, Upload, User as UserIcon, Sparkles, LogOut, Check
} from 'lucide-react';

interface CitizenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

const PRESET_AVATARS = [
  { id: 'av-1', name: 'Citizen Leader', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-2', name: 'Eco Defender', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-3', name: 'Youth Innovator', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'av-4', name: 'Urban Guardian', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
];

export const CitizenProfileModal: React.FC<CitizenProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenLoginModal
}) => {
  const { user, updateProfile, logout } = useAuth();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(
    user?.address || 'Flat 402, Shanti Vihar, Harmu Housing Colony, Ranchi, Jharkhand - 834002'
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Rohan Mahato');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setAddressInput(user.address || 'Flat 402, Shanti Vihar, Harmu Housing Colony, Ranchi, Jharkhand - 834002');
      setNameInput(user.name || 'Rohan Mahato');
    }
  }, [user]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveAddress = () => {
    if (!addressInput.trim()) {
      showToast('Address cannot be empty.');
      return;
    }
    updateProfile({ address: addressInput.trim() });
    setIsEditingAddress(false);
    showToast('✓ Full address saved to official citizen record!');
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    updateProfile({ name: nameInput.trim() });
    setIsEditingName(false);
    showToast('✓ Profile name updated successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      updateProfile({ avatar_url: base64Data });
      setIsUploadingPhoto(false);
      showToast('✓ New profile image added successfully!');
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      showToast('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url: string) => {
    updateProfile({ avatar_url: url });
    showToast('✓ Profile photo updated!');
  };

  const currentAvatar = user?.avatar_url || '/logo.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal Container */}
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-emerald-950/40 overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header with decorative glow */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Citizen Civic Profile
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  Verified Identity
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Citizen Registration • Jharkhand Societal Grievance Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
          {/* Section 1: Images & Photo Management */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                Profile Photo & Civic Badges
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Add New Image</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Main Avatar display with glow */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/20 bg-slate-800 flex items-center justify-center relative">
                  <img
                    src={currentAvatar}
                    alt={user?.name || 'Citizen Avatar'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Overlay camera button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mb-1 text-emerald-400" />
                    Change Image
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg cursor-pointer"
                  title="Upload new image"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload file triggers & preset avatars */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingPhoto ? 'Uploading...' : 'Upload New Image'}
                  </button>
                  <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</span>
                </div>

                {/* Preset Avatar Gallery */}
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold mb-1.5">Or select a Civic Avatar badge:</div>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(av.url)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border transition-all ${
                          currentAvatar === av.url
                            ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-105'
                            : 'border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Full Address (Editable) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Full Address (Editable)
              </span>
              {!isEditingAddress ? (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Address
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddressInput(user?.address || '');
                      setIsEditingAddress(false);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    Save Address
                  </button>
                </div>
              )}
            </div>

            {isEditingAddress ? (
              <div className="space-y-2 mt-2">
                <textarea
                  rows={3}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none font-medium leading-relaxed"
                  placeholder="Enter your street, house number, landmark, district, state and PIN code..."
                />
                <p className="text-[10px] text-slate-400">
                  Tip: A verified residential address accelerates grievance dispatch to your local Panchayat / Ward engineer.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
                {user?.address || 'No address specified yet. Click "Edit Address" to add your residential address.'}
              </div>
            )}
          </div>

          {/* Section 3: Verified User Information (Name, Email OTP, Mobile OTP) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              Citizen Identification & Contacts
            </span>

            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400 font-medium">Full Name</span>
                {!isEditingName ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="text-[11px] text-emerald-400 font-bold"
                  >
                    Save
                  </button>
                )}
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-emerald-500/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-white bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                  {user?.name || 'Rohan Mahato'}
                </div>
              )}
            </div>

            {/* Email with OTP verified badge */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Email ID</span>
              <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-white font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email || 'citizen@satark.gov.in'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified with OTP
                </span>
              </div>
            </div>

            {/* Mobile with OTP verified badge */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Mobile Number</span>
              <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-white font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.mobile || '+91 98765 43210'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified with OTP
                </span>
              </div>
            </div>

            {/* Civic Trust & Contributions Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-base font-extrabold text-white">4</div>
                <div className="text-[10px] text-slate-400">Issues Filed</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-base font-extrabold text-emerald-400">3</div>
                <div className="text-[10px] text-slate-400">Resolved</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-base font-extrabold text-cyan-400">98%</div>
                <div className="text-[10px] text-slate-400">Civic Trust</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenLoginModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Switch / Sign In
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
