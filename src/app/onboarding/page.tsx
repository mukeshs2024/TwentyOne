"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Clock, ArrowRight, Check } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [availableTime, setAvailableTime] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState("");
  
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  
  const [targetTitle, setTargetTitle] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [targetEstimatedMins, setTargetEstimatedMins] = useState("");

  const nextStep = () => setStep((s) => s + 1);

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    await completeOnboarding({
      availableTime: availableTime === -1 ? parseInt(customTime) || 60 : availableTime || 60,
      focusAreas,
      firstTargetTitle: targetTitle,
      firstTargetCategory: targetCategory || (focusAreas.length > 0 ? focusAreas[0] : "General"),
      firstTargetEstimatedMins: parseInt(targetEstimatedMins) || 30,
    });
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
      
      <div className="relative w-full max-w-xl">
        
        {step > 1 && (
          <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-4">
            <span className="text-sm font-semibold text-slate-400">Step {step - 1} of 3</span>
            <div className="flex gap-2">
              {[2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    step >= i ? "w-8 bg-orange-500" : "w-4 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="relative bg-white shadow-xl shadow-slate-200/40 rounded-3xl border border-slate-100 overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center"
              >
                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to TwentyOne.</h1>
                
                <div className="space-y-4 mb-12 text-lg text-slate-500 font-medium max-w-sm">
                  <p className="flex items-center justify-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">1</span> Plan your day.</p>
                  <p className="flex items-center justify-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">2</span> Execute your work.</p>
                  <p className="flex items-center justify-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">3</span> Capture what you learn.</p>
                  <p className="flex items-center justify-center gap-3"><span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">4</span> Understand your progress.</p>
                </div>

                <Button onClick={nextStep} className="w-full max-w-sm py-6 text-lg rounded-xl shadow-sm">
                  Let&apos;s begin <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col p-10"
              >
                <div className="flex-1">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Daily Focus</h2>
                  <p className="text-slate-500 text-lg mb-8">How much focused time do you want to aim for each day?</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[60, 120, 180].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setAvailableTime(mins)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                          availableTime === mins 
                            ? "border-orange-500 bg-orange-50" 
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <Clock className={`w-6 h-6 mb-3 ${availableTime === mins ? "text-orange-500" : "text-slate-400"}`} />
                        <span className={`block text-xl font-bold ${availableTime === mins ? "text-orange-700" : "text-slate-700"}`}>{mins} min</span>
                        <span className={`block text-sm font-medium mt-1 ${availableTime === mins ? "text-orange-600/70" : "text-slate-500"}`}>
                          {mins / 60} hour{mins > 60 ? 's' : ''} / day
                        </span>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setAvailableTime(-1)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        availableTime === -1 
                          ? "border-orange-500 bg-orange-50" 
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <Clock className={`w-6 h-6 mb-3 ${availableTime === -1 ? "text-orange-500" : "text-slate-400"}`} />
                      <span className={`block text-xl font-bold ${availableTime === -1 ? "text-orange-700" : "text-slate-700"}`}>Custom</span>
                      {availableTime === -1 ? (
                        <div className="mt-2" onClick={e => e.stopPropagation()}>
                          <Input 
                            type="number" 
                            placeholder="Minutes" 
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="h-8 bg-white border-orange-200 focus-visible:ring-orange-500 px-2" 
                          />
                        </div>
                      ) : (
                        <span className="block text-sm font-medium mt-1 text-slate-500">Set your own</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={nextStep} 
                    disabled={!availableTime || (availableTime === -1 && !customTime)} 
                    className="w-full py-6 text-lg rounded-xl"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col p-10"
              >
                <div className="flex-1">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Focus Areas</h2>
                  <p className="text-slate-500 text-lg mb-8">What are you working toward? Select all that apply.</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {["Career", "Learning", "Projects", "Fitness", "Personal", "Other"].map((area) => {
                      const isSelected = focusAreas.includes(area);
                      return (
                        <button
                          key={area}
                          onClick={() => toggleFocusArea(area)}
                          className={`flex items-center gap-2 px-6 py-4 rounded-xl border-2 transition-all font-semibold text-lg ${
                            isSelected 
                              ? "border-orange-500 bg-orange-50 text-orange-700" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          }`}
                        >
                          {isSelected && <Check className="w-5 h-5" />}
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="py-6 rounded-xl border-slate-200">
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={focusAreas.length === 0} 
                    className="flex-1 py-6 text-lg rounded-xl"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col p-10"
              >
                <div className="flex-1">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Your First Target</h2>
                  <p className="text-slate-500 text-lg mb-8">Let&apos;s set your very first meaningful target for today.</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">What do you want to accomplish?</label>
                      <Input 
                        value={targetTitle}
                        onChange={(e) => setTargetTitle(e.target.value)}
                        placeholder="e.g. Complete the Q3 strategy draft"
                        className="text-lg py-6 bg-slate-50 focus-visible:bg-white transition-colors"
                        autoFocus
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <select 
                          className="w-full flex h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                          value={targetCategory}
                          onChange={(e) => setTargetCategory(e.target.value)}
                        >
                          <option value="" disabled>Select category</option>
                          {focusAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                          <option value="General">General</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Time</label>
                        <div className="relative">
                          <Input 
                            type="number"
                            value={targetEstimatedMins}
                            onChange={(e) => setTargetEstimatedMins(e.target.value)}
                            placeholder="30"
                            className="pr-12 bg-slate-50 focus-visible:bg-white text-lg h-12"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} disabled={isSubmitting} className="py-6 rounded-xl border-slate-200">
                    Back
                  </Button>
                  <Button 
                    onClick={handleFinish} 
                    disabled={!targetTitle || !targetCategory || !targetEstimatedMins || isSubmitting} 
                    className="flex-1 py-6 text-lg rounded-xl bg-slate-900 text-white"
                  >
                    {isSubmitting ? "Setting up..." : "Finish and Start Execution"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
