import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

const promoVideos = [
  "/video/boxeopromocion1.mp4",
  "/video/toquespromocion1.mp4",
  "/video/martillopromocion1.mp4",
  "/video/vencidaspromocion1.mp4",
];

const mensajes = {
  boxeo: [
    "¡Dale con todo, campeón!",
    "¡Haz temblar el saco!",
    "¡No te rajes, es solo boxeo!",
  ],
  toques: [
    "¿Puedes con la corriente?",
    "¡No sueltes los electrodos!",
    "¡Atrévete a llegar al final!",
  ],
  martillo: [
    "¡Haz sonar ese martillo!",
    "¡Demuestra tu fuerza bruta!",
    "¡No golpees como gallina!",
  ],
  vencidas: [
    "¡No dejes que te venza el fierro!",
    "¡Usa todo tu poder!",
    "¡Rétate a ti mismo!",
  ],
};

const getTipoVideo = (src) => {
  if (src.includes("boxeo")) return "boxeo";
  if (src.includes("toques")) return "toques";
  if (src.includes("martillo")) return "martillo";
  if (src.includes("vencidas")) return "vencidas";
  return "boxeo";
};

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

const VideoPromocional = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(getRandomItem(promoVideos));
  const [mensaje, setMensaje] = useState("");
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const handleActivity = () => {
      const destino = import.meta.env.VITE_APP_MODO === "full" ? "/juegos-fuerza" : "/";
      navigate(destino);
    };

    const eventos = ["mousemove", "mousedown", "keydown", "touchstart"];
    eventos.forEach(e => window.addEventListener(e, handleActivity));
    return () => eventos.forEach(e => window.removeEventListener(e, handleActivity));
  }, [navigate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tipo = getTipoVideo(videoSrc);
    setMensaje(getRandomItem(mensajes[tipo]));

    setFade(true); // inicia el fade out

    const timeout = setTimeout(() => {
      video.load();
      video.play().catch(err => console.warn("❌ Error al reproducir:", err));
      setFade(false); // fade in
    }, 300); // duración del fade-out antes de cambiar video

    // Limpieza del timeout
    return () => clearTimeout(timeout);
  }, [videoSrc]);

  useEffect(() => {
    const keypressListener = (response) => {
      const destino = import.meta.env.VITE_APP_MODO === "full" ? "/juegos-fuerza" : "/";
      navigate(destino);
    };
    socket.on("keypress", keypressListener);
    return () => {
      socket.off("keypress", keypressListener);
    };
  }, [navigate]);

  const handleEnded = () => {
    let nextVideo;
    if (promoVideos.length > 1) {
      do {
        nextVideo = getRandomItem(promoVideos);
      } while (nextVideo === videoSrc);
    } else {
      nextVideo = promoVideos[0];
    }
    setVideoSrc(nextVideo);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black z-50">
      <video
        ref={videoRef}
        autoPlay
        muted={false}
        playsInline
        onEnded={handleEnded}
        className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
      >
        <source src={videoSrc} type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
      </video>

      <div className="absolute bottom-10 w-full text-center">
        <h2 className="text-white text-3xl font-bold animate-bounce bg-black/50 px-6 py-3 rounded-xl inline-block transition-opacity duration-700">
          {mensaje}
        </h2>
      </div>
    </div>
  );
};

export default VideoPromocional;

