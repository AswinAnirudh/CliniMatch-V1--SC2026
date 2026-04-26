import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ai, MODELS } from '../lib/gemini';
import { Volunteer, MatchSuggestion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Users, MapPin, Stethoscope, Calendar } from 'lucide-react';
import { Type } from "@google/genai";

export default function ClinicDashboard() {
  const [need, setNeed] = useState('');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadVolunteers() {
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
    }
    loadVolunteers();
  }, []);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!need.trim() || volunteers.length === 0) return;
    
    setLoading(true);
    setSuggestions([]);

    try {
      const prompt = `
        SYSTEM: You are a "Medical Resource Matcher" for a community clinic. Your goal is to match clinical staffing needs with the best available volunteers.
        
        TASK:
        1. Analyze the CLINIC NEED.
        2. Compare it against the VOLUNTEER LIST.
        3. Identify the TOP 3 most suitable matches.
        
        CONSTRAINTS:
        - Return EXACTLY a JSON array of 3 objects (or fewer if total volunteers < 3).
        - If no clear match is found, select the most versatile volunteers but assign lower scores.
        - Output format must be strictly JSON.
        
        VOLUNTEER LIST (JSON):
        ${JSON.stringify(volunteers)}
        
        CLINIC NEED:
        "${need}"
        
        JSON SCHEMA FOR RESPONSE OBJECTS:
        {
          "volunteerIndex": number (index from the provided list),
          "score": number (0-100),
          "reason": string (one-sentence professional reasoning)
        }
      `;

      const response = await ai.models.generateContent({
        model: MODELS.FLASH,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            maxItems: 3,
            items: {
              type: Type.OBJECT,
              properties: {
                volunteerIndex: { type: Type.INTEGER },
                score: { type: Type.INTEGER },
                reason: { type: Type.STRING }
              },
              required: ["volunteerIndex", "score", "reason"]
            }
          }
        }
      });

      const parsedRes = JSON.parse(response.text || '[]');
      const results = parsedRes
        .sort((a: any, b: any) => b.score - a.score)
        .map((res: any) => ({
          volunteerId: volunteers[res.volunteerIndex].id || String(res.volunteerIndex),
          score: res.score,
          reason: res.reason,
          _volunteer: volunteers[res.volunteerIndex] // Temporary for UI
        }));

      setSuggestions(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
          Clinic <span className="text-blue-600">Staffing</span> Dashboard
        </h1>
        <p className="text-slate-500 text-sm">Type a need to see AI-powered volunteer matches instantly.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
        <form onSubmit={handleMatch} className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Need Description</label>
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            placeholder="e.g. We need a general MD for a Saturday night shift downtown to help with pediatric triage..."
          />
          <button
            type="submit"
            disabled={loading || !need.trim()}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>FIND BEST MATCHES</span>
                <Send className="h-4 w-4 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm px-2">
              <Users className="h-4 w-4" />
              <span>AI SUGGESTED VOLUNTEERS</span>
            </div>
            
            <div className="grid gap-3">
              {suggestions.map((s: any, idx) => (
                <motion.div
                  key={s.volunteerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:border-blue-200 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{s._volunteer.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center text-[10px] text-slate-500 font-medium italic uppercase">
                          <MapPin className="h-3 w-3 mr-1" /> {s._volunteer.location}
                        </span>
                        <span className="flex items-center text-[10px] text-slate-500 font-medium italic uppercase">
                          <Calendar className="h-3 w-3 mr-1" /> {s._volunteer.availability}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 max-w-md leading-relaxed">{s.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600">{s.score}%</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Match Score</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="pt-12 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="flex gap-6">
          <span>Active Volunteers: {volunteers.length}</span>
          <span>Last Sync: Today 15:15</span>
        </div>
        <span>AI Powered by Gemini</span>
      </footer>
    </div>
  );
}
