import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreCreditos } from "./utils/useStore";
import API from "./utils/API";
import io from "socket.io-client";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

const JuegosFuerza = () => {
  const [inactive, setInactive] = useState(false);
  const inactivityTimer = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const { creditos } = useStoreCreditos();

  // refs debe ser estable y no recrearse en cada render
  const refs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ]);

  useEffect(() => {
    getCreditos();
    refs.current[0].current?.focus();
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/audio/musicasuspenso1.MP3");
    audioRef.current.loop = true;

    const startAudio = () => {
      audioRef.current
        .play()
        .then(() => console.log("🔊 Música de fondo activada"))
        .catch((err) => console.warn("🔇 Error al activar audio:", err));
    };

    window.addEventListener("keydown", (event) => {
      audioRef.current?.play().catch(() => {});
    });

    socket.on("keypress", (response) => {
      if (response.data.key === "left") {
        simulateArrowLeft()
      } else if (response.data.key === "right") {
        simulateArrowRight()
      } else if (response.data.key === "enter") {
        simulateEnter()
      } else if (response.data.key === "return") {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        navigate("/");
      }
    });
    socket.on("creditos", (response) => {
      getCreditos();
    });

    startAudio();
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(inactivityTimer.current);
      if (inactive) {
        setInactive(false);
      }
      inactivityTimer.current = setTimeout(() => {
        console.log("Inactividad detectada → entrando a modo video");
        setInactive(true);
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
        navigate("/video-promocional");
      }, 60000);
    };

    const salirDelModo = () => {
      if (inactive) {
        setInactive(false);
        audioRef.current?.play().catch(() => {});
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("mousedown", salirDelModo);
    window.addEventListener("touchstart", salirDelModo);

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("mousedown", salirDelModo);
      window.removeEventListener("touchstart", salirDelModo);
    };
  }, [inactive]);

  const simulateArrowLeft = () => {
    const currentIndex = refs.current.findIndex(ref => document.activeElement === ref?.current);
    const prevIndex = (currentIndex - 1 + refs.current.length) % refs.current.length;
    refs.current[prevIndex].current?.focus();
  };

  const simulateArrowRight = () => {
    const currentIndex = refs.current.findIndex(ref => document.activeElement === ref?.current);
    const nextIndex = (currentIndex + 1) % refs.current.length;
    refs.current[nextIndex].current?.focus();
  };

  const simulateEnter = () => {
    const currentIndex = refs.current.findIndex(ref => document.activeElement === ref?.current);
    const link = refs.current[currentIndex]?.current?.getAttribute("href");
    if (link) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      navigate(link);
    }
  };

  const getCreditos = async () => {
    API.get("/juegosfuerza/creditos/")
      .then((response) => {
        useStoreCreditos.setState({ creditos: response.data.total });
      })
      .catch((error) => {
        console.error("Error fetching credits:", error);
      });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }


  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-black text-white pt-0">
      <img
        src="/images/logosistema.png"
        alt="Logo del sistema"
        className="w-96 -mt-7"
      />
      <div className="flex flex-row items-center gap-2">
        <div className="w-full flex flex-col items-center justify-center mr-2">
          <a
            ref={refs.current[0]}
            href="/maquina-boxeo"
            onClick={() => {stopAudio()}}
            className="w-52 mb-6"
          >
            <img src="/images/boxeo.jpeg" alt="Maquina de Boxeo" className="w-52 rounded-lg" />
          </a>
          <a
            ref={refs.current[2]}
            href="/maquina-toques"
            onClick={() => {stopAudio()}}
            className="w-52"
          >
            <img src="/images/toques.jpeg" alt="Maquina de Toques" className="w-52 rounded-lg" />
          </a>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <a
            ref={refs.current[1]}
            href="/maquina-martillo"
            onClick={() => {stopAudio()}}
            className="w-52 mb-6"
          >
            <img src="/images/martillo.jpeg" alt="Maquina de Martillo" className="w-52 rounded-lg" />
          </a>
          <a
            ref={refs.current[3]}
            href="/maquina-vencidas"
            onClick={() => {stopAudio()}}
            className="w-52"
          >
            <img src="/images/vencidas.jpeg" alt="Maquina de Vencidas" className="w-52 rounded-lg" />
          </a>
        </div>
      </div>
      <div className="animation-box">
        <div className="floating-shape" style={{ top: "5%", left: "70%", animationDuration: "10s" }}></div>
        <div className="floating-shape" style={{ top: "20%", left: "80%", animationDuration: "9s" }}></div>
        <div className="floating-shape" style={{ top: "40%", left: "90%", animationDuration: "8s" }}></div>
        <div className="floating-shape" style={{ top: "60%", left: "80%", animationDuration: "7s" }}></div>
        <div className="floating-shape" style={{ top: "80%", left: "90%", animationDuration: "6s" }}></div>
        <div className="floating-shape" style={{ top: "90%", right: "70%", animationDuration: "6s" }}></div>
        <div className="floating-shape" style={{ top: "70%", right: "80%", animationDuration: "7s" }}></div>
        <div className="floating-shape" style={{ top: "50%", right: "90%", animationDuration: "8s" }}></div>
        <div className="floating-shape" style={{ top: "30%", right: "80%", animationDuration: "9s" }}></div>
        <div className="floating-shape" style={{ top: "10%", right: "90%", animationDuration: "10s" }}></div>
      </div>
      <div className="absolute bottom-4 left-4 text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
        💰 Créditos: {creditos} pesos
      </div>
    </div>
  );
};

export default JuegosFuerza;
