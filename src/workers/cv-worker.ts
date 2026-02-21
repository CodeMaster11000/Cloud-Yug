import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
if (typeof window === 'undefined') {
    globalThis.window = self as any;
}

import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;

// Eye Aspect Ratio thresholds and counters
const EAR_THRESHOLD = 0.22;
let consecutiveLowEARFrames = 0;
let stressLevel = 0;

// Blink tracking
let blinkHistory: number[] = [];
let lastBlinkTime = 0;
const BLINK_COOLDOWN = 300; // ms between blinks

// MediaPipe Left Eye contour landmarks roughly correspond to these indices in 468 mesh
const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];

// Head pose landmarks
const NOSE_TIP = 1;
const CHIN = 152;
const LEFT_EAR = 234;
const RIGHT_EAR = 454;

/**
 * Calculate Eye Aspect Ratio (EAR)
 * p1...p6 match standard eye contour logic from MediaPipe:
 * 0 = left corner, 1/2 = top, 3 = right corner, 4/5 = bottom
 */
function calculateEAR(eye: faceLandmarksDetection.Keypoint[]): number {
    if (eye.length < 6) return 0;
    
    // Vertical distances
    const num1 = Math.sqrt(
        Math.pow(eye[1].x - eye[5].x, 2) + 
        Math.pow(eye[1].y - eye[5].y, 2)
    );
    const num2 = Math.sqrt(
        Math.pow(eye[2].x - eye[4].x, 2) + 
        Math.pow(eye[2].y - eye[4].y, 2)
    );
    
    // Horizontal distance
    const den = Math.sqrt(
        Math.pow(eye[0].x - eye[3].x, 2) + 
        Math.pow(eye[0].y - eye[3].y, 2)
    );
    
    return (num1 + num2) / (2.0 * den);
}

/**
 * Analyze blink rate pattern
 * Normal: 15-20 blinks/min, Fatigued: <10 or >30 blinks/min
 */
function analyzeBlinkRate(now: number): {
    blinksPerMin: number;
    isFatigued: boolean;
    blinkRateScore: number;
} {
    // Clean old blinks (keep last 60 seconds)
    blinkHistory = blinkHistory.filter(t => now - t < 60000);
    
    const blinksPerMin = blinkHistory.length;
    
    // Normal range: 15-20 blinks/min
    let blinkRateScore = 0;
    if (blinksPerMin < 10) {
        blinkRateScore = 50; // Low blink rate = screen hypnosis
    } else if (blinksPerMin > 30) {
        blinkRateScore = 40; // High blink rate = eye irritation
    } else if (blinksPerMin >= 15 && blinksPerMin <= 20) {
        blinkRateScore = 0; // Optimal
    } else {
        blinkRateScore = Math.abs(17.5 - blinksPerMin) * 5; // Deviance from optimal
    }
    
    const isFatigued = blinksPerMin < 10 || blinksPerMin > 30;
    
    return { blinksPerMin, isFatigued, blinkRateScore };
}

/**
 * Detect head posture (slouching, forward head)
 */
function analyzeHeadPose(keypoints: faceLandmarksDetection.Keypoint[]): {
    isSlumping: boolean;
    isForwardHead: boolean;
    tiltAngle: number;
    postureScore: number;
} {
    const noseTip = keypoints[NOSE_TIP];
    const chin = keypoints[CHIN];
    const leftEar = keypoints[LEFT_EAR];
    const rightEar = keypoints[RIGHT_EAR];
    
    // Calculate head tilt angle
    const tilt = Math.atan2(
        leftEar.y - rightEar.y,
        leftEar.x - rightEar.x
    );
    const tiltAngle = tilt * (180 / Math.PI);
    
    // Check for slouching (nose significantly below ear line)
    const earMidY = (leftEar.y + rightEar.y) / 2;
    const isSlumping = noseTip.y > (earMidY + 30);
    
    // Check for forward head posture (chin too close to nose vertically)
    const chinNoseDist = Math.abs(chin.y - noseTip.y);
    const isForwardHead = chinNoseDist < 40;
    
    // Calculate posture score penalty
    let postureScore = 0;
    if (isSlumping) postureScore += 30;
    if (isForwardHead) postureScore += 20;
    if (Math.abs(tiltAngle) > 15) postureScore += 10; // Excessive tilt
    
    return { isSlumping, isForwardHead, tiltAngle, postureScore };
}

