import { useState, useEffect, useCallback } from 'react';

export function useSensors() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastImpact, setLastImpact] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          return true;
        } else {
          setError('Permission denied for motion sensors');
          return false;
        }
      } catch (err) {
        setError('Error requesting motion sensor permission');
        return false;
      }
    }
    return true; // Assume granted if no requestPermission function (Android/Desktop)
  }, []);

  const startMonitoring = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      setIsMonitoring(true);
    }
  }, [requestPermission]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt(
        (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2
      );

      // Threshold for "fall" or "sudden impact"
      // Normal gravity is ~9.8 m/s^2. A sudden stop or fall might spike to 25-30+
      if (totalAcc > 30) {
        setLastImpact(Date.now());
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isMonitoring]);

  return { isMonitoring, lastImpact, error, startMonitoring, stopMonitoring, setLastImpact };
}
