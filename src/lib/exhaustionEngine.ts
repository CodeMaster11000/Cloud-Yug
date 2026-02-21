/**
 * Unified Exhaustion Detection Engine
 * Combines behavioral metrics (extension) + physiological metrics (CV detection)
 * to produce a comprehensive exhaustion index
 */

export interface BehavioralMetrics {
    tabSwitchScore: number;      // 0-100 (penalty from extension)
    typingFatigueScore: number;  // 0-100
    clickAccuracyScore: number;  // 0-100
    mouseErraticScore: number;   // 0-100
    scrollAnxietyScore: number;  // 0-100
    timeOfDayScore: number;      // 0-100
    idleTimeScore: number;       // 0-100
}

export interface PhysiologicalMetrics {
    eyeFatigueScore: number;     // 0-100 (from CV worker)
    blinkRateScore: number;      // 0-100
    earScore: number;            // Eye aspect ratio score
    stressLevel: number;         // Accumulated stress from CV
}

export interface ExhaustionResult {
    totalScore: number;          // 0-100 (100 = optimal, 0 = critical)
    level: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical';
    behavioralScore: number;     // 0-100
    physiologicalScore: number;  // 0-100
    factors: FactorContribution[];
    recommendation: string;
    shouldIntervene: boolean;
}

export interface FactorContribution {
    name: string;
    value: number;               // Actual metric value
    contribution: number;        // Weighted contribution to final score
    weight: number;              // Weight percentage
    category: 'behavioral' | 'physiological';
}

/**
 * Calculate comprehensive exhaustion index
 * Weights: Behavioral (40%) + Physiological (60%)
 */
export function calculateExhaustionIndex(
    behavioral: Partial<BehavioralMetrics>,
    physiological: Partial<PhysiologicalMetrics>
): ExhaustionResult {
    
    // Define weights for each factor
    const weights = {
        // Behavioral factors (40% total)
        tabSwitchScore: 0.10,
        typingFatigueScore: 0.10,
        clickAccuracyScore: 0.07,
        mouseErraticScore: 0.05,
        scrollAnxietyScore: 0.03,
        timeOfDayScore: 0.03,
        idleTimeScore: 0.02,
        
        // Physiological factors (60% total)
        eyeFatigueScore: 0.25,
        blinkRateScore: 0.15,
        earScore: 0.10,
        stressLevel: 0.10
    };

    const factors: FactorContribution[] = [];
    let behavioralTotal = 0;
    let physiologicalTotal = 0;

    // Calculate behavioral contributions
    Object.entries(behavioral).forEach(([key, value]) => {
        if (value !== undefined && weights[key as keyof typeof weights]) {
            const weight = weights[key as keyof typeof weights];
            const contribution = value * weight;
            behavioralTotal += contribution;
            
            factors.push({
                name: formatFactorName(key),
                value,
                contribution,
                weight: weight * 100,
                category: 'behavioral'
            });
        }
    });

    // Calculate physiological contributions
    Object.entries(physiological).forEach(([key, value]) => {
        if (value !== undefined && weights[key as keyof typeof weights]) {
            const weight = weights[key as keyof typeof weights];
            const contribution = value * weight;
            physiologicalTotal += contribution;
            
            factors.push({
                name: formatFactorName(key),
                value,
                contribution,
                weight: weight * 100,
                category: 'physiological'
            });
        }
    });

    // Normalize scores (penalties are inverted: high penalty = low score)
    const behavioralScore = Math.max(0, Math.min(100, 100 - (behavioralTotal * 100)));
    const physiologicalScore = Math.max(0, Math.min(100, 100 - (physiologicalTotal * 100)));
    
    // Calculate final weighted score
    const totalScore = (behavioralScore * 0.4) + (physiologicalScore * 0.6);

    // Determine exhaustion level
    let level: ExhaustionResult['level'];
    if (totalScore >= 80) level = 'optimal';
    else if (totalScore >= 60) level = 'mild';
    else if (totalScore >= 40) level = 'moderate';
    else if (totalScore >= 20) level = 'severe';
    else level = 'critical';

    // Generate recommendation
    const recommendation = generateRecommendation(level, factors);
    const shouldIntervene = totalScore < 40;

    return {
        totalScore: Math.round(totalScore),
        level,
        behavioralScore: Math.round(behavioralScore),
        physiologicalScore: Math.round(physiologicalScore),
        factors: factors.sort((a, b) => b.contribution - a.contribution),
        recommendation,
        shouldIntervene
    };
}

/**
 * Predict fatigue trajectory using linear regression
 */
