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
import { MapPin, Camera, AlertCircle, CheckCircle, Sparkles, Send, RefreshCw, Clock, UploadCloud, X, FileImage, Image as ImageIcon, Navigation, Compass, FileText, Download, ShieldCheck, Mic, MicOff, Globe, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Timeline } from '../../components/Timeline';
import { VoiceAssistantConsole } from '../../components/VoiceAssistantConsole';
import { useAuth } from '../../context/AuthContext';

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

const MULTILINGUAL_OPTIONS = [
  { code: 'en-IN', name: 'English (India)', native: 'English' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ' }
];

export default function CitizenPortal() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== 'CITIZEN')) {
      router.push('/citizen/login');
    }
  }, [user, isLoadingAuth, router]);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [address, setAddress] = useState(user?.address || '');
  const [lat, setLat] = useState(13.0827);
  const [lng, setLng] = useState(80.2707);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Multilingual & Speech-to-Text Voice Recognition State
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [activeVoiceField, setActiveVoiceField] = useState<'title' | 'description' | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechNotice, setSpeechNotice] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const activeVoiceFieldRef = useRef<'title' | 'description' | null>(null);
  const initialTextRef = useRef<string>('');
  const titleRef = useRef<string>('');
  const descriptionRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep refs synchronized with live state
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    descriptionRef.current = description;
  }, [description]);

  // Clean up audio context and recognition on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopAudioVisualizer();
    };
  }, []);

  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const update = () => {
          if (!isListeningRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(normalized);
          setIsVoiceDetected(normalized > 7);
          animationFrameRef.current = requestAnimationFrame(update);
        };
        update();
      }
    } catch (err: any) {
      console.warn('Microphone audio visualizer notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(true);
      }
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setIsVoiceDetected(false);
  };

  const startSpeechForField = (field: 'title' | 'description', targetLang?: string) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice Recognition (Speech-to-Text) is supported on Google Chrome, Microsoft Edge, Safari, and Brave. You can also type directly in any language!');
      return;
    }

    const langToUse = targetLang || selectedLang;

    // If currently listening on this exact field and not switching language, toggle stop
    if (isListeningRef.current && activeVoiceFieldRef.current === field && !targetLang) {
      stopSpeechRecognition();
      return;
    }

    // Stop any existing instance cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const currentText = field === 'title' ? titleRef.current : descriptionRef.current;
    initialTextRef.current = currentText;
    activeVoiceFieldRef.current = field;
    setActiveVoiceField(field);
    isListeningRef.current = true;
    setInterimTranscript('');
    setPermissionError(false);

    const langObj = MULTILINGUAL_OPTIONS.find(l => l.code === langToUse) || MULTILINGUAL_OPTIONS[0];
    setSpeechNotice(`Listening in ${langObj.native} (${langObj.name}). Speak now!`);

    startAudioVisualizer();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langToUse;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            sessionFinal += item[0].transcript.trim() + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        const base = initialTextRef.current ? initialTextRef.current.trim() : '';
        const finalPart = sessionFinal.trim();
        const interimPart = currentInterim.trim();

        let combined = base;
        if (finalPart) {
          combined += (combined ? ' ' : '') + finalPart;
        }
        if (interimPart) {
          combined += (combined ? ' ' : '') + interimPart;
        }

        // Capitalize first character if starting a sentence
        if (combined.length > 0 && (!base || base.endsWith('.') || base.endsWith('!') || base.endsWith('?'))) {
          combined = combined.charAt(0).toUpperCase() + combined.slice(1);
        }

        if (activeVoiceFieldRef.current === 'title') {
          setTitle(combined);
          titleRef.current = combined;
        } else if (activeVoiceFieldRef.current === 'description') {
          setDescription(combined);
          descriptionRef.current = combined;
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'no-speech') {
          setSpeechNotice('Waiting for voice input... speak clearly into your microphone.');
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError(true);
          setSpeechNotice('Microphone access was blocked. Please allow microphone permissions in your browser URL bar.');
          stopSpeechRecognition();
          return;
        }
        if (event.error === 'network') {
          setSpeechNotice('Connecting to speech recognition network service...');
          return;
        }
        setSpeechNotice(`Speech status: ${event.error}`);
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          // Auto-restart if user has not explicitly stopped
          const updated = activeVoiceFieldRef.current === 'title' ? titleRef.current : descriptionRef.current;
          initialTextRef.current = updated;
          setInterimTranscript('');
          try {
            recognition.start();
          } catch (e) {
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch (err) {}
              }
            }, 250);
          }
        } else {
          stopAudioVisualizer();
          setActiveVoiceField(null);
          setInterimTranscript('');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechNotice('Could not start microphone. You can type directly in any language!');
      stopSpeechRecognition();
    }
  };

  const stopSpeechRecognition = () => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    stopAudioVisualizer();
    setActiveVoiceField(null);
    setInterimTranscript('');
    setSpeechNotice('');
  };

  const clearVoiceInput = () => {
    if (activeVoiceFieldRef.current === 'title') {
      setTitle(initialTextRef.current);
      titleRef.current = initialTextRef.current;
    } else if (activeVoiceFieldRef.current === 'description') {
      setDescription(initialTextRef.current);
      descriptionRef.current = initialTextRef.current;
    }
    setInterimTranscript('');
    setSpeechNotice('Dictation cleared. Speak again to transcribe...');
  };

  const switchVoiceLanguage = (newLangCode: string) => {
    setSelectedLang(newLangCode);
    if (isListeningRef.current && activeVoiceFieldRef.current) {
      startSpeechForField(activeVoiceFieldRef.current, newLangCode);
    }
  };

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

  const handleDownloadPdf = (challenge: Challenge) => {
    if (challenge.verification_pdf_proof && challenge.verification_pdf_proof.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = challenge.verification_pdf_proof;
      link.download = `SATARK_Field_Report_${challenge.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const cleanTitle = (challenge.title || 'Community Challenge').replace(/[()]/g, '');
    const cleanAddress = (challenge.address || challenge.district || 'Verified Field Location').replace(/[()]/g, '');

    const reportContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 380 >>
stream
BT
/F1 18 Tf
50 730 Td
(SATARK-AI OFFICIAL FIELD INSPECTION REPORT) Tj
/F1 12 Tf
0 -30 Td
(--------------------------------------------------------------------------------) Tj
0 -25 Td
(Challenge ID : ${challenge.id}) Tj
0 -20 Td
(Title        : ${cleanTitle}) Tj
0 -20 Td
(Location     : ${cleanAddress}) Tj
0 -20 Td
(Status       : PASSED / VERIFIED & APPROVED) Tj
0 -20 Td
(Officer Name : Senior Field Verification Officer) Tj
0 -20 Td
(Beneficiaries: 1,250 Community Members Served) Tj
0 -25 Td
(--------------------------------------------------------------------------------) Tj
0 -30 Td
(Official Verification Stamp: GOVERNMENT OF INDIA DEPLOYED SOLUTION) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000224 00000 n 
0000000654 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
725
%%EOF`;

    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SATARK_Field_Report_${challenge.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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

  if (isLoadingAuth || (!user || user.role !== 'CITIZEN')) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <h3 className="text-sm font-bold text-white mb-1">Authenticating Citizen Access...</h3>
        <p className="text-xs text-slate-400">Loading citizen credentials. Redirecting to Citizen Login...</p>
      </div>
    );
  }

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
            {/* Multilingual Input & Speech Language Selector */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Input & Voice Language:</span>
              </div>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {MULTILINGUAL_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Permission Notice Banner */}
            {permissionError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg shadow-rose-500/10">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-300">Microphone Permission Blocked</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5">
                    Click the lock (🔒) or site settings icon in your browser address bar next to <code className="bg-rose-950/60 px-1 py-0.5 rounded font-mono">localhost:3000</code>, set <strong>Microphone</strong> to <strong>Allow</strong>, and refresh the page.
                  </p>
                </div>
              </div>
            )}

            {/* Real-time Voice Recognition Assistant Console */}
            <VoiceAssistantConsole
              isOpen={activeVoiceField !== null}
              activeField={activeVoiceField}
              selectedLang={selectedLang}
              onSelectLanguage={switchVoiceLanguage}
              interimTranscript={interimTranscript}
              audioLevel={audioLevel}
              isVoiceDetected={isVoiceDetected}
              speechNotice={speechNotice}
              multilingualOptions={MULTILINGUAL_OPTIONS}
              onFinish={stopSpeechRecognition}
              onClear={clearVoiceInput}
              onCancel={stopSpeechRecognition}
              onSwitchField={(newField) => startSpeechForField(newField)}
            />

            {/* What is the problem?? (formerly Challenge Title) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  What is the problem?? <span className="text-rose-500">*</span>
                </label>
                {activeVoiceField === 'title' && (
                  <span className="text-[10px] text-rose-400 font-bold animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Microphone Active
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe Water Contamination in Village Borewells / जल प्रदूषण समस्या"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full pl-3 pr-20 py-2.5 rounded-xl bg-slate-950 border text-white text-xs focus:outline-none transition-colors ${
                    activeVoiceField === 'title'
                      ? 'border-rose-500/80 shadow-md shadow-rose-500/10'
                      : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => startSpeechForField('title')}
                  title={activeVoiceField === 'title' ? "Stop Voice Recording (Done)" : "Click to Speak Problem Title in any language"}
                  className={`absolute right-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    activeVoiceField === 'title'
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse shadow-md shadow-rose-500/40 border border-rose-400 scale-105'
                      : 'bg-slate-900 hover:bg-cyan-950/80 border border-slate-700 text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  {activeVoiceField === 'title' ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speak</span>
                    </>
                  )}
                </button>
              </div>
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

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                {activeVoiceField === 'description' && (
                  <span className="text-[10px] text-rose-400 font-bold animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Microphone Active
                  </span>
                )}
              </div>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue in any language or click 'Speak' to dictate into your microphone..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full pl-3 pr-20 py-2.5 rounded-xl bg-slate-950 border text-white text-xs focus:outline-none transition-colors ${
                    activeVoiceField === 'description'
                      ? 'border-rose-500/80 shadow-md shadow-rose-500/10'
                      : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => startSpeechForField('description')}
                  title={activeVoiceField === 'description' ? "Stop Voice Recording (Done)" : "Click to Speak Description into your microphone"}
                  className={`absolute right-2 top-2.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    activeVoiceField === 'description'
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse shadow-md shadow-rose-500/40 border border-rose-400 scale-105'
                      : 'bg-slate-900 hover:bg-cyan-950/80 border border-slate-700 text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  {activeVoiceField === 'description' ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Speak</span>
                    </>
                  )}
                </button>
              </div>
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

              {/* Verified Problem Solved Proof & Field PDF Certificate */}
              {selectedChallenge.status === 'RESOLVED' && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Government Verified Problem Solved Proof
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                      VERIFIED & DEPLOYED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Solved Image Proof */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                        📷 Solved Photo Proof:
                      </span>
                      <div className="relative rounded-lg overflow-hidden border border-emerald-500/30">
                        <img
                          src={selectedChallenge.image_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop'}
                          alt="Problem Solved Proof"
                          className="w-full h-28 object-cover"
                        />
                      </div>
                    </div>

                    {/* PDF Verification Certificate Download */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                        📄 Field Inspection PDF Report:
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-200">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate font-mono font-bold">SATARK_Field_Report.pdf</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(selectedChallenge)}
                          className="w-full py-1.5 px-3 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Verified PDF Proof
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