/**
 * Register a blink event
 */
function registerBlink(now: number): void {
    if (now - lastBlinkTime > BLINK_COOLDOWN) {
        blinkHistory.push(now);
        lastBlinkTime = now;
    }
}

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    if (type === 'INIT') {
        try {
            const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
            const detectorConfig = {
                runtime: 'tfjs',
                refineLandmarks: true,
            } as faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig;

            detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
            postMessage({ type: 'INIT_SUCCESS' });
        } catch (error) {
            postMessage({ type: 'INIT_ERROR', error: String(error) });
        }
    }

    if (type === 'PROCESS_FRAME') {
        if (!detector) {
            if (payload?.imageBitmap?.close) payload.imageBitmap.close();
            return;
        }

        try {
            const faces = await detector.estimateFaces(payload.imageBitmap);
            const now = Date.now();

            let eyeFatigue = false;
            let avgEAR = 0;
            let blinkData = { blinksPerMin: 0, isFatigued: false, blinkRateScore: 0 };
            let postureData = { isSlumping: false, isForwardHead: false, tiltAngle: 0, postureScore: 0 };

            if (faces.length > 0) {
                const face = faces[0];
                if (face.keypoints) {
                    // ── Eye Analysis ──
                    const leftEye = LEFT_EYE_INDICES.map(idx => face.keypoints[idx]);
                    const rightEye = RIGHT_EYE_INDICES.map(idx => face.keypoints[idx]);

                    const leftEAR = calculateEAR(leftEye);
                    const rightEAR = calculateEAR(rightEye);
                    avgEAR = (leftEAR + rightEAR) / 2.0;

                    // Detect blink/squinting
                    if (avgEAR < EAR_THRESHOLD) {
                        consecutiveLowEARFrames++;
                        eyeFatigue = true;
                        
                        // Register as blink if brief closure
                        if (consecutiveLowEARFrames === 1) {
                            registerBlink(now);
                        }
                    } else {
                        // Eyes opened - check if it was a significant squint
                        if (consecutiveLowEARFrames > 2) {
                            // Extended squinting = stress
                            stressLevel += Math.min(consecutiveLowEARFrames * 0.5, 5);
                        }
                        consecutiveLowEARFrames = 0;

                        // Slowly decay stress when eyes are open normally
                        if (stressLevel > 0) {
                            stressLevel = Math.max(0, stressLevel - 0.1);
                        }
                    }

                    // ── Blink Rate Analysis ──
                    blinkData = analyzeBlinkRate(now);

                    // ── Head Posture Analysis ──
                    postureData = analyzeHeadPose(face.keypoints);
                }
            }

            // Calculate eye fatigue score (0-100, higher = more fatigued)
            const earScore = avgEAR < EAR_THRESHOLD ? 
                Math.min((EAR_THRESHOLD - avgEAR) * 500, 100) : 0;

            postMessage({
                type: 'RESULTS',
                payload: {
                    // Basic metrics
                    eyeFatigue,
                    stressLevel: Math.floor(stressLevel),
                    
                    // Detailed metrics
                    avgEAR: avgEAR.toFixed(3),
                    earScore: Math.round(earScore),
                    
                    // Blink metrics
                    blinksPerMin: blinkData.blinksPerMin,
                    blinkRateScore: Math.round(blinkData.blinkRateScore),
                    blinkFatigued: blinkData.isFatigued,
                    
                    // Posture metrics
                    isSlumping: postureData.isSlumping,
                    isForwardHead: postureData.isForwardHead,
                    headTilt: Math.round(postureData.tiltAngle),
                    postureScore: Math.round(postureData.postureScore),
                    
                    // Combined physiological score (0-100, higher = more fatigued)
                    physiologicalScore: Math.round(
                        (earScore * 0.4) + 
                        (blinkData.blinkRateScore * 0.3) + 
                        (postureData.postureScore * 0.2) + 
                        (Math.min(stressLevel * 2, 100) * 0.1)
                    )
                }
            });

        } catch (error) {
            console.error('Error processing frame:', error);
        } finally {
            if (payload?.imageBitmap?.close) {
                payload.imageBitmap.close();
            }
        }
    }
};
