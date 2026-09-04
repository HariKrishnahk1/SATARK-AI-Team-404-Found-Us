'use client';

import React from 'react';
import { Mic, MicOff, Volume2, RotateCcw, Check, X, Globe, Radio, ArrowRightLeft } from 'lucide-react';

export interface MultilingualOption {
  code: string;
  name: string;
  native: string;
}

interface VoiceAssistantConsoleProps {
  isOpen: boolean;
  activeField: 'title' | 'description' | null;
  selectedLang: string;
  onSelectLanguage: (langCode: string) => void;
  interimTranscript: string;
  audioLevel: number;
  isVoiceDetected: boolean;
  speechNotice: string;
  multilingualOptions: MultilingualOption[];
  onFinish: () => void;
  onClear: () => void;
  onCancel: () => void;
  onSwitchField: (field: 'title' | 'description') => void;
}

export const VoiceAssistantConsole: React.FC<VoiceAssistantConsoleProps> = ({
  isOpen,
  activeField,
  selectedLang,
  onSelectLanguage,
  interimTranscript,
  audioLevel,
  isVoiceDetected,
  speechNotice,
  multilingualOptions,
  onFinish,
  onClear,
  onCancel,
  onSwitchField
}) => {
  if (!isOpen || !activeField) return null;

  const currentLangObj = multilingualOptions.find(l => l.code === selectedLang) || multilingualOptions[0];
  const fieldLabel = activeField === 'title' ? 'Problem Title' : 'Detailed Description';
  const alternativeField = activeField === 'title' ? 'description' : 'title';
  const alternativeLabel = activeField === 'title' ? 'Speak Description instead' : 'Speak Title instead';

  // Popular Indian quick-switch languages
  const popularLangs = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'kn-IN'];

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 space-y-3.5 transition-all animate-fadeIn">
      {/* Top Header: Live Status & Equalizer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Microphone Active
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                Recording: {fieldLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Speak naturally into your device. Words are transcribed in real-time.
            </p>
          </div>
        </div>

        {/* Live Audio Level Meter & Equalizer */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-end gap-1 h-5 w-14 justify-center">
            {[0.4, 0.8, 1.2, 0.9, 0.6, 1.0].map((mult, i) => {
              const barHeight = Math.max(15, Math.min(100, Math.round(audioLevel * mult * 1.6)));
              return (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isVoiceDetected
                      ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-sm shadow-emerald-500/50'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
              );
            })}
          </div>
          <span className={`text-[11px] font-mono font-bold ${isVoiceDetected ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isVoiceDetected ? 'Voice Detected' : 'Listening...'}
          </span>
        </div>
      </div>

      {/* Real-time Streaming Transcript Box */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 min-h-[52px] flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Speech Stream ({currentLangObj.name}):</span>
          </div>
          {interimTranscript ? (
            <p className="text-sm font-medium text-cyan-300 italic animate-pulse">
              "{interimTranscript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Listening for your voice... speak now (you can speak in {currentLangObj.native} or {currentLangObj.name})
            </p>
          )}
        </div>
      </div>

      {/* Speech Status / Diagnostic Notice */}
      {speechNotice && (
        <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{speechNotice}</span>
        </div>
      )}

      {/* Quick Language Switcher Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" /> One-Click Language Switch:
          </span>
          <span className="text-[10px] text-cyan-400 font-normal">Switching preserves your speech</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {popularLangs.map(code => {
            const lang = multilingualOptions.find(l => l.code === code);
            if (!lang) return null;
            const isSelected = selectedLang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelectLanguage(code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{lang.native}</span>
                <span className="text-[10px] opacity-70">({lang.name.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFinish}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Finish & Save Voice Input</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            title="Clear and speak again"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear & Retry</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSwitchField(alternativeField)}
            className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{alternativeLabel}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-800 text-xs transition-all cursor-pointer"
            title="Close Voice Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
