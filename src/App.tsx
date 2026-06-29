import { useState } from 'react';
import { SONGS } from './data/songs';
import { SongPicker } from './components/SongPicker';
import { PracticeMode } from './components/PracticeMode';
import type { Song } from './data/songs';
import './styles/app.css';

export function App() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🎹</span>
          <div>
            <h1>Piano Coach</h1>
            <p>Learn songs on your baby grand</p>
          </div>
        </div>
      </header>

      <main>
        {selectedSong ? (
          <PracticeMode song={selectedSong} onBack={() => setSelectedSong(null)} />
        ) : (
          <>
            <section className="hero">
              <p>
                Zero experience? No problem. Pick a song, let your iPhone or iPad listen to
                the keys, and follow the highlights — one note at a time.
              </p>
              <ul className="feature-list">
                <li>🎤 Microphone hears which key you press</li>
                <li>🎹 On-screen keyboard shows where to play</li>
                <li>📷 Optional camera view to watch your hands</li>
                <li>🎵 Muse piano intros included</li>
              </ul>
            </section>
            <SongPicker songs={SONGS} onSelect={setSelectedSong} />
          </>
        )}
      </main>
    </div>
  );
}
