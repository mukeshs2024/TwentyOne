"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Target, Clock, X } from "lucide-react";
import { submitDailyReview } from "./actions";
import { format } from "date-fns";
import confetti from "canvas-confetti";

type SummaryType = {
  score: number;
  totalTargets: number;
  completedTargets: number;
  partialTargets: number;
  focusHours: number;
  focusMins: number;
  rating: number;
  review?: {
    accomplishments: string | null;
    learnings: string | null;
    wentWell: string | null;
    wentWrong: string | null;
    improvements: string | null;
    rating: number;
  } | null;
};

export default function ReviewWizard({ initialSummary }: { initialSummary: SummaryType }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    accomplishments: "",
    learnings: "",
    wentWell: "",
    wentWrong: "",
    improvements: "",
    rating: 0
  });

  // If a review already exists, jump straight to the summary
  if (initialSummary.review && step !== 4) {
     setStep(4);
     setForm({
        accomplishments: initialSummary.review.accomplishments || "",
        learnings: initialSummary.review.learnings || "",
        wentWell: initialSummary.review.wentWell || "",
        wentWrong: initialSummary.review.wentWrong || "",
        improvements: initialSummary.review.improvements || "",
        rating: initialSummary.review.rating
     });
  }

  // Trigger confetti when hitting the final step with a high rating
  useEffect(() => {
     if (step === 4 && form.rating >= 4) {
        const timer = setTimeout(() => {
           confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#f97316', '#10b981', '#3b82f6', '#f59e0b']
           });
        }, 300);
        return () => clearTimeout(timer);
     }
  }, [step, form.rating]);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async (ratingVal: number) => {
    setIsSubmitting(true);
    try {
      await submitDailyReview({ ...form, rating: ratingVal });
      setForm(prev => ({ ...prev, rating: ratingVal }));
      setStep(4); // Move to final summary
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = format(new Date(), "MMMM d");

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <div className="flex items-center justify-between p-6">
         <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
            {step < 4 && <span>Step {step} of 3</span>}
         </div>
         {step < 4 && (
            <Button variant="ghost" onClick={() => router.push("/today")} className="text-slate-400 hover:text-slate-900 rounded-full font-bold">
               <X className="w-5 h-5 mr-2" /> Escape
            </Button>
         )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
         <AnimatePresence mode="wait">
            {step === 1 && (
               <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
               >
                  <div className="text-center mb-12">
                     <p className="text-orange-500 font-bold uppercase tracking-wider mb-2">{todayStr}</p>
                     <h1 className="text-4xl font-bold tracking-tight text-slate-900">Your Day in Review</h1>
                     <p className="text-slate-500 mt-4 text-lg">Before you wrap up, let&apos;s look at what you executed.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <Target className="w-6 h-6 text-slate-300 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-slate-900 mb-1">{initialSummary.completedTargets} / {initialSummary.totalTargets}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Targets</div>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <Clock className="w-6 h-6 text-slate-300 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-slate-900 mb-1">{initialSummary.focusHours}h {initialSummary.focusMins}m</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus</div>
                     </div>

                  </div>

                  <div className="flex justify-center">
                     <Button onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-10 h-14 text-lg font-bold shadow-lg shadow-slate-900/10">
                        Begin Reflection
                     </Button>
                  </div>
               </motion.div>
            )}

            {step === 2 && (
               <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-2xl"
               >
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8 text-center">Reflection</h2>
                  
                  <div className="space-y-8 h-[60vh] overflow-y-auto pr-4 pb-12 custom-scrollbar">
                     <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">What did you accomplish?</label>
                        <Textarea 
                           value={form.accomplishments}
                           onChange={e => setForm(prev => ({ ...prev, accomplishments: e.target.value }))}
                           placeholder="I finally shipped the new layout..."
                           className="resize-none min-h-[100px] bg-white border-transparent shadow-sm text-lg focus:border-orange-500 rounded-2xl p-4"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">What did you learn?</label>
                        <Textarea 
                           value={form.learnings}
                           onChange={e => setForm(prev => ({ ...prev, learnings: e.target.value }))}
                           placeholder="Learned about database indexes..."
                           className="resize-none min-h-[100px] bg-white border-transparent shadow-sm text-lg focus:border-orange-500 rounded-2xl p-4"
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">What went well?</label>
                           <Textarea 
                              value={form.wentWell}
                              onChange={e => setForm(prev => ({ ...prev, wentWell: e.target.value }))}
                              className="resize-none min-h-[120px] bg-white border-transparent shadow-sm text-base focus:border-orange-500 rounded-2xl p-4"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">What got in the way?</label>
                           <Textarea 
                              value={form.wentWrong}
                              onChange={e => setForm(prev => ({ ...prev, wentWrong: e.target.value }))}
                              className="resize-none min-h-[120px] bg-white border-transparent shadow-sm text-base focus:border-orange-500 rounded-2xl p-4"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">What will you change tomorrow?</label>
                        <Textarea 
                           value={form.improvements}
                           onChange={e => setForm(prev => ({ ...prev, improvements: e.target.value }))}
                           placeholder="I will block out 2 hours before checking email."
                           className="resize-none min-h-[100px] bg-white border-transparent shadow-sm text-lg focus:border-orange-500 rounded-2xl p-4"
                        />
                     </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                     <Button variant="ghost" onClick={handlePrev} className="text-slate-500 font-bold rounded-full">Back</Button>
                     <Button onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 h-12 font-bold shadow-md">
                        Continue
                     </Button>
                  </div>
               </motion.div>
            )}

            {step === 3 && (
               <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full text-center"
               >
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-12">How would you rate today&apos;s execution?</h2>
                  
                  <div className="flex justify-center gap-4 mb-16">
                     {[1, 2, 3, 4, 5].map(ratingValue => (
                        <button
                           key={ratingValue}
                           onClick={() => handleSubmit(ratingValue)}
                           disabled={isSubmitting}
                           className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-2xl font-bold text-slate-400 hover:border-orange-500 hover:text-orange-500 hover:shadow-md transition-all flex items-center justify-center"
                        >
                           {ratingValue}
                        </button>
                     ))}
                  </div>

                  <div className="flex justify-center">
                     <Button variant="ghost" onClick={handlePrev} className="text-slate-500 font-bold rounded-full">Back to Reflection</Button>
                  </div>
               </motion.div>
            )}

            {step === 4 && (
               <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full max-w-4xl flex flex-col lg:flex-row gap-12 items-start"
               >
                  {/* Left: The Win */}
                  <div className="w-full lg:w-1/3 text-center lg:text-left pt-8">
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                     >
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto lg:mx-0 mb-6" />
                        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-2">DAY WON</h1>
                        <p className="text-emerald-600 font-bold tracking-widest uppercase mb-8">+1 day</p>
                        
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                           {form.rating >= 4 ? "Strong execution today. You&apos;re building solid momentum." : 
                            form.rating === 3 ? "A solid day of work. Consistency is key." :
                            "A tough day, but logging it is a win. Rest and reset."}
                        </p>
                        
                        <Button 
                           onClick={() => router.push("/today")}
                           className="bg-slate-900 text-white rounded-full px-8 h-12 font-bold w-full md:w-auto"
                        >
                           Return to Today
                        </Button>
                     </motion.div>
                  </div>

                  {/* Right: The Record */}
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.5 }}
                     className="w-full lg:w-2/3 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                  >
                     <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-100">
                        <div>
                           <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Historical Record</div>
                           <h2 className="text-2xl font-bold text-slate-900">{todayStr}</h2>
                        </div>
                        <div className="text-right">
                           <div className="text-3xl font-bold text-orange-500">{initialSummary.score}%</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        <div>
                           <div className="text-xl font-bold text-slate-900">{initialSummary.completedTargets}</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Targets</div>
                        </div>
                        <div>
                           <div className="text-xl font-bold text-slate-900">{initialSummary.focusHours}h {initialSummary.focusMins}m</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus</div>
                        </div>

                        <div>
                           <div className="text-xl font-bold text-slate-900">{form.rating}/5</div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {form.accomplishments && (
                           <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Accomplishments</h4>
                              <p className="text-slate-700 leading-relaxed font-medium">{form.accomplishments}</p>
                           </div>
                        )}
                        {form.learnings && (
                           <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Learnings</h4>
                              <p className="text-slate-700 leading-relaxed font-medium">{form.learnings}</p>
                           </div>
                        )}
                        {form.improvements && (
                           <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tomorrow</h4>
                              <p className="text-slate-700 leading-relaxed font-medium">{form.improvements}</p>
                           </div>
                        )}
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
