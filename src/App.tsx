import { useState, useRef, useEffect, useCallback } from 'react';
// useRef, useEffect used in PlayerScreen and VUMeter
import { albums, biography, type Album, type Track } from '@/data/albums';
import Icon from '@/components/ui/icon';
import { useAudio } from '@/hooks/useAudio';

type Screen = 'shelf' | 'album' | 'player' | 'search' | 'history';
type SortType = 'year' | 'type' | 'category';

export default function App() {
  const [screen, setScreen] = useState<Screen>('shelf');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('year');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const audio = useAudio();

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setIsFlipped(false);
    setScreen('album');
  };

  const openPlayer = useCallback((album: Album, track?: Track) => {
    const t = track || album.tracks[0];
    setSelectedAlbum(album);
    setSelectedTrack(t);
    setScreen('player');
    const key = `${album.id}-${t.id}`;
    if (audio.hasFile(key)) {
      audio.playTrack(key);
    }
  }, [audio]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const sortedAlbums = [...albums].sort((a, b) => {
    if (sortBy === 'year') return a.year - b.year;
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return a.category.localeCompare(b.category);
  });

  const searchResults = searchQuery.trim()
    ? albums.flatMap(album =>
        album.tracks
          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(t => ({ album, track: t as Track | null }))
      ).concat(
        albums
          .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(a => ({ album: a, track: null as Track | null }))
      )
    : [];

  return (
    <div className="grain-overlay min-h-screen max-w-sm mx-auto relative" style={{ background: 'var(--wood-dark)', fontFamily: 'Oswald, sans-serif' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(180deg, #0f0a03 0%, #1a1008 100%)', borderBottom: '1px solid var(--amber-dark)' }}>
        {screen !== 'shelf' ? (
          <button onClick={() => { setScreen('shelf'); setIsPlaying(false); }}
            className="retro-btn px-3 py-1 text-xs rounded-sm flex items-center gap-1">
            <Icon name="ChevronLeft" size={14} />
            НАЗАД
          </button>
        ) : (
          <div className="led-text text-xs opacity-60 font-mono">1994–2003</div>
        )}
        <div className="text-center">
          <div className="text-amber-light font-oswald font-semibold tracking-widest text-sm uppercase" style={{ color: 'var(--amber-light)' }}>
            {screen === 'shelf' && '◈ АРХИВ М. КРУГА ◈'}
            {screen === 'album' && selectedAlbum?.title.toUpperCase()}
            {screen === 'player' && '▶ ПЛЕЕР'}
            {screen === 'search' && '⌕ ПОИСК'}
            {screen === 'history' && '✦ БИОГРАФИЯ'}
          </div>
        </div>
        <div className="w-16 flex justify-end gap-2">
          {screen === 'shelf' && (
            <>
              <button onClick={() => setScreen('search')} className="transition-colors" style={{ color: 'var(--amber-dark)' }}>
                <Icon name="Search" size={18} />
              </button>
              <button onClick={() => setScreen('history')} className="transition-colors" style={{ color: 'var(--amber-dark)' }}>
                <Icon name="BookOpen" size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {screen === 'shelf' && (
        <ShelfScreen
          albums={sortedAlbums}
          sortBy={sortBy}
          setSortBy={setSortBy}
          favorites={favorites}
          onSelect={openAlbum}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {screen === 'album' && selectedAlbum && (
        <AlbumScreen
          album={selectedAlbum}
          isFlipped={isFlipped}
          favorites={favorites}
          onFlip={() => setIsFlipped(f => !f)}
          onPlay={() => openPlayer(selectedAlbum)}
          onPlayTrack={(track) => openPlayer(selectedAlbum, track)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {screen === 'player' && selectedAlbum && selectedTrack && (
        <PlayerScreen
          album={selectedAlbum}
          track={selectedTrack}
          audio={audio}
          favorites={favorites}
          onNext={() => {
            const idx = selectedAlbum.tracks.findIndex(t => t.id === selectedTrack.id);
            const next = selectedAlbum.tracks[(idx + 1) % selectedAlbum.tracks.length];
            setSelectedTrack(next);
            const key = `${selectedAlbum.id}-${next.id}`;
            if (audio.hasFile(key)) audio.playTrack(key);
            else audio.pause();
          }}
          onPrev={() => {
            const idx = selectedAlbum.tracks.findIndex(t => t.id === selectedTrack.id);
            const prev = selectedAlbum.tracks[(idx - 1 + selectedAlbum.tracks.length) % selectedAlbum.tracks.length];
            setSelectedTrack(prev);
            const key = `${selectedAlbum.id}-${prev.id}`;
            if (audio.hasFile(key)) audio.playTrack(key);
            else audio.pause();
          }}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {screen === 'search' && (
        <SearchScreen
          query={searchQuery}
          results={searchResults}
          onQueryChange={setSearchQuery}
          onSelectAlbum={openAlbum}
          onPlayTrack={(album, track) => openPlayer(album, track)}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen albums={albums} onSelectAlbum={openAlbum} />
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-50"
        style={{ background: 'linear-gradient(0deg, #0f0a03 0%, #1a1008 100%)', borderTop: '1px solid var(--amber-dark)' }}>
        <div className="flex">
          {[
            { id: 'shelf', icon: 'Library', label: 'СТЕЛЛАЖ' },
            { id: 'search', icon: 'Search', label: 'ПОИСК' },
            { id: 'history', icon: 'BookOpen', label: 'ИСТОРИЯ' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id as Screen)}
              className="flex-1 flex flex-col items-center py-2 gap-1 transition-all"
              style={{ color: screen === tab.id ? 'var(--amber-light)' : 'var(--amber-dark)' }}>
              <Icon name={tab.icon} size={20} />
              <span className="text-[9px] tracking-wider font-oswald">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function ShelfScreen({ albums, sortBy, setSortBy, favorites, onSelect, onToggleFavorite }: {
  albums: Album[];
  sortBy: string;
  setSortBy: (s: SortType) => void;
  favorites: Set<string>;
  onSelect: (a: Album) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const cassettes = albums.filter(a => a.type === 'cassette');
  const cds = albums.filter(a => a.type === 'cd');

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 py-3 flex gap-2 overflow-x-auto"
        style={{ background: 'var(--wood-mid)', borderBottom: '1px solid rgba(212,168,67,0.15)' }}>
        <span className="text-xs font-mono uppercase shrink-0 self-center" style={{ color: 'var(--amber-dark)' }}>СОРТ:</span>
        {([['year', 'ГОД'], ['type', 'ТИП'], ['category', 'ЖАНР']] as [SortType, string][]).map(([key, label]) => (
          <button key={key}
            onClick={() => setSortBy(key)}
            className="shrink-0 px-3 py-1 text-xs font-oswald tracking-widest rounded-sm transition-all"
            style={{
              background: sortBy === key ? 'var(--amber)' : 'var(--wood-light)',
              color: sortBy === key ? 'var(--wood-dark)' : 'var(--cream-dark)',
              border: `1px solid ${sortBy === key ? 'var(--amber-light)' : 'rgba(212,168,67,0.2)'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      <ShelfRow title="◼ КАССЕТЫ" albums={cassettes} favorites={favorites} onSelect={onSelect} onToggleFavorite={onToggleFavorite} />
      <ShelfRow title="◉ КОМПАКТ-ДИСКИ" albums={cds} favorites={favorites} onSelect={onSelect} onToggleFavorite={onToggleFavorite} />
    </div>
  );
}

function ShelfRow({ title, albums, favorites, onSelect, onToggleFavorite }: {
  title: string;
  albums: Album[];
  favorites: Set<string>;
  onSelect: (a: Album) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="mb-1">
      <div className="px-4 py-2 text-xs font-mono tracking-widest"
        style={{ color: 'var(--amber-dark)', background: 'rgba(212,168,67,0.05)', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
        {title}
      </div>
      <div className="relative" style={{ minHeight: 148 }}>
        <div className="absolute inset-0 wood-texture" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(212,168,67,0.15)' }} />
        <div className="relative flex gap-1 px-3 py-3 overflow-x-auto pb-5">
          {albums.map((album, i) => (
            <SpineItem
              key={album.id}
              album={album}
              isFavorite={favorites.has(album.id)}
              delay={i * 0.05}
              onSelect={() => onSelect(album)}
              onToggleFavorite={() => onToggleFavorite(album.id)}
            />
          ))}
        </div>
        <div className="shelf-edge h-5 w-full" />
      </div>
    </div>
  );
}

function SpineItem({ album, isFavorite, delay, onSelect, onToggleFavorite }: {
  album: Album;
  isFavorite: boolean;
  delay: number;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative shrink-0 cursor-pointer select-none animate-slide-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={onSelect}
        className="transition-all duration-300"
        style={{
          width: album.type === 'cassette' ? 30 : 22,
          height: 112,
          background: album.spineColor,
          border: `1px solid rgba(212,168,67,0.15)`,
          borderTop: `2px solid rgba(212,168,67,0.3)`,
          transform: hovered ? 'translateY(-14px)' : 'translateY(0)',
          boxShadow: hovered
            ? '3px 0 10px rgba(0,0,0,0.9), -1px 0 6px rgba(0,0,0,0.5), 0 -4px 8px rgba(212,168,67,0.1)'
            : '1px 0 4px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
        <div
          className="cassette-spine text-[7px] font-oswald font-bold tracking-wider px-0.5 leading-tight text-center"
          style={{ color: album.spineTextColor, maxHeight: 95, overflow: 'hidden' }}>
          {album.title} · {album.year}
        </div>
        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
          <div style={{
            width: 5, height: 5,
            borderRadius: album.type === 'cd' ? '50%' : '0',
            background: album.spineTextColor,
            opacity: 0.4,
          }} />
        </div>
      </div>
      {(isFavorite || hovered) && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute -top-1 -right-1 z-10">
          <Icon name="Heart" size={10} style={{ color: isFavorite ? '#C0392B' : '#555' }} />
        </button>
      )}
    </div>
  );
}

function AlbumScreen({ album, isFlipped, favorites, onFlip, onPlay, onPlayTrack, onToggleFavorite }: {
  album: Album;
  isFlipped: boolean;
  favorites: Set<string>;
  onFlip: () => void;
  onPlay: () => void;
  onPlayTrack: (t: Track) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-6 py-6">
        <div className="flip-card mx-auto" style={{ width: 240, height: 240 }}>
          <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`} style={{ width: '100%', height: '100%' }}>
            <div className="flip-card-front absolute inset-0 rounded-sm overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${album.coverColor} 0%, ${album.spineColor} 100%)`,
                border: '2px solid rgba(212,168,67,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(212,168,67,0.1)',
              }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="text-6xl mb-3">{album.type === 'cassette' ? '📼' : '💿'}</div>
                <div className="text-center">
                  <div className="font-oswald font-bold text-lg tracking-wider leading-tight mb-1"
                    style={{ color: 'var(--amber-light)' }}>
                    {album.title.toUpperCase()}
                  </div>
                  <div className="font-cormorant italic text-sm" style={{ color: 'var(--cream-dark)' }}>
                    Михаил Круг
                  </div>
                  <div className="mt-2 font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>
                    {album.year} · {album.label}
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: 'var(--amber-dark)' }} />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: 'var(--amber-dark)' }} />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l" style={{ borderColor: 'var(--amber-dark)' }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: 'var(--amber-dark)' }} />
            </div>

            <div className="flip-card-back absolute inset-0 rounded-sm overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${album.backColor} 0%, ${album.spineColor} 100%)`,
                border: '2px solid rgba(212,168,67,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              }}>
              <div className="p-4 h-full flex flex-col">
                <div className="font-mono text-xs mb-3 tracking-widest" style={{ color: 'var(--amber-dark)' }}>
                  ОБОРОТНАЯ СТОРОНА
                </div>
                <p className="font-cormorant italic text-sm leading-relaxed mb-3" style={{ color: 'var(--cream-dark)' }}>
                  {album.description}
                </p>
                <div className="mt-auto">
                  <div className="font-mono text-xs mb-2" style={{ color: 'var(--amber-dark)' }}>ТРЕКЛИСТ:</div>
                  {album.tracks.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between font-mono text-xs mb-0.5" style={{ color: 'var(--cream-dark)' }}>
                      <span className="truncate mr-2">{t.id}. {t.title}</span>
                      <span style={{ color: 'var(--amber-dark)' }}>{t.duration}</span>
                    </div>
                  ))}
                  {album.tracks.length > 5 && (
                    <div className="font-mono text-xs mt-1" style={{ color: 'var(--amber-dark)' }}>
                      + ещё {album.tracks.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5 justify-center">
          <button onClick={onFlip}
            className="retro-btn flex items-center gap-2 px-4 py-2 text-xs rounded-sm">
            <Icon name="RefreshCw" size={12} />
            ПЕРЕВЕРНУТЬ
          </button>
          <button onClick={onPlay}
            className="flex items-center gap-2 px-5 py-2 text-xs font-oswald tracking-wider rounded-sm animate-glow"
            style={{
              background: 'var(--amber)',
              color: 'var(--wood-dark)',
              border: '1px solid var(--amber-light)',
              boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
            }}>
            <Icon name="Play" size={12} />
            В ПЛЕЕР
          </button>
          <button onClick={() => onToggleFavorite(album.id)}
            className="retro-btn flex items-center justify-center w-9 py-2 rounded-sm">
            <Icon name="Heart" size={14} style={{ color: favorites.has(album.id) ? '#C0392B' : 'var(--wood-dark)' }} />
          </button>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>
            {album.type === 'cassette' ? '◼ КАССЕТА' : '◉ CD'} · {album.category === 'album' ? 'АЛЬБОМ' : 'СБОРНИК'}
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>{album.year} · {album.label}</div>
        </div>
        <p className="font-cormorant italic text-sm leading-relaxed" style={{ color: 'var(--cream-dark)' }}>
          {album.description}
        </p>
      </div>

      <div className="px-4">
        <div className="font-mono text-xs tracking-widest mb-3 pb-2"
          style={{ color: 'var(--amber)', borderBottom: '1px solid rgba(212,168,67,0.2)' }}>
          ◈ ТРЕКЛИСТ — {album.tracks.length} ТРЕКОВ
        </div>
        {album.tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i + 1}
            delay={i * 0.04}
            isFavorite={favorites.has(`${album.id}-${track.id}`)}
            onPlay={() => onPlayTrack(track)}
            onToggleFavorite={() => onToggleFavorite(`${album.id}-${track.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function TrackRow({ track, index, delay, isFavorite, onPlay, onToggleFavorite }: {
  track: Track;
  index: number;
  delay: number;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 py-2 cursor-pointer animate-fade-in"
      style={{
        borderBottom: '1px solid rgba(212,168,67,0.08)',
        animationDelay: `${delay}s`,
        animationFillMode: 'both',
        background: hovered ? 'rgba(212,168,67,0.05)' : 'transparent',
        transition: 'background 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-6 text-right font-mono text-xs shrink-0" style={{ color: 'var(--amber-dark)' }}>
        {hovered
          ? <button onClick={onPlay}><Icon name="Play" size={12} style={{ color: 'var(--amber-light)' }} /></button>
          : <span>{String(index).padStart(2, '0')}</span>
        }
      </div>
      <div className="flex-1 font-oswald text-sm tracking-wide" style={{ color: 'var(--cream)' }} onClick={onPlay}>
        {track.title}
      </div>
      <button onClick={onToggleFavorite} style={{ opacity: isFavorite || hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
        <Icon name="Heart" size={12} style={{ color: isFavorite ? '#C0392B' : 'var(--amber-dark)' }} />
      </button>
      <div className="font-mono text-xs shrink-0" style={{ color: 'var(--amber-dark)' }}>{track.duration}</div>
    </div>
  );
}

function PlayerScreen({ album, track, audio, favorites, onNext, onPrev, onToggleFavorite }: {
  album: Album;
  track: Track;
  audio: ReturnType<typeof useAudio>;
  favorites: Set<string>;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (id: string) => void;
}) {
  const trackKey = `${album.id}-${track.id}`;
  const hasFile = audio.hasFile(trackKey);
  const isCurrentTrack = audio.currentKey === trackKey;
  const isPlaying = isCurrentTrack && audio.isPlaying;
  const progress = isCurrentTrack ? audio.progress : 0;
  const currentTime = isCurrentTrack ? audio.currentTime : 0;
  const duration = isCurrentTrack ? audio.duration : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadMsg, setLoadMsg] = useState('');
  const vuHeights = [55, 70, 85, 95, 80, 60, 45, 65, 88, 72, 50, 60, 78, 90, 65];

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const matched = audio.loadFiles(e.target.files, album.id, album.tracks);
    setLoadMsg(`Загружено: ${matched} из ${e.target.files.length} файлов`);
    setTimeout(() => setLoadMsg(''), 3000);
    e.target.value = '';
  };

  const handlePlayPause = () => {
    if (!hasFile) { fileInputRef.current?.click(); return; }
    audio.togglePlay(trackKey);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCurrentTrack || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    audio.seek(pct);
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="pb-24 animate-fade-in">
      {album.type === 'cassette'
        ? <CassetteDeck album={album} isPlaying={isPlaying} />
        : <CDPlayer album={album} isPlaying={isPlaying} />
      }

      {/* Upload banner */}
      {!hasFile && (
        <div className="mx-4 mb-3 px-3 py-2 flex items-center gap-2 rounded-sm"
          style={{ background: 'rgba(212,168,67,0.08)', border: '1px dashed rgba(212,168,67,0.3)' }}>
          <Icon name="FolderOpen" size={14} style={{ color: 'var(--amber-dark)', flexShrink: 0 }} />
          <span className="font-mono text-xs flex-1" style={{ color: 'var(--amber-dark)' }}>
            MP3 не загружен — нажми ▶ или загрузи файлы
          </span>
          <button onClick={() => fileInputRef.current?.click()}
            className="font-mono text-xs px-2 py-1 rounded-sm"
            style={{ background: 'var(--amber-dark)', color: 'var(--wood-dark)' }}>
            ЗАГР.
          </button>
        </div>
      )}
      {loadMsg && (
        <div className="mx-4 mb-3 px-3 py-1.5 rounded-sm font-mono text-xs text-center animate-fade-in"
          style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', color: '#4CAF50' }}>
          ✓ {loadMsg}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleFiles} />

      {/* LED display */}
      <div className="mx-4 mb-4">
        <div className="led-display rounded-sm p-3 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{
              background: isPlaying ? 'var(--green-led)' : hasFile ? 'var(--amber-dark)' : '#333',
              boxShadow: isPlaying ? '0 0 6px var(--green-led)' : 'none',
              transition: 'all 0.3s',
            }} />
            <div className="font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>
              {album.type === 'cassette' ? '◼ TAPE' : '◉ CD'} · {album.year}
            </div>
            <div className="ml-auto font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>
              {fmtTime(currentTime)} / {duration ? fmtTime(duration) : track.duration}
            </div>
          </div>
          <div className="overflow-hidden h-5">
            <div className={`font-mono text-sm font-medium whitespace-nowrap ${isPlaying ? 'animate-marquee' : ''}`}
              style={{ color: 'var(--amber-light)', textShadow: '0 0 8px rgba(212,168,67,0.6)' }}>
              {String(track.id).padStart(2, '0')} · {track.title.toUpperCase()} · {album.title.toUpperCase()} · МИХАИЛ КРУГ ·&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          {/* Seekable progress bar */}
          <div className="mt-2 h-2 rounded-full overflow-hidden cursor-pointer"
            style={{ background: 'rgba(212,168,67,0.15)' }}
            onClick={handleSeek}>
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--amber-dark), var(--amber-light))' }} />
          </div>
        </div>
      </div>

      {/* VU Meters */}
      <VUMeter isPlaying={isPlaying} vuHeights={vuHeights} />

      {/* Controls */}
      <div className="mx-4 p-4 rounded-sm"
        style={{ background: 'var(--metal)', border: '1px solid #6A6060', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <button onClick={onPrev} className="retro-btn flex-1 flex items-center justify-center py-3 rounded-sm">
            <Icon name="SkipBack" size={16} />
          </button>
          <button onClick={handlePlayPause}
            className="flex-[2] flex items-center justify-center py-3 rounded-sm font-oswald font-bold tracking-wider text-sm"
            style={{
              background: isPlaying
                ? 'linear-gradient(180deg, #8B2020 0%, #6B1010 50%, #4B0808 100%)'
                : 'linear-gradient(180deg, var(--amber-light) 0%, var(--amber) 50%, var(--amber-dark) 100%)',
              color: isPlaying ? 'var(--cream)' : 'var(--wood-dark)',
              border: '1px solid rgba(0,0,0,0.4)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s',
            }}>
            {!hasFile
              ? <Icon name="FolderOpen" size={20} />
              : <Icon name={isPlaying ? 'Pause' : 'Play'} size={22} />
            }
          </button>
          <button onClick={onNext} className="retro-btn flex-1 flex items-center justify-center py-3 rounded-sm">
            <Icon name="SkipForward" size={16} />
          </button>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => audio.seek(Math.max(0, progress - 5))}
            className="retro-btn px-3 py-1.5 text-xs rounded-sm flex items-center gap-1 font-oswald tracking-wide">
            <Icon name="Rewind" size={10} />–5с
          </button>
          <button onClick={() => audio.pause()}
            className="retro-btn px-3 py-1.5 text-xs rounded-sm font-oswald tracking-wide">
            СТОП
          </button>
          <button onClick={() => audio.seek(Math.min(100, progress + 5))}
            className="retro-btn px-3 py-1.5 text-xs rounded-sm flex items-center gap-1 font-oswald tracking-wide">
            +5с<Icon name="FastForward" size={10} />
          </button>
          <button onClick={() => onToggleFavorite(trackKey)} className="retro-btn px-3 py-1.5 text-xs rounded-sm">
            <Icon name="Heart" size={12} style={{ color: favorites.has(trackKey) ? '#C0392B' : 'var(--wood-dark)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function VUMeter({ isPlaying, vuHeights }: { isPlaying: boolean; vuHeights: number[] }) {
  const [heights, setHeights] = useState(vuHeights.map(() => 8));

  useEffect(() => {
    if (!isPlaying) { setHeights(vuHeights.map(() => 8)); return; }
    const interval = setInterval(() => {
      setHeights(vuHeights.map(h => isPlaying ? Math.max(8, Math.min(100, h + (Math.random() - 0.4) * 30)) : 8));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="mx-4 mb-4 p-2 flex gap-1 items-end justify-center"
      style={{ height: 52, background: '#050500', border: '1px solid #2a2800', borderRadius: 2 }}>
      {heights.map((h, i) => (
        <div key={i} className="flex-1 flex items-end" style={{ height: '100%' }}>
          <div className="w-full vu-bar rounded-sm" style={{ height: `${h}%`, transition: 'height 0.12s ease' }} />
        </div>
      ))}
    </div>
  );
}

function CassetteDeck({ album, isPlaying }: { album: Album; isPlaying: boolean }) {
  return (
    <div className="mx-4 my-5 relative" style={{ height: 220 }}>
      <div className="absolute inset-0 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #3A3530 0%, #2A2520 50%, #1A1510 100%)',
          border: '2px solid #4A4540',
          boxShadow: '0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
        <div className="absolute top-6 left-1/2 -translate-x-1/2"
          style={{ width: 210, height: 130, background: 'rgba(0,0,0,0.85)', border: '2px solid #555', borderRadius: 4, boxShadow: 'inset 0 0 16px rgba(0,0,0,0.95)' }}>
          <div className="absolute inset-2 rounded-sm tape-texture flex items-center justify-between px-6">
            {[0, 1].map(side => (
              <div key={side} className="relative flex items-center justify-center"
                style={{ width: 54, height: 54, background: '#1A1008', borderRadius: '50%', border: '2px solid #2A2020' }}>
                <div className={isPlaying ? 'animate-spin-reel' : ''}
                  style={{ width: 46, height: 46, borderRadius: '50%', background: `conic-gradient(from ${side * 30}deg, #2A1808 0deg, #3A2210 60deg, #1A0E04 120deg, #2A1808 180deg, #3A2210 240deg, #1A0E04 300deg, #2A1808 360deg)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: '#0A0804', border: '1px solid #2A2020' }} />
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <div key={deg} style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: 2, height: 14, marginLeft: -1, marginTop: -14,
                      background: '#4A3010', transformOrigin: 'bottom center',
                      transform: `rotate(${deg + side * 15}deg)`,
                    }} />
                  ))}
                </div>
              </div>
            ))}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 3, background: '#0A0400', borderTop: '1px solid #2A1800' }} />
          </div>
          <div className="absolute bottom-1.5 left-0 right-0 text-center font-mono text-[7px] tracking-widest" style={{ color: 'var(--amber-dark)' }}>
            {album.title.toUpperCase()} · SIDE A · 60 min
          </div>
        </div>
        <div className="absolute bottom-3 left-0 right-0 text-center font-oswald text-xs tracking-widest" style={{ color: 'var(--amber-dark)' }}>
          КАССЕТНАЯ ДЕКА · STEREO HI-FI
        </div>
        <div className="absolute top-3 right-4 flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPlaying ? '#4CAF50' : '#1a1a1a', boxShadow: isPlaying ? '0 0 8px #4CAF50' : 'none', transition: 'all 0.3s' }} />
          <span className="font-mono text-[9px]" style={{ color: 'rgba(200,180,100,0.5)' }}>{isPlaying ? 'PLAY' : 'STOP'}</span>
        </div>
      </div>
    </div>
  );
}

function CDPlayer({ album, isPlaying }: { album: Album; isPlaying: boolean }) {
  return (
    <div className="mx-4 my-5 relative" style={{ height: 220 }}>
      <div className="absolute inset-0 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #2A2830 0%, #1A1820 50%, #0A0810 100%)',
          border: '2px solid #3A3840',
          boxShadow: '0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="relative" style={{ width: 130, height: 130 }}>
            <div className={`absolute inset-0 rounded-full ${isPlaying ? 'animate-spin-cd' : ''}`}
              style={{
                background: 'conic-gradient(from 0deg, #1a1a2e, #16213e, #0f3460, #533483, #1a1a2e, #0f3460, #16213e, #1a1a2e)',
                boxShadow: '0 0 24px rgba(80,60,200,0.4)',
              }}>
              <div className="absolute inset-3 rounded-full"
                style={{ background: 'conic-gradient(from 45deg, rgba(255,100,100,0.1), rgba(255,200,0,0.1), rgba(100,255,100,0.1), rgba(100,100,255,0.1), rgba(200,0,255,0.1), rgba(255,100,100,0.1))' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0a0808', border: '2px solid #2A2840' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-0 right-0 text-center font-oswald text-xs tracking-widest" style={{ color: 'rgba(160,180,220,0.5)' }}>
          COMPACT DISC PLAYER · DIGITAL AUDIO
        </div>
        <div className="absolute top-3 right-4 flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPlaying ? '#4CAF50' : '#1a1a1a', boxShadow: isPlaying ? '0 0 8px #4CAF50' : 'none', transition: 'all 0.3s' }} />
          <span className="font-mono text-[9px]" style={{ color: 'rgba(160,180,220,0.5)' }}>{isPlaying ? 'PLAY' : 'STOP'}</span>
        </div>
      </div>
    </div>
  );
}

function SearchScreen({ query, results, onQueryChange, onSelectAlbum, onPlayTrack }: {
  query: string;
  results: Array<{ album: Album; track: Track | null }>;
  onQueryChange: (q: string) => void;
  onSelectAlbum: (a: Album) => void;
  onPlayTrack: (a: Album, t: Track) => void;
}) {
  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(212,168,67,0.15)' }}>
        <div className="flex items-center gap-3 led-display rounded-sm px-3 py-2">
          <Icon name="Search" size={16} style={{ color: 'var(--amber-dark)', flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Трек, альбом..."
            className="flex-1 bg-transparent outline-none font-mono text-sm"
            style={{ color: 'var(--amber-light)', caretColor: 'var(--amber)' }}
          />
          {query && (
            <button onClick={() => onQueryChange('')}>
              <Icon name="X" size={14} style={{ color: 'var(--amber-dark)' }} />
            </button>
          )}
        </div>
      </div>

      {!query && (
        <div className="px-4 py-12 text-center">
          <div className="text-4xl mb-3 opacity-20">🎵</div>
          <div className="font-mono text-xs tracking-widest" style={{ color: 'var(--amber-dark)' }}>
            ВВЕДИТЕ НАЗВАНИЕ ТРЕКА ИЛИ АЛЬБОМА
          </div>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>НИЧЕГО НЕ НАЙДЕНО</div>
        </div>
      )}

      <div className="px-4 py-2">
        {results.map((r, i) => (
          <div key={i}
            className="flex items-center gap-3 py-3 cursor-pointer"
            style={{ borderBottom: '1px solid rgba(212,168,67,0.08)' }}
            onClick={() => r.track ? onPlayTrack(r.album, r.track) : onSelectAlbum(r.album)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-sm shrink-0"
              style={{ background: r.album.spineColor, border: '1px solid rgba(212,168,67,0.2)' }}>
              <span className="text-xs">{r.album.type === 'cassette' ? '📼' : '💿'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-oswald text-sm tracking-wide truncate" style={{ color: 'var(--cream)' }}>
                {r.track ? r.track.title : r.album.title}
              </div>
              <div className="font-mono text-xs" style={{ color: 'var(--amber-dark)' }}>
                {r.album.title} · {r.album.year}
              </div>
            </div>
            {r.track
              ? <div className="font-mono text-xs shrink-0" style={{ color: 'var(--amber-dark)' }}>{r.track.duration}</div>
              : <Icon name="ChevronRight" size={14} style={{ color: 'var(--amber-dark)' }} />
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryScreen({ albums, onSelectAlbum }: { albums: Album[]; onSelectAlbum: (a: Album) => void }) {
  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 py-5">
        <div className="font-oswald font-bold text-2xl tracking-wider mb-1" style={{ color: 'var(--amber-light)' }}>
          МИХАИЛ КРУГ
        </div>
        <div className="font-cormorant italic text-base" style={{ color: 'var(--cream-dark)' }}>
          1962 — 2002 · Певец, композитор, поэт
        </div>
        <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg, var(--amber), transparent)' }} />
      </div>

      <div className="px-4">
        {biography.map((item, i) => {
          const linked = albums.find(a => a.year === item.year);
          return (
            <div key={i} className="flex gap-4 pb-5 animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'both' }}>
              <div className="shrink-0 text-right" style={{ width: 44 }}>
                <div className="font-mono text-sm font-medium" style={{ color: 'var(--amber)' }}>{item.year}</div>
              </div>
              <div className="flex-1 pt-0.5" style={{ borderLeft: '1px solid rgba(212,168,67,0.15)', paddingLeft: 16 }}>
                <p className="font-cormorant text-base leading-relaxed" style={{ color: 'var(--cream-dark)' }}>
                  {item.event}
                </p>
                {linked && (
                  <button onClick={() => onSelectAlbum(linked)}
                    className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-oswald tracking-wide"
                    style={{ background: linked.spineColor, color: linked.spineTextColor, border: '1px solid rgba(212,168,67,0.2)' }}>
                    <span>{linked.type === 'cassette' ? '📼' : '💿'}</span>
                    {linked.title.toUpperCase()}
                    <Icon name="ChevronRight" size={10} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}