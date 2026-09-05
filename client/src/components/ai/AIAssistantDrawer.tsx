import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  AlertTriangle,
  HeartPulse,
  Flame,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { useVoiceAssistant } from '../../contexts/VoiceAssistantContext';
import { useEmergency } from '../../contexts/EmergencyContext';
import { EmergencyCategory, Facility } from '../../types/emergency.types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  detectedCategory?: EmergencyCategory;
  suggestedAction?: string;
  timestamp: string;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Facility[];
  onSelectCategory: (cat: EmergencyCategory) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  facilities,
  onSelectCategory,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello, I am your Emergency AI Assistant. Describe your situation in plain words (e.g., 'Severe burn on arm', 'Car accident on highway', 'Need police assistance'). I will help categorize the incident and recommend the most critical nearby facility.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, startListening, stopListening, transcript, speak } = useVoiceAssistant();
  const { startSosCountdown } = useEmergency();

  // Voice transcript synchronization
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  // Emergency NLP Classifier & Guidance Engine
  const analyzeEmergencyInput = (text: string) => {
    const lower = text.toLowerCase();
    let cat: EmergencyCategory = 'unknown';
    let guidance = '';
    let action = '';

    if (
      lower.includes('heart') ||
      lower.includes('chest') ||
      lower.includes('bleed') ||
      lower.includes('breath') ||
      lower.includes('chok') ||
      lower.includes('unconscious') ||
      lower.includes('faint') ||
      lower.includes('stroke') ||
      lower.includes('hospital') ||
      lower.includes('doctor')
    ) {
      cat = 'medical';
      guidance =
        'Identified Priority: Medical Emergency / Trauma. If the patient is not breathing or unresponsive, begin CPR immediately if trained. Keep the person calm, do not give oral medication or fluids until emergency medics arrive.';
      action = 'Filtered dashboard for closest Level-1 Trauma Hospital and Emergency Room.';
    } else if (lower.includes('crash') || lower.includes('accident') || lower.includes('car') || lower.includes('pedestrian')) {
      cat = 'accident';
      guidance =
        'Identified Priority: Traffic / Collision Accident. Turn on vehicle hazard lights immediately. Check for traffic dangers before stepping out. Do not move injured victims unless there is immediate risk of explosion or fire.';
      action = 'Prioritizing Emergency Medical Services and Police dispatch.';
    } else if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn') || lower.includes('flame') || lower.includes('gas leak')) {
      cat = 'fire';
      guidance =
        'Identified Priority: Fire / Hazmat Hazard. Evacuate immediately! Stay low beneath smoke. Do not use elevators. If clothes catch fire: Stop, Drop, and Roll.';
      action = 'Filtered dashboard for nearest Fire & Rescue Station.';
    } else if (
      lower.includes('theft') ||
      lower.includes('rob') ||
      lower.includes('threat') ||
      lower.includes('attack') ||
      lower.includes('break-in') ||
      lower.includes('weapon') ||
      lower.includes('police')
    ) {
      cat = 'crime';
      guidance =
        'Identified Priority: Crime / Personal Security Threat. Move to a populated, well-lit area or lock all doors. Keep your phone on silent if concealing yourself. Avoid confronting the assailant.';
      action = 'Filtered dashboard for closest Police Precinct & Safe Shelters.';
    } else if (lower.includes('flood') || lower.includes('earthquake') || lower.includes('storm') || lower.includes('tornado')) {
      cat = 'natural_disaster';
      guidance =
        'Identified Priority: Natural Disaster. Move to designated high ground (flood) or interior structural doorframe/under heavy table (earthquake). Prepare emergency supplies.';
      action = 'Filtered dashboard for Disaster Shelters & Relief Centers.';
    } else {
      cat = 'medical';
      guidance =
        'Please describe any specific physical symptoms or immediate dangers. I have calibrated your facilities list to show emergency rooms and hospitals nearby.';
      action = 'Displaying nearest verified emergency facilities.';
    }

    return { cat, guidance, action };
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    setInput('');
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    // Call NLP analyzer
    setTimeout(() => {
      const { cat, guidance, action } = analyzeEmergencyInput(userText);
      onSelectCategory(cat);

      const botReply: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: guidance,
        detectedCategory: cat,
        suggestedAction: action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      setIsProcessing(false);
      speak(guidance);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                Emergency AI Assistant
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Online
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Natural Language Triage & Facility Discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Safety Notice */}
        <div className="bg-rose-950/40 border-b border-rose-900/40 p-3 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Important Safety Notice:</span> This AI does not provide medical diagnoses or replace emergency 911/112 responders.
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-lg'
                }`}
              >
                <p>{m.text}</p>

                {m.suggestedAction && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/80 text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{m.suggestedAction}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]"></span>
              <span>Analyzing emergency keywords & calculating proximity...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] font-bold shrink-0">Try:</span>
          {[
            'Someone collapsed',
            'Car crash on highway',
            'Building fire',
            'Suspicious stalker',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput(prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 text-xs border border-slate-700"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Urgent Action Row */}
        <div className="px-4 py-2 bg-slate-950/60 flex items-center justify-between gap-2 text-xs border-t border-slate-800">
          <a
            href="tel:911"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 911 Now</span>
          </a>
          <button
            type="button"
            onClick={() => {
              onClose();
              startSosCountdown();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 hover:text-white rounded-xl font-bold text-xs"
          >
            <span>Activate SOS Countdown</span>
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Voice Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening to voice...' : 'Type emergency situation...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white disabled:opacity-40 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
