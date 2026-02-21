import React, { useState, useEffect } from 'react';
import { User, Bell, Target, Bolt, Shield, Info, Wind, Clock, Moon, Sun, Download, Upload, Trash2, Database, BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Settings, Activity, EventLog, Stats } from '../types';
import { storageService } from '../storage.js';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left cursor-pointer ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${checked ? 'bg-blue-600' : 'bg-slate-300'
            }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                }`}
        />
    </button>
);

export const SettingsPage = ({ settings, onSave }: { settings: Settings | null, onSave: (s: Settings) => void }) => {
    // Initialize with default settings if null
    const defaultSettings: Settings = {
        daily_focus_target: 4,
        max_tab_switches: 15,
        digital_sunset: '22:00',
        alert_sensitivity: 'Balanced',
        full_name: 'User',
        email: 'user@example.com',
        role: 'Professional',
        auto_trigger_breathing: 0,
        block_notifications: 0,
        smart_breaks: 0,
        burnout_alerts_level: 50,
        micro_break_interval: '25m'
    };
    
    const [localSettings, setLocalSettings] = useState<Settings>(settings || defaultSettings);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [events, setEvents] = useState<EventLog[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        if (settings) {
            // Merge incoming settings with defaults to ensure all fields exist
            const merged = { ...defaultSettings, ...settings };
            setLocalSettings(merged);
        }
    }, [settings]);

    // Fetch stats, activities, and events for account statistics
    useEffect(() => {
        const fetchData = async () => {
            const [activitiesData, eventsData, statsData] = await Promise.all([
                storageService.getActivities(),
                storageService.getEvents(),
                storageService.getStats()
            ]);
            setActivities(activitiesData);
            setEvents(eventsData);
            setStats(statsData);
        };
        fetchData();
    }, []);

    const toggleDarkMode = (newValue: boolean) => {
        setDarkMode(newValue);
        localStorage.setItem('darkMode', JSON.stringify(newValue));
        if (newValue) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('darkModeChange', { detail: newValue }));
    };

    // Listen for dark mode changes from other components
    useEffect(() => {
        const handleDarkModeChange = () => {
            const saved = localStorage.getItem('darkMode');
            if (saved) {
                const isDark = JSON.parse(saved);
                setDarkMode(isDark);
                // Apply or remove dark class
                if (isDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };
        
        window.addEventListener('darkModeChange', handleDarkModeChange);
        return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
    }, []);

    // Data management functions
    const handleExportData = async () => {
        try {
            const [activitiesData, eventsData, statsData, settingsData] = await Promise.all([
                storageService.getActivities(),
                storageService.getEvents(),
                storageService.getStats(),
                storageService.getSettings()
            ]);

            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                settings: settingsData,
                activities: activitiesData,
                events: eventsData,
                stats: statsData
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focus-recovery-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('Data exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
    };

    const handleImportData = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importData = JSON.parse(text);

                if (importData.settings) await storageService.updateSettings(importData.settings);
                if (importData.stats) await storageService.updateStats(importData.stats);
                
                alert('Data imported successfully! Please refresh the page.');
                window.location.reload();
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import data. Please check the file format.');
            }
        };
        input.click();
    };

    const handleClearAllData = async () => {
        if (!confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
            return;
        }

        try {
            await storageService.clearAllData();
            alert('All data cleared successfully! The page will reload.');
            window.location.reload();
        } catch (error) {
            console.error('Clear data error:', error);
            alert('Failed to clear data');
        }
    };

    // Calculate account statistics
    const totalSessions = activities.length;
    const totalHours = activities.reduce((sum, act) => {
        if (act.start_time && act.end_time) {
            const duration = new Date(act.end_time).getTime() - new Date(act.start_time).getTime();
            return sum + (duration / (1000 * 60 * 60));
        }
        return sum;
    }, 0);
    const avgFocusScore = stats?.focus_score || 50;
    const totalEvents = events.length;

    const update = (key: keyof Settings, val: any) => {
        setLocalSettings({ ...localSettings, [key]: val });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(localSettings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        if (settings) {
            setLocalSettings({ ...defaultSettings, ...settings });
        } else {
            setLocalSettings(defaultSettings);
        }
    };

    return (
        <div className="w-full max-w-[90rem] mx-auto flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 shrink-0">
                <div className="flex flex-col gap-1 sticky top-24 mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-4 mb-3">Preferences</h3>
                    <SidebarItem icon={User} label="Profile Settings" active={true} onClick={() => { }} />
                    <SidebarItem icon={Bell} label="Notifications" active={false} onClick={() => { }} />
                    <SidebarItem icon={Target} label="Focus Rules" active={false} onClick={() => { }} />
                    <SidebarItem icon={Bolt} label="Integrations" active={false} onClick={() => { }} />
                </div>

                <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Appearance</h4>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                        <div className="flex gap-3 items-center">
                            <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-400 transition-colors">
                                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Dark Mode</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle theme</p>
                            </div>
                        </div>
                        <Toggle
                            checked={darkMode}
                            onChange={toggleDarkMode}
                        />
                    </div>
                </section>
            </aside>

            <div className="flex-1 flex flex-col gap-8">
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl transition-colors">
                                <img src="https://picsum.photos/seed/alex/200" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full shadow-lg text-white border-4 border-white dark:border-slate-800 hover:scale-110 transition-transform cursor-pointer">
                                <Bolt size={16} />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight">{localSettings.full_name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{localSettings.email}</p>
                            <div className="flex gap-2 mt-4 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-full text-slate-600 dark:text-slate-400">Premium User</span>
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-xs font-bold rounded-full text-blue-600 dark:text-blue-400">Active Recovery</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={localSettings.full_name}
                                onChange={(e) => update('full_name', e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={localSettings.email}
                                onChange={(e) => update('email', e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Professional Role</label>
                            <input
                                type="text"
                                value={localSettings.role || ''}
                                onChange={(e) => update('role', e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-slate-900 dark:text-slate-100"
                                placeholder="e.g., Software Developer, Designer"
                            />
                            <p className="text-xs text-slate-400 ml-2 font-medium">This helps us tailor focus intervals to your specific work type.</p>
                        </div>
                    </div>
                </section>

                {/* Account Statistics */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Account Statistics</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your productivity insights at a glance.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                                <span className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60 uppercase tracking-wider">Total</span>
                            </div>
                            <p className="text-3xl font-black text-blue-900 dark:text-blue-100">{totalSessions}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mt-1">Sessions Tracked</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-800 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                                <span className="text-xs font-bold text-purple-600/60 dark:text-purple-400/60 uppercase tracking-wider">Hours</span>
                            </div>
                            <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{totalHours.toFixed(1)}</p>
                            <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">Total Focus Time</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-800 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                                <span className="text-xs font-bold text-green-600/60 dark:text-green-400/60 uppercase tracking-wider">Score</span>
                            </div>
                            <p className="text-3xl font-black text-green-900 dark:text-green-100">{avgFocusScore}</p>
                            <p className="text-xs text-green-700 dark:text-green-300 font-semibold mt-1">Current Focus Score</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-800 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <Zap className="text-orange-600 dark:text-orange-400" size={20} />
                                <span className="text-xs font-bold text-orange-600/60 dark:text-orange-400/60 uppercase tracking-wider">Events</span>
                            </div>
                            <p className="text-3xl font-black text-orange-900 dark:text-orange-100">{totalEvents}</p>
                            <p className="text-xs text-orange-700 dark:text-orange-300 font-semibold mt-1">Activity Logs</p>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Data Management</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Backup, restore, or reset your data.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={handleExportData}
                            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Download size={24} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Export Data</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Download backup as JSON</p>
                            </div>
                        </button>

                        <button
                            onClick={handleImportData}
                            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Import Data</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Restore from backup file</p>
                            </div>
                        </button>

                        <button
                            onClick={handleClearAllData}
                            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trash2 size={24} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">Clear All Data</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Reset everything (irreversible)</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                        <Info className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Data Storage</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">All your data is stored locally in your browser using IndexedDB and Chrome Storage. We recommend exporting backups regularly.</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Focus Rules</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure how the system protects your attention.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { key: 'auto_trigger_breathing', label: 'Auto-trigger Breathing', desc: 'Initiate guided sessions based on high heart rate or strain.', icon: Wind },
                            { key: 'block_notifications', label: 'Block Notifications', desc: 'Silence all OS-level notifications during Deep Focus sessions.', icon: Bell },
                            { key: 'smart_breaks', label: 'Smart Breaks', desc: 'Automatically remind you to stand up every 45 minutes.', icon: Clock },
                        ].map((rule) => (
                            <div key={rule.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all gap-4">
                                <div className="flex gap-4 items-start sm:items-center">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl flex flex-shrink-0 items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm transition-colors">
                                        {/* <rule.icon size={20} /> */}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{rule.label}</h4>
                                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{rule.desc}</p>
                                    </div>
                                </div>
                                <div className="sm:ml-4 flex-shrink-0 ml-[60px]">
                                    <Toggle
                                        checked={!!(localSettings as any)[rule.key]}
                                        onChange={(val) => update(rule.key as any, val ? 1 : 0)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 text-white p-6 rounded-3xl shadow-2xl gap-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="bg-blue-600/20 p-2 rounded-full">
                            <Info className="text-blue-500" size={20} />
                        </div>
                        <p className="text-sm font-medium text-slate-300">Last synced: <span className="text-white font-bold">2 minutes ago</span></p>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            onClick={handleDiscard}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-slate-700 font-bold hover:bg-slate-800 transition-colors text-sm cursor-pointer"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-blue-600 text-white font-black hover:scale-105 transition-transform text-sm shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
