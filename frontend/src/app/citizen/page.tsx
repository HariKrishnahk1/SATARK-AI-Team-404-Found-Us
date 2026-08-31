'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Challenge } from '../../lib/types';
import { MapPin, Camera, AlertCircle, CheckCircle, Sparkles, Send, RefreshCw, Clock } from 'lucide-react';
import { Timeline } from '../../components/Timeline';

const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'East Singhbhum', 'Bokaro', 'Deoghar', 'Hazaribagh',
  'Giridih', 'Dumka', 'Sahibganj', 'Ramgarh', 'Palamu', 'West Singhbhum'
];

export default function CitizenPortal() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Ranchi');
  const [address, setAddress] = useState('Angara Block, Ranchi, Jharkhand');
  const [lat, setLat] = useState(23.3699);
  const [lng, setLng] = useState(85.3250);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

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
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const newCh = await api.createChallenge({
        title,
        citizen_description: description,
        district,
        address,
        latitude: lat,
        longitude: lng,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop'
      });

      setSuccessMsg(`Challenge '${newCh.title}' successfully submitted! AI Priority Score: ${newCh.priority_score}/100.`);
      setTitle('');
      setDescription('');
      loadChallenges();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)} (${district})`);
        },
        () => alert('Could not fetch exact GPS location. Defaulting to district centroid.')
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold uppercase mb-1">
            <MapPin className="w-3.5 h-3.5" /> Citizen & Community Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Report & Track Societal Challenges</h1>
          <p className="text-xs text-slate-400 mt-1">Submit real-world issues across Jharkhand for AI evaluation and university/industry resolution.</p>
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
                placeholder="e.g. Severe Fluoride Contamination in Village Borewells"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">District *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Location Pin</label>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold hover:bg-slate-750 flex items-center justify-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> GPS Location
                </button>
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
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
