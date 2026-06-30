import { useState } from 'react';
import { CalibrationProvider, useCalibration } from './context/CalibrationContext';
import { SONGS } from './data/songs';
import { CalibrationWizard } from './components/calibration/CalibrationWizard';
import { OnboardingBanner } from './components/OnboardingBanner';
import { SongPicker } from './components/SongPicker';
import { PracticeMode } from './components/PracticeMode';
import type { Song } from './data/songs';
import './styles/app.css';

type AppView = 'home' | 'practice' | 'calibrate';

function AppContent() {
  const [view, setView] = useState<AppView>('home');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { hasAudioCalibration, hasVisualCalibration } = useCalibration();

  if (view === 'calibrate') {
    return <CalibrationWizard onClose={() => setView('home')} />;
  }

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
        <button
          type="button"
          className={`btn-calibrate ${hasAudioCalibration ? 'calibrated' : ''}`}
          onClick={() => setView('calibrate')}
        >
          {hasAudioCalibration ? '✓ Calibrated' : 'Calibrate piano'}
        </button>
      </header>

      <main>
        {selectedSong ? (
          <PracticeMode song={selectedSong} onBack={() => setSelectedSong(null)} />
        ) : (
          <>
            <OnboardingBanner />
            <section className="hero">
              <p>
                Zero experience? No problem. Pick a song, let your iPhone or iPad listen to
                the keys, and follow the highlights — one note at a time.
              </p>
              <ul className="feature-list">
                <li>🎤 Microphone hears which key you press</li>
                <li>🎹 On-screen keyboard shows where to play</li>
                <li>📷 Camera overlay shows keys on your real piano</li>
                <li>🎵 Muse piano intros included</li>
              </ul>
              {!hasAudioCalibration && (
                <div className="cal-banner">
                  <p>
                    <strong>Tip:</strong> Calibrate your piano first for much better note
                    detection on your specific instrument.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setView('calibrate')}
                  >
                    Calibrate now
                  </button>
                </div>
              )}
              {hasAudioCalibration && (
                <p className="cal-status-line">
                  {hasVisualCalibration
                    ? '✓ Audio & camera calibrated for your piano'
                    : '✓ Audio calibrated — add camera map for key overlays'}
                </p>
              )}
            </section>
            <SongPicker songs={SONGS} onSelect={setSelectedSong} />
          </>
        )}
      </main>
    </div>
  );
}

export function App() {
  return (
    <CalibrationProvider>
      <AppContent />
    </CalibrationProvider>
  );
}
