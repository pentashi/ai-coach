import React, { useEffect, useRef, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import { FiPause, FiPlay, FiRefreshCw, FiRepeat, FiStopCircle } from 'react-icons/fi';

const pureGreen = '#00ff00'; // Pure green tracking indicator
const aquaGreen = '#0ef'; // Theme accent
const darkBg = '#121212';
const textColor = '#eee';

const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

const PoseTracer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // States
  const [detector, setDetector] = useState(null);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [feedback, setFeedback] = useState('Ready to start');
  const [squatDown, setSquatDown] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pulse, setPulse] = useState(1);

  // Initialize TF backend + detector
  useEffect(() => {
    const init = async () => {
      await tf.setBackend('webgl');
      const det = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setDetector(det);
    };
    init();
  }, []);

  // Setup camera
  useEffect(() => {
    const setupCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        await new Promise((res) => (videoRef.current.onloadedmetadata = res));
        videoRef.current.play();
      } catch (err) {
        setFeedback('Error accessing camera');
        console.error(err);
      }
    };
    if (isTracking) setupCamera();
  }, [isTracking]);

  // Pulse animation for tracking indicator
  useEffect(() => {
    if (!isTracking) {
      setPulse(0.4);
      return;
    }
    let direction = 1;
    const interval = setInterval(() => {
      setPulse((p) => {
        if (p >= 1.2) direction = -1;
        else if (p <= 0.6) direction = 1;
        return p + 0.02 * direction;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isTracking]);

  // Main detection loop
  useEffect(() => {
    if (!detector || !videoRef.current || !isTracking) return;
    let animationFrameId;

    const ctx = canvasRef.current.getContext('2d');
    const video = videoRef.current;

    const drawKeypoints = (keypoints) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw keypoints
      keypoints.forEach((k) => {
        if (k.score > 0.4) {
          ctx.beginPath();
          ctx.arc(k.x, k.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = aquaGreen;
          ctx.shadowColor = aquaGreen;
          ctx.shadowBlur = 10;
          ctx.fill();
        }
      });

      // Draw skeleton
      const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
      adjacentPairs.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        if (kp1.score > 0.4 && kp2.score > 0.4) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.strokeStyle = aquaGreen;
          ctx.lineWidth = 3;
          ctx.shadowColor = aquaGreen;
          ctx.shadowBlur = 15;
          ctx.stroke();
        }
      });
    };

    const getY = (keypoints, name) => keypoints.find((k) => k.name === name)?.y || 0;

    const analyzePose = (pose) => {
      const keypoints = pose.keypoints;
      const leftHip = getY(keypoints, 'left_hip');
      const leftKnee = getY(keypoints, 'left_knee');
      const leftShoulder = getY(keypoints, 'left_shoulder');

      if (leftHip > leftKnee && leftShoulder < leftHip && !squatDown) {
        setSquatDown(true);
        setFeedback('Down');
      }
      if (leftHip < leftKnee && squatDown) {
        setReps((prev) => prev + 1);
        speak(`Rep ${reps + 1}`);
        setFeedback('Up');
        setSquatDown(false);

        if ((reps + 1) % 10 === 0) {
          setSets((prev) => prev + 1);
          setFeedback(`Set ${sets + 1} complete! Take a short break.`);
          speak(`Set ${sets + 1} complete! Take a short break.`);
        }
      }
    };

    const speak = (text) => {
      if (!window.speechSynthesis.speaking) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        window.speechSynthesis.speak(utter);
      }
    };

    const detect = async () => {
      if (isPaused) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        animationFrameId = requestAnimationFrame(detect);
        return;
      }
      const poses = await detector.estimatePoses(video);
      if (poses.length > 0) {
        drawKeypoints(poses[0].keypoints);
        analyzePose(poses[0]);
      } else {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    detect();

    return () => cancelAnimationFrame(animationFrameId);
  }, [detector, isPaused, reps, squatDown, sets, isTracking]);

  // Controls handlers
  const handlePause = () => setIsPaused((prev) => !prev);
  const handleReset = () => {
    setReps(0);
    setSets(0);
    setFeedback('Ready to start');
    setSquatDown(false);
    setIsPaused(false);
  };
  const handleReplay = () => {
    if(feedback && feedback !== 'Ready to start') {
      speak(feedback);
    }
  };
  const handleEnd = () => {
    setIsTracking(false);
    setIsPaused(true);
    setFeedback('Workout Ended');
  };
  const handleStart = () => {
    setIsTracking(true);
    setReps(0);
    setSets(0);
    setFeedback('Start your squat');
    setSquatDown(false);
    setIsPaused(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis.speaking) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
    }
  };

  const buttonStyle = {
    backgroundColor: aquaGreen,
    border: 'none',
    borderRadius: 14,
    padding: '12px 18px',
    cursor: 'pointer',
    color: '#000',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 10px ${aquaGreen}`,
    transition: 'background-color 0.3s ease',
    userSelect: 'none',
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: textColor,
        backgroundColor: darkBg,
        borderRadius: 16,
        maxWidth: 960,
        margin: '24px auto',
        padding: 24,
        boxShadow: `0 0 40px ${aquaGreen}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        height: '90vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: 24,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {/* Left - Video + Canvas */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 600px',
            maxWidth: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: `0 0 30px ${aquaGreen}`,
            backgroundColor: '#000', // Keep solid black behind video & canvas
            minHeight: 360,          // Reserve space so layout stays stable
          }}
        >
          <div
            aria-label="AI tracking indicator"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: pureGreen,
              boxShadow: `0 0 12px ${pureGreen}`,
              opacity: pulse,
              transition: 'opacity 0.1s linear',
              zIndex: 10,
            }}
          />
          <video
            ref={videoRef}
            width="640"
            height="480"
            style={{
              width: '100%',
              height: 'auto',
              visibility: isTracking ? 'visible' : 'hidden',
              opacity: isTracking ? 1 : 0,
              transition: 'opacity 0.3s ease',
              backgroundColor: '#000',
            }}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 'auto',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
            }}
          />
          {!isTracking && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                color: pureGreen,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 22,
                fontWeight: '700',
                userSelect: 'none',
              }}
            >
              Tracking stopped
            </div>
          )}
        </div>

        {/* Right - Info Cards */}
        <div
          style={{
            flex: '1 1 320px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            minWidth: 280,
            maxWidth: 360,
          }}
        >
          {/* Exercise Label */}
          <section
            style={{
              backgroundColor: '#111',
              borderRadius: 16,
              padding: '16px 24px',
              boxShadow: `0 0 20px ${aquaGreen}`,
              color: aquaGreen,
              fontWeight: '900',
              fontSize: 24,
              textAlign: 'center',
              userSelect: 'none',
            }}
            aria-label="Exercise"
          >
            Squat
          </section>

          {/* Feedback Button */}
          <button
            onClick={handleStart}
            disabled={isTracking}
            style={{
              backgroundColor: isTracking ? '#444' : aquaGreen,
              color: isTracking ? '#888' : '#000',
              fontWeight: '700',
              padding: '12px 0',
              borderRadius: 12,
              boxShadow: isTracking ? 'none' : `0 0 20px ${aquaGreen}`,
              cursor: isTracking ? 'not-allowed' : 'pointer',
              userSelect: 'none',
              fontSize: 18,
              transition: 'background-color 0.3s ease',
            }}
            aria-label="Start Tracking"
          >
            {isTracking ? 'Tracking Started' : 'Start Tracking'}
          </button>

          {/* AI Feedback Card */}
          <section
            style={{
              backgroundColor: '#222',
              borderRadius: 16,
              padding: 24,
              boxShadow: `0 0 20px ${aquaGreen}`,
              minHeight: 130,
              fontSize: 18,
              fontWeight: '600',
              color: aquaGreen,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
              userSelect: 'none',
              lineHeight: 1.3,
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {feedback}
          </section>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <button
              onClick={handlePause}
              title={isPaused ? 'Resume' : 'Pause'}
              disabled={!isTracking}
              style={{
                ...buttonStyle,
                backgroundColor: isTracking ? aquaGreen : '#444',
                color: isTracking ? '#000' : '#666',
                cursor: isTracking ? 'pointer' : 'not-allowed',
                boxShadow: isTracking ? `0 0 10px ${aquaGreen}` : 'none',
              }}
            >
              {isPaused ? <FiPlay size={24} /> : <FiPause size={24} />}
            </button>

            <button
              onClick={handleReset}
              title="Reset"
              disabled={!isTracking}
              style={{
                ...buttonStyle,
                backgroundColor: isTracking ? aquaGreen : '#444',
                color: isTracking ? '#000' : '#666',
                cursor: isTracking ? 'pointer' : 'not-allowed',
                boxShadow: isTracking ? `0 0 10px ${aquaGreen}` : 'none',
              }}
            >
              <FiRefreshCw size={24} />
            </button>

            <button
              onClick={handleReplay}
              title="Replay Feedback"
              disabled={!isTracking || feedback === 'Ready to start'}
              style={{
                ...buttonStyle,
                backgroundColor: isTracking ? aquaGreen : '#444',
                color: isTracking ? '#000' : '#666',
                cursor:
                  isTracking && feedback !== 'Ready to start'
                    ? 'pointer'
                    : 'not-allowed',
                boxShadow:
                  isTracking && feedback !== 'Ready to start'
                    ? `0 0 10px ${aquaGreen}`
                    : 'none',
              }}
            >
              <FiRepeat size={24} />
            </button>

            <button
              onClick={handleEnd}
              title="End Workout"
              disabled={!isTracking}
              style={{
                ...buttonStyle,
                backgroundColor: '#f33',
                boxShadow: '0 0 15px #f33',
                cursor: isTracking ? 'pointer' : 'not-allowed',
                color: '#000',
              }}
            >
              <FiStopCircle size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseTracer;
