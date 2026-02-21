export interface Settings {
    full_name: string;
    email: string;
    role?: string;
    daily_focus_target: number;
    max_tab_switches: number;
    digital_sunset: string;
    alert_sensitivity: string;
    auto_trigger_breathing?: number;
    block_notifications?: number;
    smart_breaks?: number;
    burnout_alerts_level?: number;
    micro_break_interval?: string;
}

export interface Activity {
    id: number;
    type: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    score_impact: number;
}

export interface EventLog {
    id: number;
    timestamp: string;
    event_type: string;
    message: string;
}

export interface BehavioralFactors {
    tabSwitching: {
        penalty: number;
        switches: number;
        maxWeight: number;
    };
    typingFatigue: {
        penalty: number;
        maxWeight: number;
    };
    idle: {
        penalty: number;
        state: string;
        maxWeight: number;
    };
    clickAccuracy: {
        penalty: number;
        maxWeight: number;
    };
    lateNight: {
        penalty: number;
        hour: number;
        maxWeight: number;
    };
    erraticMouse: {
        penalty: number;
        maxWeight: number;
    };
    anxiousScroll: {
        penalty: number;
        maxWeight: number;
    };
}

export interface Insight {
    type: 'warning' | 'alert' | 'info' | 'suggestion' | 'positive';
    icon: string;
    title: string;
    message: string;
}

export interface Stats {
    focus_score: number;
    active_time: string;
    idle_time: string;
    tab_switches: number;
    session_duration: string;
    score_improvement: number;
    interventions: number;
    burnout_trend: number[];
    distraction_peak: string;
    // New behavioral tracking fields
    currentScore?: number;
    factors?: BehavioralFactors;
    hourlyScores?: Array<{ hour: string; avgScore: number; count: number }>;
    trend?: number;
    insights?: Insight[];
    idleState?: string;
    // Mouse and scroll metrics
    mouseActivity?: {
        directionChanges: number;
        speed: number;
        penalty: number;
    };
    scrollActivity?: {
        rapidScrolls: number;
        penalty: number;
    };
    // Typing metrics
    typingMetrics?: {
        avgInterval: number;
        variance: number;
        errorRate: number;
        fatigued: boolean;
    };
    // Click metrics
    clickMetrics?: {
        hesitationRate: number;
        fatigued: boolean;
    };
}
