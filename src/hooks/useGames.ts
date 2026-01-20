'use client';

import { useState, useCallback } from 'react';

interface SpinResult {
  success: boolean;
  reward: {
    type: string;
    value: number;
    label: string;
  };
  remainingPlays: number;
  message: string;
}

interface CheckinStatus {
  checkedInToday: boolean;
  streak: number;
  rewards: { day: number; type: string; value: number }[];
  checkinDates: string[];
}

interface CheckinResult {
  success: boolean;
  streak: number;
  reward: {
    type: string;
    value: number;
  };
  message: string;
}

export function useSpinWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const spin = useCallback(async () => {
    try {
      setSpinning(true);
      setError(null);

      const response = await fetch('/api/games/spin-wheel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      throw err;
    } finally {
      setSpinning(false);
    }
  }, []);

  return { spin, spinning, result, error };
}

export function useDailyCheckin() {
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games/daily-checkin');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setStatus(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkin = useCallback(async (): Promise<CheckinResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/games/daily-checkin', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Refresh status after checkin
      await getStatus();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getStatus]);

  return { status, loading, error, checkin, getStatus };
}