import { useState, useRef, useEffect, useCallback } from 'react';

export interface AudioFile {
  trackId: string; // albumId-trackId
  url: string;
  name: string;
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioFiles, setAudioFiles] = useState<Map<string, string>>(new Map()); // trackKey -> objectURL
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(1);

  // init audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => { setIsPlaying(false); setProgress(100); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  // normalize name for matching: lowercase, strip extension, trim
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/\.(mp3|flac|wav|ogg|m4a)$/, '')
      .replace(/[^а-яёa-z0-9]/gi, '')
      .trim();

  // load files from file input, auto-match to tracks
  const loadFiles = useCallback((files: FileList, albumId: string, tracks: { id: number; title: string }[]) => {
    const newMap = new Map(audioFiles);
    let matched = 0;

    Array.from(files).forEach(file => {
      const fileName = normalize(file.name);
      // try match by track title
      const track = tracks.find(t => {
        const titleNorm = normalize(t.title);
        return fileName.includes(titleNorm) || titleNorm.includes(fileName);
      });
      if (track) {
        const key = `${albumId}-${track.id}`;
        // revoke previous
        if (newMap.has(key)) URL.revokeObjectURL(newMap.get(key)!);
        newMap.set(key, URL.createObjectURL(file));
        matched++;
      } else {
        // try match by track number: e.g. "01", "1", "track01"
        const numMatch = file.name.match(/(\d+)/);
        if (numMatch) {
          const num = parseInt(numMatch[1]);
          const track2 = tracks.find(t => t.id === num);
          if (track2) {
            const key = `${albumId}-${track2.id}`;
            if (newMap.has(key)) URL.revokeObjectURL(newMap.get(key)!);
            newMap.set(key, URL.createObjectURL(file));
            matched++;
          }
        }
      }
    });

    setAudioFiles(newMap);
    return matched;
  }, [audioFiles]);

  const playTrack = useCallback((trackKey: string) => {
    const audio = audioRef.current;
    if (!audio) return false;
    const url = audioFiles.get(trackKey);
    if (!url) return false;

    if (currentKey !== trackKey) {
      audio.pause();
      audio.src = url;
      audio.load();
      setCurrentKey(trackKey);
      setCurrentTime(0);
      setProgress(0);
    }
    audio.play().catch(() => {});
    return true;
  }, [audioFiles, currentKey]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback((trackKey: string) => {
    const audio = audioRef.current;
    if (!audio) return false;
    const url = audioFiles.get(trackKey);
    if (!url) return false;

    if (currentKey !== trackKey) {
      return playTrack(trackKey);
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    return true;
  }, [audioFiles, currentKey, playTrack]);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setVolumeState(v);
  }, []);

  const hasFile = useCallback((trackKey: string) => audioFiles.has(trackKey), [audioFiles]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    currentKey,
    volume,
    audioFiles,
    loadFiles,
    playTrack,
    pause,
    togglePlay,
    seek,
    setVolume,
    hasFile,
    formatTime,
  };
}