export function predictFatigueTrajectory(historicalScores: number[]): {
    predictedScore: number;
    timeToExhaustion: number; // minutes until score < 40
    trend: 'improving' | 'stable' | 'declining' | 'critical';
    recommendation: string;
} {
    if (historicalScores.length < 5) {
        return {
            predictedScore: historicalScores[historicalScores.length - 1] || 100,
            timeToExhaustion: Infinity,
            trend: 'stable',
            recommendation: 'Not enough data for prediction yet'
        };
    }

    // Use last 30 data points for prediction
    const n = Math.min(historicalScores.length, 30);
    const recent = historicalScores.slice(-n);

    // Simple linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    recent.forEach((score, i) => {
        sumX += i;
        sumY += score;
        sumXY += i * score;
        sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict score 30 minutes ahead (assuming 1 datapoint per minute)
    const predictedScore = Math.max(0, Math.min(100, slope * (n + 30) + intercept));

    // Calculate time to exhaustion threshold (score < 40)
    const currentScore = recent[recent.length - 1];
    let timeToExhaustion = Infinity;
    
    if (slope < 0 && currentScore > 40) {
        timeToExhaustion = Math.abs((40 - currentScore) / slope);
    }

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' | 'critical';
    if (slope > 0.5) trend = 'improving';
    else if (slope > -0.5) trend = 'stable';
    else if (slope > -2) trend = 'declining';
    else trend = 'critical';

    // Generate recommendation
    let recommendation: string;
    if (timeToExhaustion < 15) {
        recommendation = 'Take a break NOW - exhaustion imminent within 15 minutes';
    } else if (timeToExhaustion < 30) {
        recommendation = 'Schedule a break within 30 minutes to prevent exhaustion';
    } else if (trend === 'declining') {
        recommendation = 'Declining trend detected - plan breaks proactively';
    } else if (trend === 'critical') {
        recommendation = 'Critical decline - immediate intervention recommended';
    } else if (trend === 'improving') {
        recommendation = 'Recovery trend detected - maintain current pace';
    } else {
        recommendation = 'Stable focus levels - you\'re doing well';
    }

    return {
        predictedScore: Math.round(predictedScore),
        timeToExhaustion: Math.round(timeToExhaustion),
        trend,
        recommendation
    };
}

/**
 * Analyze patterns to detect specific exhaustion types
 */
export function detectExhaustionPattern(factors: FactorContribution[]): {
    pattern: 'cognitive' | 'physical' | 'visual' | 'mixed' | 'none';
    confidence: number;
    causes: string[];
} {
    const physiologicalFactors = factors.filter(f => f.category === 'physiological');
    const behavioralFactors = factors.filter(f => f.category === 'behavioral');

    const physioScore = physiologicalFactors.reduce((sum, f) => sum + f.contribution, 0);
    const behaviorScore = behavioralFactors.reduce((sum, f) => sum + f.contribution, 0);

    // Detect pattern based on dominant factors
    if (physioScore > behaviorScore * 2) {
        // Eye fatigue dominant
        return {
            pattern: 'visual',
            confidence: 0.85,
            causes: ['Eye strain', 'Screen brightness', 'Prolonged focus']
        };
    } else if (behaviorScore > physioScore * 2) {
        const hasTyping = factors.some(f => f.name.includes('Typing') && f.contribution > 0.05);
        const hasClicking = factors.some(f => f.name.includes('Click') && f.contribution > 0.05);
        
        if (hasTyping || hasClicking) {
            return {
                pattern: 'physical',
                confidence: 0.75,
                causes: ['Repetitive strain', 'Hand fatigue', 'Motor control decline']
            };
        } else {
            return {
                pattern: 'cognitive',
                confidence: 0.80,
                causes: ['Mental overload', 'Context switching', 'Decision fatigue']
            };
        }
    } else if (physioScore > 0.1 && behaviorScore > 0.1) {
        return {
            pattern: 'mixed',
            confidence: 0.70,
            causes: ['Multiple exhaustion factors', 'Prolonged work', 'Insufficient breaks']
        };
    }

    return {
        pattern: 'none',
        confidence: 1.0,
        causes: []
    };
}

// Helper functions

function formatFactorName(key: string): string {
    const names: Record<string, string> = {
        tabSwitchScore: 'Tab Switching',
        typingFatigueScore: 'Typing Fatigue',
        clickAccuracyScore: 'Click Accuracy',
        mouseErraticScore: 'Mouse Movement',
        scrollAnxietyScore: 'Scroll Behavior',
        timeOfDayScore: 'Time of Day',
        idleTimeScore: 'Idle Time',
        eyeFatigueScore: 'Eye Fatigue',
        blinkRateScore: 'Blink Rate',
        earScore: 'Eye Closure',
        stressLevel: 'Stress Level'
    };
    
    return names[key] || key;
}

function generateRecommendation(
    level: ExhaustionResult['level'],
    factors: FactorContribution[]
): string {
    const topFactor = factors[0];
    
    const recommendations: Record<string, string> = {
        optimal: 'You\'re doing great! Maintain your current work rhythm.',
        mild: `Light fatigue detected primarily from ${topFactor?.name}. Consider a short 2-minute break soon.`,
        moderate: `Moderate fatigue detected. ${topFactor?.name} is affecting your performance. Take a 5-minute break now.`,
        severe: `Significant exhaustion from ${topFactor?.name} and other factors. A 10-15 minute break is strongly recommended.`,
        critical: `Critical exhaustion detected! Stop work immediately and take a proper 20+ minute recovery break.`
    };
    
    return recommendations[level] || 'Monitor your fatigue levels';
}
