"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { TimerMode } from "../types/timer";

interface AudioSettings {
  enabled: boolean;
  volume: number; // 0-1
  focusCompleteSound: string;
  breakCompleteSound: string;
}

interface UseAudioReturn {
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
  playSessionComplete: (mode: TimerMode) => void;
  playTickSound: () => void;
  isPlaying: boolean;
}

// Default audio settings
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true,
  volume: 0.7,
  focusCompleteSound: "bell",
  breakCompleteSound: "chime",
};

// Audio file URLs (you can replace these with your own sounds)
const SOUND_URLS = {
  bell: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBC13yO/eizEIHm/A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OihUgwOUarm7blmRQc5jdT0w3QtCCaAy/LUfSICIXjJ7N2PPAoWYrjl6qNdGQU2jdXyv3YoA0c31wT0Q2YNEBRX5t6mUhgHQWKVYjQ3LzYP4nI7hZ5Gps8EJAhD4DsBnagHcZ3LPQFxc2DJVn0Ox3g4LNq6y+jy7Pb79J4e8T8H1L1aHN0QBdRa9+U+LtF78nAnBOWqaMLVJFrKVFk4YWJn7kE34OZELhx1zr5Q7AROTi2QEoqcjZo9N7xBNWYhQOzTZqZvK7LI9SgFtB5PYGHs0wkbYK1Bcp3oj3Q1k6vGPQtP3VHM6jdGF+tI7L7QsTPTR9qcbzJ=",
  chime:
    "data:audio/wav;base64,UklGRhADAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YewCAABhRElJdQcBAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABADBgTElPdAABAABlTElPdAABAA==",
  tick: "data:audio/wav;base64,UklGRtgAAABXQVZFZm10IBAAAAABAAEAADwAAACGAQACAAEAZGF0YXQAAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSAFKHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBC2By/LaidASaLvs259NEQ1Pp+TwvmQdBwAAAAAAAAAAAAAAZGF0YQE5aml0",
};

export function useAudio(): UseAudioReturn {
  const [settings, setSettings] = useState<AudioSettings>(
    DEFAULT_AUDIO_SETTINGS
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element (client-side only)
  useEffect(() => {
    // Only create audio element in browser
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = settings.volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when settings change (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined" && audioRef.current) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Play sound
  const playSound = useCallback(
    async (soundKey: string) => {
      if (!settings.enabled || !audioRef.current) {
        return;
      }

      try {
        setIsPlaying(true);
        audioRef.current.src =
          SOUND_URLS[soundKey as keyof typeof SOUND_URLS] || SOUND_URLS.bell;
        await audioRef.current.play();

        // Reset playing state when sound ends
        audioRef.current.onended = () => setIsPlaying(false);
      } catch (error) {
        console.error("Error playing sound:", error);
        setIsPlaying(false);
      }
    },
    [settings.enabled]
  );

  // Play session complete sound
  const playSessionComplete = useCallback(
    (mode: TimerMode) => {
      const soundKey =
        mode === "focus"
          ? settings.focusCompleteSound
          : settings.breakCompleteSound;
      playSound(soundKey);
    },
    [settings.focusCompleteSound, settings.breakCompleteSound, playSound]
  );

  // Play tick sound
  const playTickSound = useCallback(() => {
    playSound("tick");
  }, [playSound]);

  return {
    settings,
    updateSettings,
    playSessionComplete,
    playTickSound,
    isPlaying,
  };
}
