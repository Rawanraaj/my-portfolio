import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
];

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

    if (!lm8) return 'None';

    // Position Custom Cursor
    if (window.__setCursorPos) {
      // Map mirrored x-coordinate
      const targetX = (1 - lm8.x) * window.innerWidth;
      const targetY = lm8.y * window.innerHeight;
      window.__setCursorPos(targetX, targetY);
    }

    // Fist Check: All fingers curled (tips lower than knuckles, meaning tip Y > knuckle Y)
    const isFist = lm8.y > lm5.y && lm12.y > lm9.y && lm16.y > lm13.y && lm20.y > lm17.y;
    if (isFist) {
      if (!fistStartTimeRef.current) {
        fistStartTimeRef.current = Date.now();
      } else if (Date.now() - fistStartTimeRef.current > 500) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fistStartTimeRef.current = null;
      }
      return 'Fist';
    } else {
      fistStartTimeRef.current = null;
    }

    // Pinch Check: Dist landmark 4 and 8 < 0.05
    const dist = Math.sqrt(Math.pow(lm4.x - lm8.x, 2) + Math.pow(lm4.y - lm8.y, 2));
    if (dist < 0.05) {
      const now = Date.now();
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

    // Default tracking mode: Scroll zones
    if (lm8.y < 0.2) {
      window.scrollBy(0, -8 * (0.2 - lm8.y) * 50);
    } else if (lm8.y > 0.8) {
      window.scrollBy(0, 8 * (lm8.y - 0.8) * 50);
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
          setGesture('None');
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
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
