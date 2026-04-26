import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Volunteer } from '../types';
import { MatchResult, matchVolunteersWithAI } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Users, MapPin, Stethoscope, Calendar, Trash2, XCircle } from 'lucide-react';

export default function ClinicDashboard() {
  const [need, setNeed] = useState('');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [suggestions, setSuggestions] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVolunteers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'volunteers'));
        const volData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
        
        if (volData.length === 0) {
          const seed = [
            { name: "Dr. Sarah Chen", specialty: "Pediatrics", location: "Downtown", availability: "Monday/Wednesday" },
            { name: "James Wilson, RN", specialty: "ER / Trauma", location: "Westside", availability: "Weekends / Nights" },
            { name: "Dr. Marcus Thorne", specialty: "Dermatology", location: "Suburbs", availability: "Tuesday/Thursday" },
            { name: "Anita Kapoor", specialty: "Vaccination Support", location: "Eastside", availability: "Flexible" },
            { name: "Dr. Robert Lee", specialty: "Internal Medicine", location: "North District", availability: "Fridays" }
          ];
          for (const v of seed) {
            await addDoc(collection(db, 'volunteers'), v);
          }
          setVolunteers(seed as any);
        } else {
          setVolunteers(volData);
        }
      } catch (err) {
        console.error("Failed to load volunteers:", err);
      }
    }
    loadVolunteers();
  }, []);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!need.trim() || volunteers.length === 0) return;
    
    setLoading(true);
    setSuggestions([]);
    setError(null);

    try {
      const results = await matchVolunteersWithAI(need, volunteers);
      setSuggestions(results);
      if (results.length === 0) {
        setError("No significant matches found for this request.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during matching.");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setSuggestions([]);
    setNeed('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded tracking-[0.2em]">Clinical Intelligence v1.2</div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              Staffing <span className="text-blue-600">Commander</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Pool</span>
              <span className="text-xl font-black text-slate-900">{volunteers.length}</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Needs</span>
              <span className="text-xl font-black text-blue-600">Active</span>
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium max-w-xl">Intelligent matching system designed for high-density clinical environments. Enter your requirements below for immediate AI-orchestrated volunteer ranking.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 overflow-hidden relative">
        <form onSubmit={handleMatch} className="space-y-6">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Need Description</label>
            {need && (
              <button 
                type="button" 
                onClick={clearResults}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear All
              </button>
            )}
          </div>
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium text-lg leading-relaxed"
            placeholder="Describe the clinical gap... (e.g. 'We need a pediatrician for downtown clinic on weekends to handle overflow.')"
          />
          <button
            type="submit"
            disabled={loading || !need.trim()}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-2xl shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                <span className="animate-pulse">Consulting AI Matcher...</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                <span className="tracking-widest">GENERATE TOP MATCHES</span>
                <Send className="h-4 w-4 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600"
          >
            <XCircle className="h-6 w-6 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {suggestions.length > 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-tighter">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                   <Users className="h-3 w-3 text-white" />
                </div>
                <span>Ranked AI Suggestions</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                Matches Found: {suggestions.length}
              </div>
            </div>
            
            <div className="grid gap-4">
              {suggestions.map((s, idx) => (
                <motion.div
                  key={s.volunteerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 group transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-105">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-xl text-slate-900 group-hover:text-blue-700 transition-colors">{s.volunteer.name}</h4>
                      <p className="text-xs font-bold text-blue-600/70 border-b border-blue-50 pb-1 inline-block uppercase tracking-wider">{s.volunteer.specialty}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md">
                          <MapPin className="h-3 w-3 mr-1.5 text-blue-500" /> {s.volunteer.location}
                        </span>
                        <span className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md">
                          <Calendar className="h-3 w-3 mr-1.5 text-blue-500" /> {s.volunteer.availability}
                        </span>
                      </div>
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                        <p className="text-xs text-slate-600 leading-relaxed font-medium capitalize">
                          <span className="text-blue-600 font-bold uppercase text-[9px] block mb-1">AI Reasoning:</span>
                          {s.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 rounded-2xl min-w-[120px] group-hover:bg-blue-600 transition-colors shadow-lg">
                    <div className="text-4xl font-black">{s.score}%</div>
                    <div className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1 text-center">Confidence</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Live Records: {volunteers.length}</span>
          <span>System: Optimized Flash 1.0</span>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-full text-slate-400">
          Last refreshed: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </footer>
    </div>
  );
}

