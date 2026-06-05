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
const countFingers = (landmarks) => {
  const tips = [8, 12, 16, 20];      // index, middle, ring, pinky tips
  const pips = [6, 10, 14, 18];      // their middle joints
  let count = 0;
  
  tips.forEach((tip, i) => {
    if (landmarks[tip].y < landmarks[pips[i]].y) count++;
  });
  
  // Thumb check: Y-axis tip above joint (independent of mirrored orientation)
  if (landmarks[4].y < landmarks[3].y) count++;
  
  return count;
};

export default function useHandGesture() {
  const [isActive, setIsActive] = useState(false);
  const [gesture, setGesture] = useState('None');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  
  // Timing / gesture tracking variables
  const lastPinchTimeRef = useRef(0);
  const topStartTimeRef = useRef(null);
  const topTriggeredRef = useRef(false);
  const scrollVelocityRef = useRef(0);
  
  // GC optimization: circular fixed-size array instead of push/shift
  const gestureBufferRef = useRef(new Array(12).fill('None'));
  const frameCountRef = useRef(0);
  const committedGestureRef = useRef('None');

  // Initialize HandLandmarker on mount
  useEffect(() => {
    let isMounted = true;
    async function initLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          numHands: 1,
          runningMode: 'VIDEO',
          baseOptions: {
            delegate: 'GPU',
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
          }
        });
        if (isMounted) {
          handLandmarkerRef.current = landmarker;
        }
      } catch (err) {
        console.error('Failed to load HandLandmarker:', err);
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
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

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

    // Draw committed gesture label
    ctx.fillStyle = '#00ffff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentGesture.toUpperCase(), canvas.width / 2, 20);
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
      const fingers = countFingers(landmarks);
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
      scrollVelocityRef.current = 6;
      topStartTimeRef.current = null;
      topTriggeredRef.current = false;
    } else if (activeGesture === 'SCROLL_UP') {
      scrollVelocityRef.current = -6;
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
    if (video && landmarker && video.readyState >= 2) {
      const timestamp = performance.now();
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
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
      }
    }

    if (scrollVelocityRef.current !== 0) {
      window.scrollBy(0, scrollVelocityRef.current);
    }

    requestRef.current = requestAnimationFrame(predictLoop);
  }, [processGestures, drawSkeleton]);

  const enableGesture = useCallback(async () => {
    if (isActive) return;
    try {
      // Detect touch screen or mobile viewport width
      const isMobile = window.innerWidth < 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      
      // Choose low resolution 320x240 for mobile to speed up GPU inference
      const constraints = isMobile 
        ? { video: { facingMode: 'user', width: 320, height: 240 } }
        : { video: { facingMode: 'user', width: 640, height: 480 } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setIsActive(true);
      
      // Wait for React DOM mounts, then load source stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            requestRef.current = requestAnimationFrame(predictLoop);
          };
        }
      }, 100);
    } catch (err) {
      console.error('Camera permissions or startup failed:', err);
    }
  }, [isActive, predictLoop]);

  const disableGesture = useCallback(() => {
    if (!isActive) return;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
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
  }, [isActive]);

  // Cleanup loop on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return {
    isActive,
    gesture,
    enableGesture,
    disableGesture,
    videoRef,
    canvasRef
  };
}
