import React, { useState, useRef } from "react";
import "./App.css";

// ¡CAMBIAR POR LA IP DE TU ESP32!
const ESP32_IP = "10.142.69.251"; 

function App() {
  const [status, setStatus] = useState("");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [isProcessActive, setIsProcessActive] = useState(false);
  const audioRef = useRef(null);

  // Función para controlar LEDs
  const controlarLEDs = async (comando) => {
    try {
      console.log(`Enviando comando: ${comando}`);
      const response = await fetch(`http://${ESP32_IP}/${comando}`);
      const result = await response.text();
      console.log(`Respuesta LEDs: ${result}`);
    } catch (error) {
      console.error("Error controlando LEDs:", error);
    }
  };

  const playAudio = async (id) => {
    if (isProcessActive) return;

    // Iniciar proceso del botón en el ESP32
    await controlarLEDs(`iniciar/boton${id}`);
    
    // Crear y configurar audio con 3 segundos de silencio al inicio
    const audio = new Audio(`${process.env.PUBLIC_URL}/audio/testimonio${id}.mp3`);
    
    // Silenciar los primeros 3 segundos para el fade in
    audio.volume = 0;
    
    audio.play();
    setCurrentAudio(audio);
    setCurrentPlayingId(id);
    setIsPlaying(true);
    setIsProcessActive(true);
    setStatus("");

    // Temporizador para restaurar volumen después de 3 segundos (fade in)
    setTimeout(() => {
      if (audio) {
        audio.volume = 1.0;
      }
    }, 3000);

    // Cuando el audio termine naturalmente
    audio.onended = () => {
      console.log("Audio terminado naturalmente");
      // Notificar al ESP32 que el audio terminó para iniciar fade out
      controlarLEDs("audio/terminado");
      
      // No detenemos inmediatamente, esperamos que el ESP32 complete la secuencia GPIO19
      // El proceso se mantiene activo hasta que el ESP32 termine toda la secuencia
      // o hasta que el usuario presione detener
    };

    // Manejar errores de audio
    audio.onerror = () => {
      console.error("Error reproduciendo audio");
      // Si hay error de audio, aún así notificar terminación
      controlarLEDs("audio/terminado");
    };
  };

  const stopAudio = async () => {
    console.log("Deteniendo proceso completo");
    
    // Detener audio si está reproduciéndose
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    // Enviar comando de detener al ESP32
    await controlarLEDs("detener");
    
    // Resetear estados
    setIsPlaying(false);
    setCurrentPlayingId(null);
    setIsProcessActive(false);
    setStatus("");
  };

  // Función para verificar conexión con ESP32
  const verificarConexion = async () => {
    try {
      const response = await fetch(`http://${ESP32_IP}/`);
      if (response.ok) {
        console.log("✅ Conexión con ESP32 establecida");
        return true;
      }
    } catch (error) {
      console.error("❌ No se pudo conectar al ESP32:", error);
      setStatus("Error: No se puede conectar al ESP32");
      setTimeout(() => setStatus(""), 3000);
    }
    return false;
  };

  return (
    <div className={`app-container ${isPlaying ? 'playing' : ''}`}>
      {/* Indicador de estado */}
      {status && (
        <div className="status-message">
          {status}
        </div>
      )}
      
      {/* Indicador de conexión */}
      <div className="connection-status">
        <button 
          className="connection-test"
          onClick={verificarConexion}
          title="Verificar conexión con ESP32"
        >
          🔍 Test Conexión
        </button>
      </div>

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
            <span className="button-text">{id}</span>
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
              {currentPlayingId ? `Reproduciendo audio ${currentPlayingId}` : "Proceso activo"}
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
