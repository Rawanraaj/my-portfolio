import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
];

// Helper to count extended fingers, accounting for mirrored coordinates
// Returns { count, details } for debug visibility
const countFingers = (landmarks) => {
  const tips = [8, 12, 16, 20];      // index, middle, ring, pinky tips
  const pips = [6, 10, 14, 18];      // their middle joints
  const names = ['IDX', 'MID', 'RNG', 'PNK'];
  let count = 0;
  const details = [];
  
  tips.forEach((tip, i) => {
    const diff = landmarks[pips[i]].y - landmarks[tip].y; // positive = extended
    const extended = diff > 0.02;
    if (extended) count++;
    details.push({ name: names[i], extended, diff: diff.toFixed(3) });
  });
  
  // Thumb: must be BOTH extended upward AND spread away from palm
  // Compare tip (4) vs MCP joint (2) for extension — more stable than vs IP (3)
  const thumbYDiff = landmarks[2].y - landmarks[4].y; // positive = tip above MCP
  const thumbExtended = thumbYDiff > 0.04;
  // Thumb must also be spread away from index base (5) on X axis
  const thumbXDiff = Math.abs(landmarks[4].x - landmarks[5].x);
  const thumbSpread = thumbXDiff > 0.06;
  const thumbUp = thumbExtended && thumbSpread;
  if (thumbUp) count++;
  details.push({ name: 'THB', extended: thumbUp, diff: `Y${thumbYDiff.toFixed(3)} X${thumbXDiff.toFixed(3)}` });
  
  return { count, details };
};

