import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreCreditos, useStoreJuego } from './utils/useStore';
import Swal from "sweetalert2";
import API from './utils/API';
import io from "socket.io-client";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

const Martillo = () => {
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [contador, setContador] = useState(0);;
  const [videoSrc, setVideoSrc] = useState("/video/martillo_inicio.mp4");
  const [mensajeChuscoActual, setMensajeChuscoActual] = useState("");
  const [mensajeDesafio, setMensajeDesafio] = useState("");
  const mensajeIntervalo = useRef(null);
  const { creditos, setCreditos } = useStoreCreditos();
  const creditosRef = useRef(creditos);
  const navigate = useNavigate();
  const refIntervalo = useRef(null);
  const animacionRef = useRef(null);

  const messages = [
    "¿Tienes la fuerza de un verdadero guerrero?",
    "¡Solo los valientes se atreven a golpear!",
    "¡Rompe el récord y haz historia!",
    "¿Listo para hacer temblar la máquina?",
    "¡Muéstranos de qué estás hecho!",
    "¡Es hora de convertirte en leyenda!",
    "¡Un solo golpe puede cambiarlo todo!",
    "¡Desata tu poder como nunca antes!",
    "¡Vamos, no seas tímido con el martillo!",
    "¡El público espera tu gran momento!",
    "¡Esta es tu oportunidad de brillar!",
    "¿Quién dijo miedo? ¡A golpear!",
    "¡Haz rugir la feria con tu fuerza!",
    "¡Es tu turno, deja tu marca!",
    "¡La gloria te está esperando!",
    "¡Golpea fuerte o vete a casa!",
    "¡¿Quién manda aquí?! ¡Demuestra que eres tú!",
    "¡Nada de excusas, solo fuerza bruta!"
  ];

  const mensajesChuscos = [
    "¡Eso fue un masaje, no un golpe!",
    "¿Tienes miedo de romper la máquina o qué?",
    "¡Le pegaste como si te diera pena!",
    "¡Mi sobrino de 5 años golpea más duro!",
    "¡Ni la máquina se dio cuenta que la golpeaste!",
    "¡Eso no fue un golpe, fue un saludo!",
    "¿Vienes a jugar o a acariciar el martillo?",
    "¡Más fuerza tiene una servilleta mojada!",
    "¡Con ese golpe ni una piñata se rompe!",
    "¡Qué delicadeza, digno de ballet!",
    "¡Pídele ayuda a tu abuelita!",
    "¡Se busca potencia, no caricias!",
    "¡Golpeaste con miedo o con sueño?",
    "¡Eso no fue un golpe, fue una disculpa!",
    "¡¿Trajiste las ganas o las dejaste en casa?!",
    "¡Parece que le pediste permiso a la máquina!",
    "¡Ese golpe fue tan suave que dio ternura!",
    "¡Eso fue más triste que una telenovela!",
    "¡Así no ganas ni un peluche, campeón!",
    "¡Ni el aire lo sintió, intenta otra vez!"
  ];

  const refs = useRef([React.createRef(), React.createRef()]);

  useEffect(() => {
    creditosRef.current = creditos;
  }, [creditos]);

  useEffect(() => {
    getCreditos();
    refs.current[0].current?.focus();
    const keypressListener = (response) => {
      if (response.data.key === "left") {
        simulateArrowLeft();
      } else if (response.data.key === "right") {
        simulateArrowRight();
      } else if (response.data.key === "enter") {
        simulateEnter();
      } else if (response.data.key === "return") {
        returnHome();
      }
    };
    const fuerzaListener = (response) => {
      if (response.data) {
        setScore(response.data);
        clearInterval(refIntervalo.current);
        setStep(4);
        setVideoSrc("/video/final_martillo.mp4");
        animarPuntaje(response.data);
        setTimeout(() => {
          setStep(5);
          setVideoSrc("/video/victoria_martillo.mp4");
          setMensajeChuscoActual(mensajesChuscos[Math.floor(Math.random() * mensajesChuscos.length)]);
          setTimeout(() => {
            setStep(1);
            setVideoSrc("/video/martillo_inicio.mp4");
            setMensajeChuscoActual("");
            setScore(0);
            setContador(0);
            setMensajeDesafio("");
          }, 9000);
        }, 8000);
      }
    };
    const creditosListener = () => {
      getCreditos();
    };
    socket.on("keypress", keypressListener);
    socket.on("fuerza", fuerzaListener);
    socket.on("creditos", creditosListener);
    return () => {
      socket.off("keypress", keypressListener);
      socket.off("fuerza", fuerzaListener);
      socket.off("creditos", creditosListener);
      if (refIntervalo.current) clearInterval(refIntervalo.current);
      if (mensajeIntervalo.current) clearInterval(mensajeIntervalo.current);
      if (animacionRef.current) cancelAnimationFrame(animacionRef.current);
    };
  }, []);

  useEffect(() => {
    if (step === 1) {
        setMensajeDesafio("");
        const alternarMensaje = () => {
            setMensajeDesafio(prev => (prev === "" ? messages[Math.floor(Math.random() * messages.length)] : ""));
        };
        mensajeIntervalo.current = setInterval(alternarMensaje, 10000);
        return () => {
            clearInterval(mensajeIntervalo.current);
            mensajeIntervalo.current = null;
        };
    } else {
        clearInterval(mensajeIntervalo.current);
        mensajeIntervalo.current = null;
        setMensajeDesafio("");
    }
  }, [step]);


  useEffect(() => {
    if (step === 2) {
      const videoElement = document.getElementById("video");
      const handleVideoEnd = () => {
        if (videoSrc === "/video/inicio_partida_martillo.mp4") {
          setContador(30);
          let tiempo = 30;
          const intervalo = setInterval(() => {
            setContador(tiempo);
            tiempo--;
            if (tiempo < 0) {
              clearInterval(intervalo);
            }
          }, 1000);
        }
      };
      videoElement.addEventListener("ended", handleVideoEnd);
      return () => videoElement.removeEventListener("ended", handleVideoEnd);
    }
  }, [step, videoSrc]);

  const iniciarMartillo = () => {
    if (creditosRef.current >= 10) {
      setStep(2);
      setVideoSrc("/video/martillo_espera.mp4");
      setTimeout(() => {
        setVideoSrc("/video/inicio_partida_martillo.mp4");
        setContador(30);
        let tiempo = 30;
        refIntervalo.current = setInterval(() => {
          setContador(tiempo);
          tiempo--;
          if (tiempo === -2) {
            clearInterval(refIntervalo.current);
            setStep(6);
            setVideoSrc("/video/final_martillo.mp4");
            setTimeout(() => {
              setStep(1);
              setVideoSrc("/video/martillo_inicio.mp4");
              setMensajeDesafio("");
              setContador(0);
              setScore(0);
              setMensajeChuscoActual("");
            }, 7000);
          }
        }, 1000);
        iniciarSecuencia();
      }, 15000);
    } else {
      Swal.fire({
          title: "¡No tienes suficientes créditos!",
          text: "Necesitas al menos 10 créditos para jugar.",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
      });
    }
  };

  const animarPuntaje = (fuerza) => {
    setScore(0);
    let start = null;
    let duracion = 1200;
    let fuerzaFinal = fuerza;
    let scoreAnimado = 0;

    const animar = (timestamp) => {
      if (!start) start = timestamp;
      const progreso = Math.min((timestamp - start) / duracion, 1);
      scoreAnimado = Math.round(fuerzaFinal * progreso);
      setScore(scoreAnimado);
      if (progreso < 1) {
        animacionRef.current = requestAnimationFrame(animar);
      } else {
        setScore(fuerzaFinal);
        animacionRef.current = null;
      }
    };
    if (animacionRef.current) {
      cancelAnimationFrame(animacionRef.current);
    }
    animacionRef.current = requestAnimationFrame(animar);
  };

  useEffect(() => {
    return () => {
      if (animacionRef.current) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, []);

  const getCreditos = async () => {
    await API.get("/juegosfuerza/creditos/")
      .then((response) => {
        setCreditos(response.data.total);
      })
      .catch((error) => {
        console.error("Error fetching credits:", error);
      });
  }

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
      window.location.href = link;
    } else {
      iniciarMartillo();
    }
  };

  const returnHome = () => {
    window.location.href = import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza";
  };

  const iniciarSecuencia = () => {
    API.get("/juegosfuerza/iniciar-juego", {
      params: {
        juego: "martillo",
        creditos: 10
      }
    })
    .then((response) => {
      console.log("Juego iniciado correctamente");
    })
    .catch((error) => {
      console.error("Error al iniciar el juego:", error);
    });
    setCreditos(creditosRef.current - 10);
  }

  return (
    <div className="relative w-full h-screen">
      <video
        key={videoSrc}
        className="absolute top-0 left-0 w-full h-full object-cover"
        id="video"
        autoPlay
        loop
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        {step === 1 && (
          <>
            <div className="flex flex-col items-center mt-auto mb-10">
              <img src="/images/martillo.jpeg" alt="Logo" className="absolute top-4 w-72 opacity-100" />
              <div className="flex flex-row items-center justify-between w-full max-w-3xl p-4 ">
                <button className="bg-green-500 text-white px-8 py-4 rounded mt-6 text-3xl font-bold mr-2" onClick={iniciarMartillo} ref={refs.current[0]}>
                  ¡Jugar!
                </button>

                <a className="bg-red-500 text-white px-5 py-4 rounded mt-6 text-3xl font-bold" href={import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza"} ref={refs.current[1]}>
                  Regresar
                </a>
              </div>
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
        )}
        {step === 2 && (
          <>
            {videoSrc === "/video/inicio_partida_martillo.mp4" &&  contador > 0 && (
              <>
              <h2 className="text-white text-7xl mt-8 mb-8 bg-black bg-opacity-50 p-4 rounded-lg">
                  Tiempo para golpe
              </h2>
              <h2 className="text-white text-9xl font-bold bg-black bg-opacity-50 p-4 rounded-lg">
                {contador}
              </h2>
              </>
            )}
          </>
        )}
        {step === 4 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
            <h1 className="text-yellow-400 text-9xl font-extrabold mb-4 animate-pulse">
              ¡Fuerza {score}!
            </h1>
          </div>
        )}
        {step === 5 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
            <h1 className="text-yellow-400 text-9xl font-extrabold mb-4 animate-pulse">
              ¡Tu fuerza fue {score}!
            </h1>
            <h2 className="text-white text-6xl font-bold italic">
              {mensajeChuscoActual}
            </h2>
          </div>
        )}
        {step === 6 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
            <h1 className="text-yellow-400 text-9xl font-extrabold mb-4 animate-pulse text-center">
              ¡Se te acabó el tiempo, vuelve a intentarlo!
            </h1>
            <h2 className="text-white text-6xl font-bold italic">
              {mensajeChuscoActual}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Martillo;