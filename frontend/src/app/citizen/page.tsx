'use client';

/**
 * SATARK AI — Citizen & Community Portal Page
 * Author: Nature Hari (Citizen Portal Developer)
 * Features: Societal challenge submission, photo upload, GPS location capture,
 * AI classification preview, and 15-stage status tracking.
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Challenge } from '../../lib/types';
import { MapPin, Camera, AlertCircle, CheckCircle, Sparkles, Send, RefreshCw, Clock, UploadCloud, X, FileImage, Image as ImageIcon, Navigation, Compass } from 'lucide-react';
import { Timeline } from '../../components/Timeline';

const INDIAN_STATES_AND_UT = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function CitizenPortal() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(13.0827);
  const [lng, setLng] = useState(80.2707);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    setImageError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await api.getChallenges();
      setChallenges(data);
      if (data.length > 0 && !selectedChallenge) {
        setSelectedChallenge(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setImageError('Image proof is mandatory. Please drag & drop or browse an image file.');
      return;
    }
    if (!title || !description || !address || !district) return;

    setSubmitting(true);
    try {
      const formattedDistrict = state ? `${district}, ${state}` : district;
      const newCh = await api.createChallenge({
        title,
        citizen_description: description,
        district: formattedDistrict,
        address,
        latitude: lat,
        longitude: lng,
        image_url: imageUrl
      });

      setSuccessMsg(`Challenge '${newCh.title}' successfully submitted! AI Priority Score: ${newCh.priority_score}/100.`);
      setTitle('');
      setDescription('');
      setAddress('');
      handleRemoveImage();
      loadChallenges();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          // Reverse geocoding via OpenStreetMap Nominatim API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || '';
            const stateName = addr.state || '';
            const fullAddr = data.display_name || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

            setAddress(fullAddr);
            if (cityName) setDistrict(cityName);
            if (stateName) {
              const matchedState = INDIAN_STATES_AND_UT.find(
                (s) => s.toLowerCase() === stateName.toLowerCase() || stateName.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(stateName.toLowerCase())
              );
              if (matchedState) setState(matchedState);
            }
          } else {
            setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
          }
        } catch (e) {
          setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        alert('Could not fetch exact GPS location. Please enter your address manually in the address box.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="SATARK AI Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0" />
          <div>
            <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold uppercase mb-1">
              <MapPin className="w-3.5 h-3.5" /> Citizen & Community Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Report & Track Societal Challenges</h1>
            <p className="text-xs text-slate-400 mt-1">Submit real-world issues across India for AI evaluation and university/industry resolution.</p>
          </div>
        </div>
        <button
          onClick={loadChallenges}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Challenge Submission Form */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" /> Submit New Challenge
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Challenge Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Severe Water Contamination in Village Borewells"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Location & Address Section */}
            <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Location Details
                </label>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={detectingLocation}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold hover:bg-cyan-900/80 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Navigation className={`w-3 h-3 ${detectingLocation ? 'animate-spin' : ''}`} />
                  {detectingLocation ? 'Detecting Location...' : 'Detect My Location (GPS)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">State / UT *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {INDIAN_STATES_AND_UT.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">District / City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai, Mumbai, Ranchi, Bengaluru"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                  <span>Full Address / Landmark *</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Editable</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter street name, block, area, landmark, or village address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe the issue, affected population, safety risks, and location details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Upload Challenge Image <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-cyan-400 font-normal">Mandatory Photo Proof</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {!imageUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-5 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
                      : imageError
                      ? 'border-rose-500/80 bg-rose-950/20 hover:bg-slate-950'
                      : 'border-slate-800 bg-slate-950 hover:border-cyan-500/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                    <UploadCloud className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      Drag & Drop image here, or <span className="text-cyan-400 underline">Browse File</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WEBP (Mandatory)</p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                  <div className="relative group rounded-lg overflow-hidden max-h-48 flex items-center justify-center bg-black/40">
                    <img
                      src={imageUrl}
                      alt="Challenge proof preview"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-cyan-400" /> Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px] text-slate-300 font-medium">
                      {imageFile ? imageFile.name : 'Uploaded Photo'}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Mandatory Image Attached
                    </span>
                  </div>
                </div>
              )}

              {imageError && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {imageError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Analyze & Submit Challenge
                </>
              )}
            </button>
          </form>
        </div>

        {/* Track Submitted Challenges & Status Lifecycle */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Submitted Challenges Feed</h2>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChallenge(ch)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedChallenge?.id === ch.id
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{ch.id}</span>
                      <h3 className="text-sm font-bold text-white">{ch.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{ch.citizen_description}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Score: {ch.priority_score}/100
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">{ch.district}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Progress Tracker Drawer */}
          {selectedChallenge && (
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
              <div className="flex justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{selectedChallenge.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedChallenge.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedChallenge.title}</h3>
                  <p className="text-xs text-slate-400">{selectedChallenge.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">Severity: <strong className="text-amber-400">{selectedChallenge.severity}</strong></div>
                  <div className="text-xs font-mono text-slate-400">Category: <strong className="text-cyan-400">{selectedChallenge.category}</strong></div>
                </div>
              </div>

              {/* Lifecycle Progress Timeline */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Resolution Progression Lifecycle</h4>
                <Timeline currentStatus={selectedChallenge.status} />
              </div>

              {/* AI Reasoning Points */}
              {selectedChallenge.ai_reason && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Reasoning Summary
                  </div>
                  <p className="text-slate-300">{selectedChallenge.ai_reason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
