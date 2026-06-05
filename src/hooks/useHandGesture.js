import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
];

// Helper to analyze hand movement history for wave gestures
const analyzeHistory = (history, currentPt) => {
  if (history.length < 5) return null;
  
  const now = Date.now();
  // Filter history to last 500ms
  const recent = history.filter(p => now - p.t < 500);
  if (recent.length < 5) return null;
  
  // Find min/max and direction changes in X (for horizontal wave)
  let minX = recent[0].x, maxX = recent[0].x;
  let minY = recent[0].y, maxY = recent[0].y;
  let totalDistX = 0;
  let directionChangesX = 0;
  let lastDeltaX = 0;
  
  for (let i = 1; i < recent.length; i++) {
    const p = recent[i];
    const prev = recent[i - 1];
    
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    
    const deltaX = p.x - prev.x;
    totalDistX += Math.abs(deltaX);
    
    if (i > 1 && deltaX !== 0 && lastDeltaX !== 0) {
      if (Math.sign(deltaX) !== Math.sign(lastDeltaX)) {
        directionChangesX++;
      }
    }
    if (deltaX !== 0) {
      lastDeltaX = deltaX;
    }
  }
  
  // Find a point around 150ms-400ms ago to detect vertical swipes
  const swipeStartPt = recent.find(p => now - p.t >= 150 && now - p.t <= 400);
  
  let swipeY = 0;
  if (swipeStartPt) {
    const dy = currentPt.y - swipeStartPt.y;
    // Y decreases as hand moves up
    if (dy < -0.12) {
      swipeY = -1; // Wave/Swipe Up
    } else if (dy > 0.12) {
      swipeY = 1; // Wave/Swipe Down
    }
  }
  
  // Detect side-to-side wave:
  // - Hand has moved back and forth (min 2 direction changes)
  // - Width span is wide enough (> 0.08)
  // - Total distance traveled horizontally is large (> 0.15)
  const isHorizontalWave = (maxX - minX > 0.08) && (directionChangesX >= 2) && (totalDistX > 0.15);
  
  return {
    swipeY,
    isHorizontalWave
  };
};

export default function useHandGesture() {
  const [isActive, setIsActive] = useState(false);
  const [gesture, setGesture] = useState('None');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastPinchTimeRef = useRef(0);
  const fistStartTimeRef = useRef(null);
  const scrollVelocityRef = useRef(0);
  const historyRef = useRef([]);

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

    // Draw gesture label in JetBrains Mono
    ctx.fillStyle = '#00ffff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentGesture.toUpperCase(), canvas.width / 2, 20);
  }, []);

  const processGestures = useCallback((landmarks) => {
    const lm8 = landmarks[8];
    const lm4 = landmarks[4];
    const lm5 = landmarks[5];
    const lm9 = landmarks[9];
    const lm13 = landmarks[13];
    const lm17 = landmarks[17];
    const lm12 = landmarks[12];
    const lm16 = landmarks[16];
    const lm20 = landmarks[20];

    if (!lm8 || !lm9) return 'None';

    const now = Date.now();

    // Track position in history
    historyRef.current.push({ x: lm9.x, y: lm9.y, t: now });
    historyRef.current = historyRef.current.filter(p => now - p.t < 500);

    // Position Custom Cursor
    if (window.__setCursorPos) {
      // Map mirrored x-coordinate
      const targetX = (1 - lm8.x) * window.innerWidth;
      const targetY = lm8.y * window.innerHeight;
      window.__setCursorPos(targetX, targetY);
    }

    // Distance for pinch check
    const dist = Math.sqrt(Math.pow(lm4.x - lm8.x, 2) + Math.pow(lm4.y - lm8.y, 2));

    // Palm check (Open hand): Index, Middle, Ring, Pinky all extended (tip Y < knuckle Y)
    // and they should be spread out/not pinching.
    const isPalm = lm8.y < lm5.y && lm12.y < lm9.y && lm16.y < lm13.y && lm20.y < lm17.y && dist >= 0.06;

    if (isPalm) {
      scrollVelocityRef.current = 0;
      historyRef.current = []; // Clear history to prevent lingering wave detections
      return 'Palm / Stop';
    }

    // Fist Check: All fingers curled (tips lower than knuckles, meaning tip Y > knuckle Y)
    const isFist = lm8.y > lm5.y && lm12.y > lm9.y && lm16.y > lm13.y && lm20.y > lm17.y;
    if (isFist) {
      if (!fistStartTimeRef.current) {
        fistStartTimeRef.current = now;
      } else if (now - fistStartTimeRef.current > 500) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollVelocityRef.current = 0;
        fistStartTimeRef.current = null;
      }
      return 'Fist';
    } else {
      fistStartTimeRef.current = null;
    }

    // Pinch Check: click trigger
    if (dist < 0.05) {
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
      return 'Pinch';
    }

    // Analyze history for dynamic scrolling waves
    const analysis = analyzeHistory(historyRef.current, lm9);
    if (analysis) {
      if (analysis.swipeY === -1) {
        scrollVelocityRef.current = -5; // Scroll Up
      } else if (analysis.swipeY === 1 || analysis.isHorizontalWave) {
        scrollVelocityRef.current = 5; // Scroll Down
      }
    }

    // Return the corresponding label
    if (scrollVelocityRef.current < 0) {
      return 'Scroll Up';
    } else if (scrollVelocityRef.current > 0) {
      return 'Scroll Down';
    }

    return 'Tracking';
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
          setGesture(detectedGesture);
          drawSkeleton(landmarks, detectedGesture);
        } else {
          scrollVelocityRef.current = 0;
          setGesture('None');
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setIsActive(true);
      // Wait for React to mount elements, then bind stream
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
    scrollVelocityRef.current = 0;
    historyRef.current = [];
  }, [isActive]);

  // Cleanup on unmount
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
