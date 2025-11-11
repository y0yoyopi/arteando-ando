import React, { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState(""); // Cambiar a string vacío
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  const playAudio = (id) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(`${process.env.PUBLIC_URL}/audio/testimonio${id}.mp3`);
    audio.play();
    setCurrentAudio(audio);
    setCurrentPlayingId(id);
    setIsPlaying(true);
    setStatus(""); // Limpiar el estado

    audio.onended = () => {
      stopAudio();
    };
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
    setStatus(""); // Limpiar el estado
  };

  return (
    <div className={`app-container ${isPlaying ? 'playing' : ''}`}>
      <div className="buttons-grid">
        {[1, 2, 3, 4].map((id) => (
          <button 
            key={id} 
            className={`audio-button ${currentPlayingId === id ? 'active' : ''}`}
            onClick={() => !isPlaying && playAudio(id)}
            disabled={isPlaying && currentPlayingId !== id}
          >
            <span className="button-text">{id}</span>
          </button>
        ))}
      </div>

      {isPlaying && (
        <div className="audio-controls-overlay">
          <div className="audio-controls">
            <div className="playing-status">Reproduciendo audio {currentPlayingId}</div>
            <button className="stop-button" onClick={stopAudio}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
              <span>Detener</span>
            </button>
          </div>
        </div>
      )}

      {/* Eliminar o comentar esta línea */}
      {/* <div className="status">{status}</div> */}
    </div>
  );
}

export default App;