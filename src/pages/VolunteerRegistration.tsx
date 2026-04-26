import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Globe, Clock, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const volunteerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  specialty: z.string().min(2, "Specialty must be at least 2 characters").max(100),
  location: z.string().min(2, "Location must be at least 2 characters").max(100),
  availability: z.string().min(2, "Availability must be at least 2 characters").max(200),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

export default function VolunteerRegistration() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
  });

  const onSubmit = async (data: VolunteerFormData) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'volunteers'), data);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden"
      >
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Join CliniMatch</h1>
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">Volunteer Network Enrollment</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield className="h-3 w-3 text-blue-500" /> Full Legal Name
              </label>
              <input
                {...register('name')}
                className={`w-full px-5 py-4 bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-slate-100'} rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                placeholder="Dr. Jane Smith"
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   Medical Specialty
                </label>
                <input
                  {...register('specialty')}
                   className={`w-full px-5 py-4 bg-slate-50 border ${errors.specialty ? 'border-red-300' : 'border-slate-100'} rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                  placeholder="e.g. Nursing / Pediatrics"
                />
                {errors.specialty && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.specialty.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Globe className="h-3 w-3 text-blue-500" /> Primary Location
                </label>
                <input
                  {...register('location')}
                   className={`w-full px-5 py-4 bg-slate-50 border ${errors.location ? 'border-red-300' : 'border-slate-100'} rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                  placeholder="e.g. Downtown / Westside"
                />
                {errors.location && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.location.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-500" /> Weekly Availability
              </label>
              <input
                {...register('availability')}
                 className={`w-full px-5 py-4 bg-slate-50 border ${errors.availability ? 'border-red-300' : 'border-slate-100'} rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                placeholder="e.g. Weekends / Monday & Tuesday"
              />
              {errors.availability && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.availability.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-5 ${success ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-2xl ${success ? 'shadow-green-500/20' : 'shadow-blue-500/20'} hover:translate-y-[-2px] active:translate-y-[0] transition-all flex items-center justify-center gap-3 overflow-hidden group`}
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : success ? (
              <span className="animate-bounce">REGISTRATION SUCCESSFUL!</span>
            ) : (
              <>
                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>SUBMIT ENROLLMENT</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
