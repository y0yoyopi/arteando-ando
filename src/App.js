import React, { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Ningún testimonio en reproducción");
  const [currentAudio, setCurrentAudio] = useState(null);

  const playAudio = (id) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(`${process.env.PUBLIC_URL}/audios/testimonio${id}.mp3`);
    audio.play();
    setCurrentAudio(audio);
    setStatus(` Reproduciendo testimonio ${id}...`);

    audio.onended = () => {
      setStatus(" Reproducción finalizada");
    };
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Arteando Ando</h1>
      <p>Selecciona un testimonio:</p>

      <div style={styles.buttons}>
        {[1, 2, 3, 4].map((id) => (
          <button key={id} style={styles.button} onClick={() => playAudio(id)}>
            Pueblo {id}
          </button>
        ))}
      </div>

      <div style={styles.status}>{status}</div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#111",
    color: "#fff",
    minHeight: "100vh",
    textAlign: "center",
    paddingTop: "5rem",
    fontFamily: "Poppins, sans-serif",
  },
  title: {
    color: "#f4d03f",
    fontSize: "2.2rem",
    marginBottom: "1.5rem",
  },
  buttons: {
    marginTop: "1rem",
  },
  button: {
    background: "#f4d03f",
    border: "none",
    borderRadius: "12px",
    color: "#000",
    padding: "15px 25px",
    margin: "10px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  status: {
    marginTop: "2rem",
    fontSize: "1.2rem",
    color: "#bbb",
  },
};

export default App;
