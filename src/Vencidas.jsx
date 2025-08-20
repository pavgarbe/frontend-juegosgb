import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreCreditos, useStoreJuego } from './utils/useStore';
// import Webcam from "react-webcam";
import API from './utils/API';
import io from "socket.io-client";

const URL = import.meta.env.VITE_APP_SOCKET_URL;
const socket = io(URL);

// Refs deben inicializarse dentro del componente usando useRef y useMemo, no en el scope global

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

const Vencidas = () => {
  const [step, setStep] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [videoSrc, setVideoSrc] = useState("/video/inicio_vencidas.mp4");
  const videoRef = useRef(null);
  // const webcamRef = useRef(null);
  const [mensajeDesafio, setMensajeDesafio] = useState("");
  const mensajeIntervalo = useRef(null);
  const { creditos, setCreditos } = useStoreCreditos();
  const { juego } = useStoreJuego();
  const navigate = useNavigate();
  const [fotosCapturadas, setFotosCapturadas] = useState([]);

  // refs deben estar aquí, no fuera del componente
  const refs = React.useMemo(() => Array.from({ length: 2 }, () => React.createRef()), []);
  const refs2 = React.useMemo(() => Array.from({ length: 10 }, () => React.createRef()), []);

  const messages = [
    "¿Aguantas o te rindes como los demás en las vencidas?",
    "¡Siente la fuerza de la victoria en las vencidas!",
    "¡Solo los valientes dominan las vencidas!",
    "¡No sueltes el brazo, demuestra que eres de acero!",
    "¡Cada segundo cuenta, no pierdas el foco en las vencidas!",
    "¡El que pierde, paga el refresco!",
    "¡Demuestra quién manda en la mesa de vencidas!",
    "¿Eres fuerza o solo apariencia?",
    "¡La potencia es tu aliada… si puedes con ella!",
    "¡Vamos, que los débiles ya se retiraron!",
    "¡Haz historia, gana las vencidas!",
    "¡Te estás ganando el respeto en el mundo de las vencidas!",
    "¡Esto no es para cualquiera, solo para verdaderos competidores!",
    "¡Tu fuerza está a prueba… literalmente!",
    "¡Aguanta como un campeón de vencidas!",
    "¡Los débiles ceden, los fuertes dominan!",
    "¡Recuerda: las vencidas son más mentales que físicas!",
    "¡Estás a un paso de convertirte en una leyenda de las vencidas!"
  ];

  useEffect(() => {
    getCreditos();
    refs[0].current?.focus();
  }, []);

  useEffect(() => {
    socket.on("keypress", handleKeyPress);
    return () => socket.off("keypress", handleKeyPress);
  }, []);

  useEffect(() => {
    if (videoSrc === `/video/${nivel}/victoria.mp4`) {
      const levelInterval = setTimeout(() => {
        setStep(0);
        setVideoSrc("/video/inicio_vencidas.mp4");
      }, 10000);
      return () => clearTimeout(levelInterval);
    }
  }, [videoSrc]);

  useEffect(() => {
    // Limpieza de intervalos: evitar duplicados
    if (mensajeIntervalo.current) clearInterval(mensajeIntervalo.current);
    const alternarMensaje = () => {
      setMensajeDesafio(prev => (prev === "" ? getRandomMessage(messages) : ""));
    };
    mensajeIntervalo.current = setInterval(alternarMensaje, 5000);
    return () => clearInterval(mensajeIntervalo.current);
  }, [step]);

  const getCreditos = async () => {
    try {
      const response = await API.get("/juegosfuerza/creditos/");
      setCreditos(response.data.total);
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const gastarCredito = async (cantidad) => {
    try {
      const response = await API.post("/juegosfuerza/creditos/gastar/", { cantidad, juego: "Vencidas" });
      getCreditos();
      useStoreJuego.setState({ juego: response.data.juego });
    } catch (error) {
      console.error("Error updating credits:", error);
    }
  };

  const handleKeyPress = (response) => {
    const actions = {
      up: simulateArrowUp,
      down: simulateArrowDown,
      enter: simulateEnter,
      return: returnHome
    };
    actions[response.data.key]?.();
  };

  const simulateArrowUp = () => {
    const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
    const prevIndex = (currentIndex - 1 + refs.length) % refs.length;
    refs[prevIndex].current?.focus();
  };

  const simulateArrowDown = () => {
    const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
    const nextIndex = (currentIndex + 1) % refs.length;
    refs[nextIndex].current?.focus();
  };

  const simulateEnter = () => {
    const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
    const link = refs[currentIndex]?.current?.getAttribute("href");
    link ? navigate(link) : iniciarVencidas();
  };

  const iniciarVencidas = async () => {
    if (creditos >= 10) {
      await gastarCredito(10);
      refs2[0].current?.focus();
      setStep(1);
      setVideoSrc("/video/vencidaspromocion1.mp4");
    } else {
      alert("❌ No tienes suficientes créditos. Inserta más monedas.");
    }
  };

  const selectLevel = (level) => {
    setStep(2);
    setNivel(level);
  };

  const initGame = () => {
    setStep(3);
    setVideoSrc(`/video/${nivel}/perdiendo.mp4`);
    //const interval = setInterval(capturePhoto, 5000);
    setTimeout(() => {
      //clearInterval(interval);
      setVideoSrc(`/video/${nivel}/ganando.mp4`);
    }, 15000);
  };

  const endGame = () => {
    setStep(4);
    setVideoSrc(`/video/${nivel}/victoria.mp4`);
  };

  const returnHome = () => {
    navigate(import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza");
  };

  // const capturePhoto = () => {
  //   if (webcamRef.current) {
  //     const imageSrc = webcamRef.current.getScreenshot({width: 1920, height: 1080});
  //     if (imageSrc) {
  //       console.log("Foto capturada:", imageSrc);
  //       setFotosCapturadas(prev => [...prev, imageSrc]);
  //     } else {
  //       console.error("Error: No se pudo capturar la foto. Asegúrate de que la webcam esté funcionando correctamente.");
  //     }
  //   } else {
  //     console.error("Error: La referencia de la webcam no está disponible.");
  //   }
  // };

  return (
    <div className="relative w-full h-screen">
      {/* <Webcam
        ref={webcamRef}
        height={1080}
        width={1920}
        audio={false}
        screenshotFormat="image/jpeg"
        className="hidden"
        videoConstraints={{
          facingMode: "user",
          width: 1920,
          height: 1080
        }}
      /> */}
      <video
        ref={videoRef}
        key={videoSrc}
        className="absolute top-0 left-0 w-full h-full object-cover"
        id="video"
        autoPlay
        loop
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        {step === 0 && (
          <StepZero refs={refs} iniciarVencidas={iniciarVencidas} creditos={creditos} mensajeDesafio={mensajeDesafio} />
        )}
        {step === 1 && (
          <StepOne refs2={refs2} selectLevel={selectLevel} />
        )}
        {step === 2 && (
          <StepTwo nivel={nivel} initGame={initGame} refs2={refs2} />
        )}
        {step === 3 && (
          <StepThree nivel={nivel} mensajeDesafio={mensajeDesafio} endGame={endGame} refs2={refs2} />
        )}
        {step === 4 && (
          <StepFour nivel={nivel} fotosCapturadas={fotosCapturadas} />
        )}
      </div>
    </div>
  );
};

const StepZero = ({ refs, iniciarVencidas, creditos, mensajeDesafio }) => (
  <>
    <div className="flex flex-col items-center mt-auto mb-10">
      <img src="/images/vencidas.jpeg" alt="Logo" className="absolute top-4 w-72 opacity-100" />
      <button className="bg-green-500 text-white px-8 py-4 rounded mt-6 text-3xl font-bold" ref={refs[0]} onClick={iniciarVencidas}>
        ¡Jugar!
      </button>
      <a className="bg-red-500 text-white px-5 py-4 rounded mt-6 text-3xl font-bold" href={import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza"} ref={refs[1]}>
        Regresar
      </a>
      <div className="absolute bottom-4 left-4 text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
        💰 Créditos: {creditos} pesos
      </div>
    </div>
    {mensajeDesafio && (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-5xl font-extrabold p-5 rounded-lg animate-fade-in shadow-2xl">
        <span className="text-yellow-400 drop-shadow-lg">{mensajeDesafio}</span>
      </div>
    )}
  </>
);

const StepOne = ({ refs2, selectLevel }) => (
  <>
    <h1 className="text-7xl font-bold text-white">¡Selecciona tu nivel!</h1>
    <div className="flex flex-row items-center justify-center flex-wrap gap-4 mt-10">
      {Array.from({ length: 10 }, (_, i) => (
        <button
          key={i}
          ref={refs2[i]}
          onClick={() => selectLevel(i + 1)}
          className="w-80"
        >
          <img src={`/images/niveles/${i + 1}.png`} alt="Maquina de Vencidas" className="w-full" />
        </button>
      ))}
    </div>
  </>
);

const StepTwo = ({ nivel, initGame, refs2 }) => (
  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
    <h1 className="text-7xl font-bold text-white">Has elegido el nivel {nivel}</h1>
    <h1 className="text-5xl font-bold text-white mt-4">¿Listo para comenzar?</h1>
    <button
      ref={refs2[0]}
      onClick={initGame}
      className="bg-green-500 text-white px-8 py-4 rounded text-3xl font-bold mt-8"
    >
      ¡Comenzar!
    </button>
  </div>
);

const StepThree = ({ nivel, mensajeDesafio, endGame, refs2 }) => (
  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
    <h1 className="text-white text-8xl font-bold italic">¡Nivel {nivel}!</h1>
    <h1 className="text-yellow-400 text-7xl font-extrabold mb-4 animate-pulse">{mensajeDesafio}</h1>
    <button
      ref={refs2[1]}
      onClick={endGame}
      className="bg-red-500 text-white px-8 py-4 rounded mt-6 text-3xl font-bold"
    >
      Terminar
    </button>
  </div>
);

const StepFour = ({ nivel, fotosCapturadas }) => (
  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
    <h1 className="text-yellow-400 text-7xl font-extrabold mb-4 animate-pulse">¡Has ganado el nivel {nivel}!</h1>
    <h2 className="text-white text-6xl font-bold italic">¡Felicidades!</h2>
    {/* <div className="flex flex-wrap justify-center mt-8">
      {fotosCapturadas.map((foto, index) => (
        <img key={index} src={foto} alt={`Foto ${index + 1}`} className="w-48 h-48 m-2 rounded-lg shadow-lg" />
      ))}
    </div> */}
  </div>
);

export default Vencidas;
