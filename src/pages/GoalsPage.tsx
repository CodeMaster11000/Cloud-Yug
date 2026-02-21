import React from 'react';
import { Target, TrendingUp, ArrowRight, Clock, LayoutDashboard, Moon, Bell, CheckCircle2, Info, Lightbulb, AlertTriangle, Eye, Gauge, Activity, MousePointer, ScrollText } from 'lucide-react';
import { Settings, Stats } from '../types';
import { PhysiologicalMetrics } from '../hooks/useFatigueDetection';

interface GoalsPageProps {
    settings: Settings | null;
    fatigueMetrics: PhysiologicalMetrics;
    isTracking: boolean;
    stats?: Stats | null;
}

export const GoalsPage = ({ settings, fatigueMetrics, isTracking, stats }: GoalsPageProps) => {
    // Use default values if settings are null
    const displaySettings = settings || {
        daily_focus_target: 4,
        max_tab_switches: 15,
        digital_sunset: '22:00',
        alert_sensitivity: 'Balanced',
        full_name: 'User',
        email: 'user@example.com'
    };
    
    // Calculate health goals progress
    const blinkHealthPercent = isTracking ? Math.max(0, 100 - fatigueMetrics.blinkRateScore) : 0;
    const postureHealthPercent = isTracking ? Math.max(0, 100 - fatigueMetrics.postureScore) : 0;
    const eyeHealthPercent = isTracking ? Math.max(0, 100 - fatigueMetrics.earScore) : 0;

    return (
        <div className="w-full max-w-[90rem] mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-10 transition-colors">
                <div className="absolute right-[-20%] top-[-20%] w-[60%] h-[140%] opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform group-hover:scale-105 duration-700">
                    <TrendingUp className="text-green-500" fill="currentColor" size={400} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                        <TrendingUp size={14} /> Weekly Performance
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tight text-slate-900 dark:text-slate-50">Stability improved by 12% this week</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-medium">
                        Your cognitive baseline is stabilizing. You are regaining control over context switching, and your deep work endurance has increased by an average of <span className="text-green-500 font-bold">18 minutes</span> per session.
                    </p>
                </div>
                <div className="relative z-10 shrink-0">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-green-500/20 text-sm cursor-pointer">
                        View Detailed Report
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 flex items-center justify-center">
                                    <Target size={20} />
                                </div>
                                Focus Recovery Goals
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 pb-1 transition-colors">Behavior Design Layer</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Daily Focus Target</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Target hours of deep work</p>
                                    </div>
                                    <Clock className="text-slate-400" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-3xl font-black text-slate-900 dark:text-slate-50">{displaySettings.daily_focus_target}.0 <span className="text-xs font-semibold text-slate-400">hrs</span></span>
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">+20% vs avg</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div className="h-full bg-green-500 rounded-full relative" style={{ width: '50%' }}>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] border-green-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Max Tab Switches</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Threshold for context switching</p>
                                    </div>
                                    <LayoutDashboard className="text-slate-400" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-3xl font-black text-slate-900 dark:text-slate-50">{displaySettings.max_tab_switches} <span className="text-xs font-semibold text-slate-400">switches</span></span>
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Low friction</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div className="h-full bg-green-500 rounded-full relative" style={{ width: '30%' }}>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] border-green-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Digital Sunset</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-cutoff for all screens</p>
                                    </div>
                                    <Moon className="text-slate-400" size={18} />
                                </div>
                                <div className="flex items-center gap-4 mt-8">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-bold text-lg px-4 py-3 flex-1 flex justify-between items-center shadow-sm transition-colors">
                                        {displaySettings.digital_sunset}
                                        <ArrowRight size={16} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <button className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-xl shadow-md shadow-green-500/20 cursor-pointer">
                                        <Bell size={20} fill="currentColor" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Alert Sensitivity</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Recovery nudge frequency</p>
                                    </div>
                                    <Bell size={18} className="text-slate-400" />
                                </div>
                                <div className="flex gap-2 mt-8">
                                    {['Quiet', 'Balanced', 'Active'].map((s, i) => (
                                        <button key={s} className={`flex-1 py-3 text-[10px] font-black rounded-xl border transition-colors uppercase tracking-widest cursor-pointer ${(displaySettings.alert_sensitivity === s || (s === 'Balanced' && !displaySettings.alert_sensitivity))
                                                ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                                            }`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center">
                                        <TrendingUp size={20} />
                                    </div>
                                    Recovery Streak
                                </h4>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wide"><span className="text-slate-900 dark:text-slate-100 text-sm">8 days</span> above 75 score</p>
                            </div>
                            <div className="flex justify-between items-center gap-2 max-w-xl mx-auto">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T'].map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs ${i < 4 ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : i === 4 ? 'bg-green-50 dark:bg-green-900/30 text-green-500 border border-green-200 dark:border-green-800' : i < 6 ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700' : 'bg-transparent text-slate-300'}`}>{day}</div>
                                        {i < 4 ? <CheckCircle2 className="text-green-500" size={16} fill="currentColor" /> : i === 4 ? <div className="size-4 rounded-full border-[3px] border-green-200 dark:border-green-800" /> : i < 6 ? <div className="size-4 rounded-full border-[3px] border-slate-200 dark:border-slate-700" /> : <div className="size-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Physiological Health Goals */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                                    <Activity size={20} />
                                </div>
                                Physiological Health Goals
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 pb-1 transition-colors">
                                {isTracking ? 'Live Tracking' : 'Not Tracking'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Blink Health</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Optimal: 15-20 blinks/min</p>
                                    </div>
                                    <Eye className="text-cyan-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-3xl font-black text-slate-900 dark:text-slate-50">
                                            {isTracking ? fatigueMetrics.blinksPerMin : '--'} 
                                            <span className="text-xs font-semibold text-slate-400 ml-1">/min</span>
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            blinkHealthPercent > 70 ? 'text-green-500' : 'text-amber-500'
                                        }`}>
                                            {isTracking ? `${Math.round(blinkHealthPercent)}% healthy` : 'Start tracking'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div className="h-full bg-cyan-500 rounded-full relative transition-all" style={{ width: `${blinkHealthPercent}%` }}>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] border-cyan-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Posture Quality</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Maintain good head position</p>
                                    </div>
                                    <Gauge className="text-purple-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className={`text-3xl font-black ${
                                            isTracking && (fatigueMetrics.isSlumping || fatigueMetrics.isForwardHead) 
                                                ? 'text-purple-500' 
                                                : 'text-emerald-500'
                                        }`}>
                                            {isTracking ? (fatigueMetrics.isSlumping || fatigueMetrics.isForwardHead ? 'Poor' : 'Good') : '--'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            postureHealthPercent > 70 ? 'text-green-500' : 'text-amber-500'
                                        }`}>
                                            {isTracking ? `${Math.round(postureHealthPercent)}% healthy` : 'Start tracking'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div className="h-full bg-purple-500 rounded-full relative transition-all" style={{ width: `${postureHealthPercent}%` }}>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] border-purple-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Eye Health</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Minimize eye strain</p>
                                    </div>
                                    <Eye className="text-amber-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className={`text-3xl font-black ${
                                            isTracking && fatigueMetrics.eyeFatigue ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>
                                            {isTracking ? (fatigueMetrics.eyeFatigue ? 'Strain' : 'Healthy') : '--'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            eyeHealthPercent > 70 ? 'text-green-500' : 'text-amber-500'
                                        }`}>
                                            {isTracking ? `${Math.round(eyeHealthPercent)}% healthy` : 'Start tracking'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div className="h-full bg-amber-500 rounded-full relative transition-all" style={{ width: `${eyeHealthPercent}%` }}>
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] border-amber-500 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isTracking && (
                            <div className="mt-6 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center gap-3 transition-colors">
                                <Lightbulb className="text-indigo-500 dark:text-indigo-400" size={18} fill="currentColor" />
                                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">Go to Dashboard and start CV tracking to see your real-time physiological health metrics.</p>
                            </div>
                        )}
                    </section>

                    {/* Behavioral Tracking Goals */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                                    <MousePointer size={20} />
                                </div>
                                Behavioral Tracking Goals
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 pb-1 transition-colors">
                                {stats?.factors ? 'Live Data' : 'No Data'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tab Switching Goal */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Tab Switches</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Target: &lt; {displaySettings.max_tab_switches}/hr</p>
                                    </div>
                                    <LayoutDashboard className="text-blue-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-3xl font-black text-slate-900 dark:text-slate-50">
                                            {stats?.tab_switches ?? '--'}
                                            <span className="text-xs font-semibold text-slate-400 ml-1">switches</span>
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            stats?.factors?.tabSwitching 
                                                ? (stats.factors.tabSwitching.penalty > stats.factors.tabSwitching.maxWeight * 0.5 
                                                    ? 'text-rose-500' 
                                                    : 'text-green-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.tabSwitching 
                                                ? `${Math.round((1 - stats.factors.tabSwitching.penalty / stats.factors.tabSwitching.maxWeight) * 100)}% on target`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div 
                                            className={`h-full rounded-full relative transition-all ${
                                                stats?.factors?.tabSwitching
                                                    ? (stats.factors.tabSwitching.penalty > stats.factors.tabSwitching.maxWeight * 0.5 
                                                        ? 'bg-rose-500' 
                                                        : 'bg-green-500')
                                                    : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                            style={{ width: `${stats?.factors?.tabSwitching ? Math.min(100, (1 - stats.factors.tabSwitching.penalty / stats.factors.tabSwitching.maxWeight) * 100) : 0}%` }}
                                        >
                                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] rounded-full shadow-sm ${
                                                stats?.factors?.tabSwitching
                                                    ? (stats.factors.tabSwitching.penalty > stats.factors.tabSwitching.maxWeight * 0.5 
                                                        ? 'border-rose-500' 
                                                        : 'border-green-500')
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Typing Fatigue Goal */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Typing Fatigue</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Maintain typing consistency</p>
                                    </div>
                                    <Activity className="text-purple-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className={`text-3xl font-black ${
                                            stats?.factors?.typingFatigue
                                                ? (stats.factors.typingFatigue.penalty > stats.factors.typingFatigue.maxWeight * 0.6 
                                                    ? 'text-purple-500' 
                                                    : 'text-emerald-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.typingFatigue 
                                                ? (stats.factors.typingFatigue.penalty > stats.factors.typingFatigue.maxWeight * 0.6 
                                                    ? 'Fatigued' 
                                                    : 'Good')
                                                : 'N/A'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            stats?.factors?.typingFatigue
                                                ? (stats.factors.typingFatigue.penalty > stats.factors.typingFatigue.maxWeight * 0.5 
                                                    ? 'text-amber-500' 
                                                    : 'text-green-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.typingFatigue 
                                                ? `${Math.round((1 - stats.factors.typingFatigue.penalty / stats.factors.typingFatigue.maxWeight) * 100)}% healthy`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div 
                                            className={`h-full rounded-full relative transition-all ${
                                                stats?.factors?.typingFatigue
                                                    ? (stats.factors.typingFatigue.penalty > stats.factors.typingFatigue.maxWeight * 0.5 
                                                        ? 'bg-amber-500' 
                                                        : 'bg-emerald-500')
                                                    : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                            style={{ width: `${stats?.factors?.typingFatigue ? Math.min(100, (1 - stats.factors.typingFatigue.penalty / stats.factors.typingFatigue.maxWeight) * 100) : 0}%` }}
                                        >
                                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] rounded-full shadow-sm ${
                                                stats?.factors?.typingFatigue
                                                    ? (stats.factors.typingFatigue.penalty > stats.factors.typingFatigue.maxWeight * 0.5 
                                                        ? 'border-amber-500' 
                                                        : 'border-emerald-500')
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mouse Activity Goal */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Mouse Stability</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Minimize erratic movements</p>
                                    </div>
                                    <MousePointer className="text-cyan-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className={`text-3xl font-black ${
                                            stats?.factors?.erraticMouse
                                                ? (stats.factors.erraticMouse.penalty > stats.factors.erraticMouse.maxWeight * 0.6 
                                                    ? 'text-cyan-500' 
                                                    : 'text-emerald-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.erraticMouse 
                                                ? (stats.factors.erraticMouse.penalty > stats.factors.erraticMouse.maxWeight * 0.6 
                                                    ? 'Erratic' 
                                                    : 'Smooth')
                                                : 'N/A'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            stats?.factors?.erraticMouse
                                                ? (stats.factors.erraticMouse.penalty > stats.factors.erraticMouse.maxWeight * 0.5 
                                                    ? 'text-amber-500' 
                                                    : 'text-green-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.erraticMouse 
                                                ? `${Math.round((1 - stats.factors.erraticMouse.penalty / stats.factors.erraticMouse.maxWeight) * 100)}% stable`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div 
                                            className={`h-full rounded-full relative transition-all ${
                                                stats?.factors?.erraticMouse
                                                    ? (stats.factors.erraticMouse.penalty > stats.factors.erraticMouse.maxWeight * 0.5 
                                                        ? 'bg-amber-500' 
                                                        : 'bg-emerald-500')
                                                    : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                            style={{ width: `${stats?.factors?.erraticMouse ? Math.min(100, (1 - stats.factors.erraticMouse.penalty / stats.factors.erraticMouse.maxWeight) * 100) : 0}%` }}
                                        >
                                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] rounded-full shadow-sm ${
                                                stats?.factors?.erraticMouse
                                                    ? (stats.factors.erraticMouse.penalty > stats.factors.erraticMouse.maxWeight * 0.5 
                                                        ? 'border-amber-500' 
                                                        : 'border-emerald-500')
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scroll Activity Goal */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1 tracking-tight">Scroll Pattern</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Avoid anxious scrolling</p>
                                    </div>
                                    <ScrollText className="text-orange-500" size={18} />
                                </div>
                                <div className="mt-8 mb-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className={`text-3xl font-black ${
                                            stats?.factors?.anxiousScroll
                                                ? (stats.factors.anxiousScroll.penalty > stats.factors.anxiousScroll.maxWeight * 0.6 
                                                    ? 'text-orange-500' 
                                                    : 'text-emerald-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.anxiousScroll 
                                                ? (stats.factors.anxiousScroll.penalty > stats.factors.anxiousScroll.maxWeight * 0.6 
                                                    ? 'Anxious' 
                                                    : 'Calm')
                                                : 'N/A'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            stats?.factors?.anxiousScroll
                                                ? (stats.factors.anxiousScroll.penalty > stats.factors.anxiousScroll.maxWeight * 0.5 
                                                    ? 'text-amber-500' 
                                                    : 'text-green-500')
                                                : 'text-slate-400'
                                        }`}>
                                            {stats?.factors?.anxiousScroll 
                                                ? `${Math.round((1 - stats.factors.anxiousScroll.penalty / stats.factors.anxiousScroll.maxWeight) * 100)}% calm`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
                                        <div 
                                            className={`h-full rounded-full relative transition-all ${
                                                stats?.factors?.anxiousScroll
                                                    ? (stats.factors.anxiousScroll.penalty > stats.factors.anxiousScroll.maxWeight * 0.5 
                                                        ? 'bg-amber-500' 
                                                        : 'bg-emerald-500')
                                                    : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                            style={{ width: `${stats?.factors?.anxiousScroll ? Math.min(100, (1 - stats.factors.anxiousScroll.penalty / stats.factors.anxiousScroll.maxWeight) * 100) : 0}%` }}
                                        >
                                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-[3px] rounded-full shadow-sm ${
                                                stats?.factors?.anxiousScroll
                                                    ? (stats.factors.anxiousScroll.penalty > stats.factors.anxiousScroll.maxWeight * 0.5 
                                                        ? 'border-amber-500' 
                                                        : 'border-emerald-500')
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(!stats || !stats.factors) && (
                            <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center gap-3 transition-colors">
                                <Info className="text-blue-500 dark:text-blue-400" size={18} fill="currentColor" />
                                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Extension behavioral tracking data will appear here when available. Make sure the Chrome extension is running.</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 sticky top-24 shadow-sm transition-colors">
                        <h3 className="text-xl font-bold mb-8">Daily Standing</h3>
                        <div className="mb-8">
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deep Work</span>
                                <span className="text-sm font-black text-slate-900 dark:text-slate-50">3.2 / 4.0 hrs</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
                                <Info size={12} />
                                48 mins remaining to hit daily goal
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Context Switches</span>
                                <span className="text-sm font-black text-green-500">6 / 15 limit</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500/40 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
                                <CheckCircle2 size={12} className="text-green-500" />
                                Highly stable behavior today
                            </p>
                        </div>

                        <div className="mb-10">
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attention Score</span>
                                <span className="text-sm font-black text-slate-900 dark:text-slate-50">88 / 100</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" style={{ width: '88%' }}></div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Focus Insights</p>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 flex items-center justify-center shrink-0">
                                        <Lightbulb size={14} fill="currentColor" />
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Your attention peaks between <span className="text-slate-900 dark:text-slate-100 font-bold">9 AM and 11 AM</span>. Schedule deep work here.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={14} fill="currentColor" />
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Email browsing after <span className="text-slate-900 dark:text-slate-100 font-bold">4 PM</span> significantly spikes context switching.
                                    </p>
                                </li>
                            </ul>
                        </div>

                        <button className="w-full mt-10 py-4 bg-slate-900 text-white text-xs font-bold rounded-2xl transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-900/20 cursor-pointer">
                            Download Weekly Summary
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};
