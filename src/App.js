import React, { useState, useRef } from "react";
import "./App.css";

const ESP32_IP = "10.142.69.251"; 

// Mapeo de botones a localidades
const LOCALIDADES = {
  1: "Lucanamarca",
  2: "Soras", 
  3: "Ccano",
  4: "Aranhuay"
};

function App() {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isProcessActive, setIsProcessActive] = useState(false);

  // Función para controlar LEDs
  const controlarLEDs = async (comando) => {
    try {
      await fetch(`http://${ESP32_IP}/${comando}`);
    } catch (error) {
      // Silenciar errores
    }
  };

  const playAudio = async (id) => {
    if (isProcessActive) return;

    // Iniciar proceso del botón en el ESP32
    await controlarLEDs(`iniciar/boton${id}`);
    
    const audio = new Audio(`${process.env.PUBLIC_URL}/audio/testimonio${id}.mp3`);
    
    // Silenciar los primeros 3 segundos para el fade in
    audio.volume = 0;
    
    audio.play();
    setCurrentAudio(audio);
    setCurrentPlayingId(id);
    setIsPlaying(true);
    setIsProcessActive(true);

    // Restaurar volumen después de 3 segundos
    setTimeout(() => {
      if (audio) {
        audio.volume = 1.0;
      }
    }, 3000);

    // Cuando el audio termine
    audio.onended = () => {
      controlarLEDs("audio/terminado");
      
      // ESPERAR 10 SEGUNDOS (GPIO19) y luego ocultar todo
      setTimeout(() => {
        stopAudio();
      }, 10000);
    };

    audio.onerror = () => {
      controlarLEDs("audio/terminado");
      setTimeout(() => {
        stopAudio();
      }, 10000);
    };
  };

  const stopAudio = async () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    await controlarLEDs("detener");
    
    setIsPlaying(false);
    setCurrentPlayingId(null);
    setIsProcessActive(false);
  };

  return (
    <div className={`app-container ${isPlaying ? 'playing' : ''}`}>
      <div className="buttons-grid">
        {[1, 2, 3, 4].map((id) => (
          <button 
            key={id} 
            className={`audio-button ${currentPlayingId === id ? 'active' : ''} ${
              isProcessActive && currentPlayingId !== id ? 'disabled' : ''
            }`}
            onClick={() => !isProcessActive && playAudio(id)}
            disabled={isProcessActive}
          >
            <span className="button-text">{LOCALIDADES[id]}</span>
            <span className="button-subtext">
              {isProcessActive && currentPlayingId === id ? "Ejecutando..." : ""}
            </span>
          </button>
        ))}
      </div>

      {(isPlaying || isProcessActive) && (
        <div className="audio-controls-overlay">
          <div className="audio-controls">
            <div className="playing-status">
              Reproduciendo: {LOCALIDADES[currentPlayingId]}
              <div className="process-info">
                {isProcessActive && "Secuencia de LEDs en progreso..."}
              </div>
            </div>
            <button className="stop-button" onClick={stopAudio}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
              <span>Detener Todo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