export default function useHandGesture() {
  const [isActive, setIsActive] = useState(false);
  const [gesture, setGesture] = useState('None');
  const [isModelReady, setIsModelReady] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(0);
  const lastVideoCurrentTimeRef = useRef(-1);
  
  // Timing / gesture tracking variables
  const lastPinchTimeRef = useRef(0);
  const topStartTimeRef = useRef(null);
  const topTriggeredRef = useRef(false);
  const scrollVelocityRef = useRef(0);
  const debugInfoRef = useRef({ count: 0, details: [] });
  
  // GC optimization: circular fixed-size array instead of push/shift
  const gestureBufferRef = useRef(new Array(12).fill('None'));
  const frameCountRef = useRef(0);
  const committedGestureRef = useRef('None');

  // Initialize HandLandmarker on mount (pinned to matching tasks-vision version 0.10.35, with CPU fallback)
  useEffect(() => {
    let isMounted = true;
    async function initLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        );
        let landmarker = null;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            numHands: 1,
            runningMode: 'VIDEO',
            baseOptions: {
              delegate: 'GPU',
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
            }
          });
        } catch (gpuErr) {
          console.warn('GPU delegate failed for HandLandmarker, falling back to CPU:', gpuErr);
          landmarker = await HandLandmarker.createFromOptions(vision, {
            numHands: 1,
            runningMode: 'VIDEO',
            baseOptions: {
              delegate: 'CPU',
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
            }
          });
        }
        if (isMounted && landmarker) {
          handLandmarkerRef.current = landmarker;
          setIsModelReady(true);
        }
      } catch (err) {
        console.error('Failed to load HandLandmarker:', err);
        if (isMounted) {
          setError('Failed to load hand tracking model.');
        }
      }
    }
    initLandmarker();
    return () => {
      isMounted = false;
    };
  }, []);

  const drawSkeleton = useCallback((landmarks, currentGesture) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    const videoWidth = video.videoWidth || 320;
    const videoHeight = video.videoHeight || 240;

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror drawing horizontally
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Draw lines
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    HAND_CONNECTIONS.forEach(([i, j]) => {
      const pt1 = landmarks[i];
      const pt2 = landmarks[j];
      if (pt1 && pt2) {
        ctx.beginPath();
        ctx.moveTo(pt1.x * canvas.width, pt1.y * canvas.height);
        ctx.lineTo(pt2.x * canvas.width, pt2.y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw dots
    ctx.fillStyle = '#00ffff';
    ctx.globalAlpha = 1.0;
    landmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();

    // ── DEBUG OVERLAY ──────────────────────────────────────
    const dbg = debugInfoRef.current;
    ctx.textAlign = 'center';
    // Big finger count number
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillText(`FINGERS: ${dbg.count}`, canvas.width / 2, 16);
    // Per-finger breakdown
    ctx.font = '9px "JetBrains Mono", monospace';
    if (dbg.details && dbg.details.length) {
      const line = dbg.details.map(d => `${d.name}:${d.extended ? '✓' : '✗'}(${d.diff})`).join(' ');
      ctx.fillStyle = '#ffff00';
      ctx.fillText(line, canvas.width / 2, 30);
    }
    // Committed gesture label
    ctx.fillStyle = '#00ffff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(currentGesture.toUpperCase(), canvas.width / 2, 44);
    // ── END DEBUG ──────────────────────────────────────────
  }, []);

  const processGestures = useCallback((landmarks) => {
    const lm8 = landmarks[8];
    const lm4 = landmarks[4];
    if (!lm8 || !lm4) return 'None';

    const now = Date.now();

    // Update Custom Cursor coordinates (landmark 8)
    if (window.__setCursorPos) {
      const targetX = (1 - lm8.x) * window.innerWidth;
      const targetY = lm8.y * window.innerHeight;
      window.__setCursorPos(targetX, targetY);
    }

    // Distance for pinch check (4 <-> 8)
    const dist = Math.sqrt(Math.pow(lm4.x - lm8.x, 2) + Math.pow(lm4.y - lm8.y, 2));

    // 1. Determine raw gesture for current frame
    let rawGesture = 'STOP';
    if (dist < 0.05) {
      rawGesture = 'CLICK';
    } else {
      const result = countFingers(landmarks);
      debugInfoRef.current = result;
      const fingers = result.count;
      if (fingers === 2) {
        rawGesture = 'SCROLL_DOWN';
      } else if (fingers === 3) {
        rawGesture = 'SCROLL_UP';
      } else if (fingers === 0) {
        rawGesture = 'TOP';
      } else {
        rawGesture = 'STOP';
      }
    }

    // 2. Feed raw gesture into circular array buffer (GC optimized)
    const index = frameCountRef.current % 12;
    gestureBufferRef.current[index] = rawGesture;
    frameCountRef.current++;

    // 3. Count buffer frequencies (200ms debounce)
    const counts = {};
    for (let i = 0; i < 12; i++) {
      const val = gestureBufferRef.current[i];
      counts[val] = (counts[val] || 0) + 1;
    }

    // 4. Commit gesture if 10/12 match
    let activeGesture = committedGestureRef.current;
    const match = Object.keys(counts).find((g) => counts[g] >= 10);
    if (match) {
      activeGesture = match;
      committedGestureRef.current = match;
    }

    // 5. Execute committed gesture actions
    if (activeGesture === 'SCROLL_DOWN') {
      scrollVelocityRef.current += (4 - scrollVelocityRef.current) * 0.12;
      topStartTimeRef.current = null;
      topTriggeredRef.current = false;
    } else if (activeGesture === 'SCROLL_UP') {
      scrollVelocityRef.current += (-4 - scrollVelocityRef.current) * 0.12;
      topStartTimeRef.current = null;
      topTriggeredRef.current = false;
    } else if (activeGesture === 'TOP') {
      scrollVelocityRef.current = 0;
      if (!topStartTimeRef.current && !topTriggeredRef.current) {
        topStartTimeRef.current = now;
      } else if (topStartTimeRef.current && !topTriggeredRef.current) {
        if (now - topStartTimeRef.current >= 500) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          topTriggeredRef.current = true;
        }
      }
    } else if (activeGesture === 'CLICK') {
      scrollVelocityRef.current = 0;
      topStartTimeRef.current = null;
      topTriggeredRef.current = false;
      
      if (now - lastPinchTimeRef.current > 800) {
        lastPinchTimeRef.current = now;
        const targetX = (1 - lm8.x) * window.innerWidth;
        const targetY = lm8.y * window.innerHeight;
        const element = document.elementFromPoint(targetX, targetY);
        if (element) {
          const clickEvent = new MouseEvent('click', {
            clientX: targetX,
            clientY: targetY,
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(clickEvent);
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.focus();
          }
        }
      }
    } else {
      // STOP or other fallback
      scrollVelocityRef.current = 0;
      topStartTimeRef.current = null;
      topTriggeredRef.current = false;
    }

    setGesture(activeGesture);
    return activeGesture;
  }, []);

  const predictLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    
    if (video && landmarker && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const now = performance.now();
      // Ensure strictly monotonically increasing timestamp for MediaPipe
      const timestamp = Math.max(now, lastVideoTimeRef.current + 1);
      
      if (video.currentTime !== lastVideoCurrentTimeRef.current) {
        lastVideoCurrentTimeRef.current = video.currentTime;
        lastVideoTimeRef.current = timestamp;
        
        try {
          const results = landmarker.detectForVideo(video, timestamp);
          if (results && results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            const detectedGesture = processGestures(landmarks);
            drawSkeleton(landmarks, detectedGesture);
          } else {
            // No hand detected: stop scrolling and reset buffer
            scrollVelocityRef.current = 0;
            setGesture('None');
            committedGestureRef.current = 'None';
            gestureBufferRef.current.fill('None');
            frameCountRef.current = 0;
            topStartTimeRef.current = null;
            topTriggeredRef.current = false;
            
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        } catch (detErr) {
          console.warn('detectForVideo frame error:', detErr);
        }
      }
    }

    // Smooth scroll with instant behavior to prevent fighting CSS scroll-behavior: smooth
    if (Math.abs(scrollVelocityRef.current) > 0.1) {
      window.scrollBy({ top: scrollVelocityRef.current, left: 0, behavior: 'instant' });
    } else {
      scrollVelocityRef.current = 0;
    }

    requestRef.current = requestAnimationFrame(predictLoop);
  }, [processGestures, drawSkeleton]);

  // Robustly bind the camera stream when isActive and video element are both ready
  useEffect(() => {
    if (isActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');

      let playStarted = false;
      const startPlayback = () => {
        if (playStarted) return;
        playStarted = true;
        video.play().then(() => {
          if (!requestRef.current) {
            requestRef.current = requestAnimationFrame(predictLoop);
          }
        }).catch((err) => {
          console.warn('video.play() was interrupted or rejected:', err);
        });
      };

      if (video.readyState >= 1) {
        startPlayback();
      } else {
        video.onloadedmetadata = startPlayback;
        video.onloadeddata = startPlayback;
      }
    }
  }, [isActive, predictLoop]);

  const enableGesture = useCallback(async () => {
    if (isActive) return;
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser or over insecure HTTP.');
      return;
    }

    try {
      const isMobile = window.innerWidth < 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: isMobile ? 320 : 640 },
          height: { ideal: isMobile ? 240 : 480 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintErr) {
        console.warn('Specific camera constraints failed, attempting fallback to generic video:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      console.error('Camera permissions or startup failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(`Camera error: ${err.message || err.name || 'Unable to start camera'}`);
      }
    }
  }, [isActive]);

  const disableGesture = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setGesture('None');
    committedGestureRef.current = 'None';
    gestureBufferRef.current.fill('None');
    frameCountRef.current = 0;
    scrollVelocityRef.current = 0;
    topStartTimeRef.current = null;
    topTriggeredRef.current = false;
    setError(null);
  }, []);

  // Cleanup loop on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isActive,
    gesture,
    isModelReady,
    error,
    enableGesture,
    disableGesture,
    videoRef,
    canvasRef
  };
}
