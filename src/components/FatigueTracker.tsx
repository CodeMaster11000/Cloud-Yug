import React, { useEffect, useState, useRef } from 'react';
import { useFatigueDetection } from '../hooks/useFatigueDetection';
import { addSession, getHistory, FatigueEvent } from '../lib/db';
import { Activity, EyeOff, Brain, Clock, ShieldAlert, Wind, Dumbbell, Eye, Gauge } from 'lucide-react';

// When stress hits 15, we trigger the intervention 
const CRITICAL_STRESS_THRESHOLD = 15;

export default function FatigueTracker() {
    const { isLoaded, isTracking, stressLevel, eyeFatigue, cameraError, metrics, startTracking, stopTracking } = useFatigueDetection();

    const [history, setHistory] = useState<FatigueEvent[]>([]);
    const startTimeRef = useRef<number | null>(null);

    // Accumulated counters for the current session
    const [sessionEyeFatigueCount, setSessionEyeFatigueCount] = useState(0);
    const [peakStress, setPeakStress] = useState(0);
    const [interventionActive, setInterventionActive] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (eyeFatigue) setSessionEyeFatigueCount((prev) => prev + 1);
    }, [eyeFatigue]);

    useEffect(() => {
        if (stressLevel > peakStress) setPeakStress(stressLevel);

        if (stressLevel >= CRITICAL_STRESS_THRESHOLD && !interventionActive && isTracking) {
            handleStop(); // Halt background tracking automatically
            setInterventionActive(true);
        }
    }, [stressLevel, interventionActive, isTracking]);

    const loadHistory = async () => {
        const data = await getHistory();
        setHistory(data);
    };

    const handleStart = () => {
        setSessionEyeFatigueCount(0);
        setPeakStress(0);
        startTimeRef.current = Date.now();
        startTracking();
    };

    const handleStop = async () => {
        stopTracking();
        if (startTimeRef.current) {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

            const newSession = {
                timestamp: Date.now(),
                durationSeconds: duration,
                slouchCount: peakStress, // repurpose standard schema for peak stress
                eyeFatigueCount: sessionEyeFatigueCount,
            };

            await addSession(newSession);
            await loadHistory();
        }
    };

    const closeIntervention = () => {
        setInterventionActive(false);
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans relative">

            {/* Active Intervention Modal */}
            {interventionActive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
                    <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-10 max-w-xl w-full shadow-[0_0_100px_rgba(244,63,94,0.15)] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldAlert size={150} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/30">
                                <Brain className="text-rose-500" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">High Stress Detected</h2>
                            <p className="text-slate-400 mb-10 leading-relaxed max-w-sm">
                                Our CV biometric engine observed sustained squinting and erratic blink behavior. A mandatory cognitive reset is recommended.
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                <button className="flex flex-col items-center p-6 bg-slate-800 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5 group text-left">
                                    <Wind className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="font-bold text-white mb-1">Deep Breathing</span>
                                    <span className="text-xs text-slate-500">2 min reset</span>
                                </button>
                                <button className="flex flex-col items-center p-6 bg-slate-800 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all hover:bg-cyan-500/5 group text-left">
                                    <Dumbbell className="text-cyan-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <span className="font-bold text-white mb-1">Desk Stretches</span>
                                    <span className="text-xs text-slate-500">Release tension</span>
                                </button>
                            </div>

                            <button onClick={closeIntervention} className="text-sm font-bold text-slate-500 hover:text-white transition-colors">
                                Dismiss and return to dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Focus Engine
                        </h1>
                        <p className="text-slate-400 mt-1">Privacy-first biometric stress and fatigue analysis.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!isLoaded && (
                            <div className="flex items-center text-amber-400 text-sm animate-pulse">
                                <Activity size={16} className="mr-2" /> Loading Models...
                            </div>
                        )}
                        {isLoaded && !isTracking && (
                            <button
                                onClick={handleStart}
                                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Start Session
                            </button>
                        )}
                        {isLoaded && isTracking && (
                            <button
                                onClick={handleStop}
                                className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-rose-500/20 animate-pulse"
                            >
                                Stop Tracking
                            </button>
                        )}
                    </div>
                </header>

                {/* Error Banner */}
                {cameraError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                        <ShieldAlert size={20} className="mr-3 mt-0.5 shrink-0" />
                        <span className="text-sm font-medium leading-relaxed">{cameraError}</span>
                    </div>
                )}

                {/* Dashboard grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Stress Monitor */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${stressLevel > 5 ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 flex items-center">
                                    <Brain className={`mr-2 ${stressLevel > 5 ? 'text-rose-400' : 'text-slate-400'}`} />
                                    Cognitive Stress
                                </h2>
                                <p className="text-slate-400 text-sm">Derived from advanced Eye Aspect Ratio variations.</p>
                            </div>
                            {isTracking && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stressLevel > 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {stressLevel > 5 ? 'Elevated' : 'Optimal'}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className="flex items-end gap-3 mb-2">
                                <span className={`text-4xl font-light ${stressLevel > 5 ? 'text-rose-400' : 'text-white'}`}>
                                    {isTracking ? stressLevel : '--'}
                                </span>
                                <span className="text-sm text-slate-500 font-normal mb-1">/ {CRITICAL_STRESS_THRESHOLD} limit</span>
                            </div>
                            {isTracking && (
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-300" style={{ width: `${Math.min((stressLevel / CRITICAL_STRESS_THRESHOLD) * 100, 100)}%` }}></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Eye Fatigue Monitor */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${eyeFatigue ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 flex items-center">
                                    <EyeOff className={`mr-2 ${eyeFatigue ? 'text-amber-400' : 'text-slate-400'}`} />
                                    Eye Strain
                                </h2>
                                <p className="text-slate-400 text-sm">Monitoring blink rate & sustained squinting.</p>
                            </div>
                            {isTracking && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${eyeFatigue ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {eyeFatigue ? 'Strain Detected' : 'Healthy Rate'}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className="text-3xl font-light">
                                {isTracking ? sessionEyeFatigueCount : '--'} <span className="text-sm text-slate-500 font-normal">warnings this session</span>
                            </div>
                        </div>
                    </div>

                    {/* Blink Rate Monitor */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${metrics.blinkFatigued ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 flex items-center">
                                    <Eye className={`mr-2 ${metrics.blinkFatigued ? 'text-cyan-400' : 'text-slate-400'}`} />
                                    Blink Analysis
                                </h2>
                                <p className="text-slate-400 text-sm">Normal: 15-20 blinks/min. Fatigue: &lt;10 or &gt;30.</p>
                            </div>
                            {isTracking && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${metrics.blinkFatigued ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {metrics.blinkFatigued ? 'Abnormal' : 'Normal'}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className="flex items-end gap-3 mb-2">
                                <span className={`text-4xl font-light ${metrics.blinkFatigued ? 'text-cyan-400' : 'text-white'}`}>
                                    {isTracking ? metrics.blinksPerMin : '--'}
                                </span>
                                <span className="text-sm text-slate-500 font-normal mb-1">blinks/min</span>
                            </div>
                            {isTracking && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Fatigue Score:</span>
                                    <span className={`font-semibold ${metrics.blinkRateScore > 50 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                        {metrics.blinkRateScore}/100
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Posture Monitor */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${(metrics.isSlumping || metrics.isForwardHead) ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 flex items-center">
                                    <Gauge className={`mr-2 ${(metrics.isSlumping || metrics.isForwardHead) ? 'text-purple-400' : 'text-slate-400'}`} />
                                    Head Posture
                                </h2>
                                <p className="text-slate-400 text-sm">Slouching and forward head position detection.</p>
                            </div>
                            {isTracking && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${(metrics.isSlumping || metrics.isForwardHead) ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {(metrics.isSlumping || metrics.isForwardHead) ? 'Poor' : 'Good'}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Forward Head:</span>
                                    <span className={`font-semibold ${metrics.isForwardHead ? 'text-purple-400' : 'text-emerald-400'}`}>
                                        {isTracking ? (metrics.isForwardHead ? 'Yes' : 'No') : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Slouching:</span>
                                    <span className={`font-semibold ${metrics.isSlumping ? 'text-purple-400' : 'text-emerald-400'}`}>
                                        {isTracking ? (metrics.isSlumping ? 'Yes' : 'No') : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Head Tilt:</span>
                                    <span className="text-white">
                                        {isTracking ? `${metrics.headTilt}°` : '--'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-white/5 pt-2 mt-2">
                                    <span className="text-slate-400">Posture Score:</span>
                                    <span className={`font-semibold ${metrics.postureScore > 50 ? 'text-purple-400' : 'text-emerald-400'}`}>
                                        {isTracking ? `${metrics.postureScore}/100` : '--'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comprehensive Physiological Score */}
                {isTracking && (
                    <div className={`p-8 rounded-2xl border transition-all duration-500 ${metrics.physiologicalScore > 50 ? 'bg-gradient-to-br from-rose-500/10 to-purple-500/10 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.2)]' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                                    <Brain className={`${metrics.physiologicalScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`} />
                                    Comprehensive Fatigue Index
                                </h2>
                                <p className="text-slate-400 text-sm">Combined analysis: EAR (40%) + Blink Rate (30%) + Posture (20%) + Stress (10%)</p>
                            </div>
                            <div className={`text-5xl font-light ${metrics.physiologicalScore > 70 ? 'text-rose-400' : metrics.physiologicalScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {metrics.physiologicalScore}
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 w-32">EAR Score:</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-rose-400 transition-all" style={{ width: `${metrics.earScore}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-white w-12 text-right">{metrics.earScore}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 w-32">Blink Rate:</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all" style={{ width: `${metrics.blinkRateScore}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-white w-12 text-right">{metrics.blinkRateScore}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 w-32">Posture:</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-purple-400 transition-all" style={{ width: `${metrics.postureScore}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-white w-12 text-right">{metrics.postureScore}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-400 w-32">Stress Level:</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-rose-400 transition-all" style={{ width: `${Math.min(stressLevel * 6.67, 100)}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-white w-12 text-right">{stressLevel}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Local History Section */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <Clock className="mr-2 text-slate-400" />
                        Local Session History
                    </h2>

                    <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No sessions recorded yet. Start tracking to build your history!
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {history.map((session, i) => (
                                    <div key={session.id || i} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                        <div>
                                            <div className="text-sm font-medium text-slate-300">
                                                {new Date(session.timestamp).toLocaleString(undefined, {
                                                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Duration: {formatDuration(session.durationSeconds)}
                                            </div>
                                        </div>
                                        <div className="flex space-x-6">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500 uppercase">Peak Stress</div>
                                                <div className={`font-semibold ${session.slouchCount > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                    {session.slouchCount}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500 uppercase">Eye Strain Flags</div>
                                                <div className={`font-semibold ${session.eyeFatigueCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {session.eyeFatigueCount}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
