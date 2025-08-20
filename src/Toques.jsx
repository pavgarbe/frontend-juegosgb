import React, { useState, useEffect, useRef } from 'react';
import { useStoreCreditos } from './utils/useStore';
import API from './utils/API';
import io from "socket.io-client";
import Swal from 'sweetalert2';
// import Webcam from "react-webcam";

const URL = import.meta.env.VITE_APP_SOCKET_URL;
const socket = io(URL);

const Toques = () => {
  const [step, setStep] = useState(1);
  const [nivel, setNivel] = useState(0);
  const [videoSrc, setVideoSrc] = useState("/video/inicio_toques.mp4");
  const [mensajeChuscoActual, setMensajeChuscoActual] = useState("");
  const [mensajeDesafio, setMensajeDesafio] = useState("");
  const refIntervalo = useRef(null);
  const [contador, setContador] = useState(30);
  // const [fotosCapturadas, setFotosCapturadas] = useState([]);

  const videoRef = useRef(null);
  // const webcamRef = useRef(null);
  const mensajeIntervalo = useRef(null);
  const refs = [useRef(null), useRef(null)];
  const nivelIntervalo = useRef(null);

  const { creditos, setCreditos } = useStoreCreditos();
  const creditosRef = useRef(creditos);

  const messages = [
    "¿Aguantas o te rindes como los demás?",
    "¡Siente la corriente de la victoria!",
    "¡Solo los valientes siguen conectados!",
    "¡No sueltes, demuestra que eres de acero!",
    "¡Cada segundo cuenta, no parpadees!",
    "¡El que ríe, pierde!",
    "¡Demuestra quién manda aquí!",
    "¿Eres corriente o resistencias?",
    "¡La energía es tu amiga… si puedes con ella!",
    "¡Vamos, que los cobardes ya se fueron!",
    "¡Haz historia, aguanta el poder!",
    "¡Te estás ganando el respeto eléctrico!",
    "¡Esto no es para cualquiera!",
    "¡Tu valor está a prueba… literalmente!",
    "¡Aguanta como un campeón!",
    "¡Los débiles sueltan, los fuertes aguantan!",
    "¡Recuerda: es mental, no físico!",
    "¡Estás a un paso de convertirte en leyenda!"
  ];

  const mensajesChuscos = [
    "¡Pareces pescado en feria, cómo te retorciste!",
    "¿Eso fue un grito o un gallo desmayado?",
    "¡Tu cara fue lo mejor del show!",
    "¡¿Aguantas o llamamos a tu mamá?!",
    "¡Creo que la luz del vecindario bajó contigo!",
    "¡La electricidad se asustó contigo!",
    "¡Tu cara pidió auxilio antes que tú!",
    "¡Eso fue una coreografía de TikTok o qué?!",
    "¡No sabías si bailar o llorar!",
    "¡Los toques no te tumbaron, fue la vergüenza!",
    "¡Esa reacción merece un Oscar!",
    "¡Te retorciste más que fideo en microondas!",
    "¡Parecía que estabas bailando cumbia!",
    "¡Te faltó gritar '¡yaaaa!' en cámara lenta!",
    "¡A ese ritmo prendes un foco con la cara!",
    "¡Podrías cargar tu cel con tanto movimiento!",
    "¡Ni los toques sabían qué hacías!",
    "¡¿Querías toques o un exorcismo?!",
    "¡Ese fue un viaje espiritual express!",
    "¡La próxima tráete un casco… y dignidad!"
  ];

  useEffect(() => {
    getCreditos();
    refs[0].current?.focus();
    setVideoSrc("/video/inicio_toques.mp4");
  }, []);

  useEffect(() => {
        creditosRef.current = creditos;
  }, [creditos]);

  useEffect(() => {
    socket.on("keypress", (response) => {
      if (response.data.key === "left") {
        simulateArrowLeft()
      } else if (response.data.key === "right") {
        simulateArrowRight()
      } else if (response.data.key === "enter") {
        simulateEnter()
      } else if (response.data.key === "return") {
        returnHome()
      }
    });
    socket.on("inicio", (response) => {
      setStep(2);
      setNivel(1);
      clearInterval(refIntervalo.current);
      secuenciaToques();
    });
    socket.on("fin", (response) => {
      setStep(4);
      clearInterval(nivelIntervalo.current);
      if (nivel >= 40) {
        setVideoSrc("/video/victoria_toques.mp4");
      } else {
        setVideoSrc("/video/derrota_toques.mp4");
      }
      setMensajeChuscoActual(getRandomMessage(mensajesChuscos));
      setTimeout(() => {
        resetGame();
      }, 10000);
    });
    socket.on("creditos", (response) => {
      getCreditos();
    });
    return () => {
      socket.off("keypress");
      socket.off("inicio");
      socket.off("fin");
    }
  }, []);

  useEffect(() => {
    setMensajeDesafio("");
    mensajeIntervalo.current = setInterval(() => {
      setMensajeDesafio(prev => (prev === "" ? getRandomMessage(messages) : ""));
    }, 5000);

    return () => clearInterval(mensajeIntervalo.current);
  }, [step]);

  useEffect(() => {
    if (step === 2 && videoSrc === "/video/instrucciones_toques.mp4") {
      const interval = setTimeout(() => setVideoSrc("/video/inicio_partida_toques.mp4"), 8500);
      return () => clearTimeout(interval);
    }
  }, [step, videoSrc]);

  const getCreditos = async () => {
    try {
      const response = await API.get("/juegosfuerza/creditos/");
      setCreditos(response.data.total);
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const simulateArrowLeft = () => {
    const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
    const prevIndex = (currentIndex - 1 + refs.length) % refs.length;
    refs[prevIndex].current?.focus();
  };

  const simulateArrowRight = () => {
    const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
    const nextIndex = (currentIndex + 1) % refs.length;
    refs[nextIndex].current?.focus();
  };

  const simulateEnter = () => {
    const currentIndex = refs.findIndex(ref => document.activeElement === ref?.current);
    const link = refs[currentIndex]?.current?.getAttribute("href");
    link ? window.location.href = link : iniciarToques();
  };

  const returnHome = () => {
    window.location.href = import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza";
  };

  const iniciarToques = async () => {
    if (creditosRef.current >= 10) {
      setStep(2);
      setVideoSrc("/video/instrucciones_toques.mp4");
      iniciarSecuencia();
      setTimeout(() => {
        setContador(30);
        let tiempo = 30;
        refIntervalo.current = setInterval(() => {
          setContador(tiempo);
          tiempo--;
          if (tiempo === -2) {
            clearInterval(refIntervalo.current);
            setStep(6);
            setVideoSrc("/video/derrota_toques.mp4");
            setTimeout(() => {
              resetGame();
            }, 5000);
          }
        }, 1000);
      }, 8500);
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

  const secuenciaToques = async () => {
    nivelIntervalo.current = setInterval(() => {
        setNivel(prev => {
          const nuevoNivel = prev + 1;
          // if (nuevoNivel % 10 === 0) capturePhoto();
          if (nuevoNivel >= 100) {
            clearInterval(nivelIntervalo.current);
            terminarJuego();
          }
          return nuevoNivel;
        });
      }, 1000);
  }

  // const capturePhoto = () => {
  //   if (webcamRef.current && webcamRef.current.video.readyState === 4) { // Verifica si la cámara está lista
  //     const imageSrc = webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
  //     if (imageSrc) {
  //       setFotosCapturadas(prev => [...prev, imageSrc]);
  //     } else {
  //       console.error("Error: No se pudo capturar la imagen.");
  //     }
  //   } else {
  //     console.error("Error: La cámara no está lista para capturar fotos.");
  //   }
  // };

  const iniciarSecuencia = () => {
    API.get("/juegosfuerza/iniciar-juego", {
      params: {
        juego: "toques",
        creditos: 10
      }
    })
    .then((response) => {
      console.log("Juego iniciado correctamente");
    })
    .catch((error) => {
      console.error("Error al iniciar el juego:", error);
    });
    setCreditos(creditos - 10);
  }

  const terminarJuego = () => {
    setStep(4);
    setVideoSrc("/video/victoria_toques.mp4");
    setMensajeChuscoActual(getRandomMessage(mensajesChuscos));
    setTimeout(resetGame, 9000);
  };

  const resetGame = () => {
    setStep(1);
    setVideoSrc("/video/inicio_toques.mp4");
    setNivel(1);
    // setFotosCapturadas([]);
    setMensajeDesafio("");
    setMensajeChuscoActual("");
  };

  const getRandomMessage = (array) => array[Math.floor(Math.random() * array.length)];

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  return (
    <div className="relative w-full h-screen">
      {/* <Webcam
        ref={webcamRef}
        height={1080}
        width={1920}
        audio={false}
        screenshotFormat="image/jpeg"
        className="hidden"
        videoConstraints={{ facingMode: "environment", width: 1920, height: 1080 }}
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
        {step === 1 && (
          <>
            <div className="flex flex-col items-center mt-auto mb-10">
              <img src="/images/toques.jpeg" alt="Logo" className="absolute top-4 w-72 opacity-100" />
              <div className="flex flex-row items-center justify-center p-6 rounded-lg">
                <button className="bg-green-500 text-white px-8 py-4 rounded mt-6 text-3xl font-bold mr-2" ref={refs[0]} onClick={iniciarToques}>
                  ¡Jugar!
                </button>
                <a className="bg-red-500 text-white px-5 py-4 rounded mt-6 text-3xl font-bold" href={import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza"} ref={refs[1]}>
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
            {videoSrc === "/video/inicio_partida_toques.mp4" && (
              <>
                {nivel >= 1 && nivel <= 100 && (
                <h2 className="text-white text-8xl mt-8 mb-8 bg-black bg-opacity-50 p-4 rounded-lg">
                  Nivel {nivel}
                </h2>
                )}
                {mensajeDesafio && (
                  <div className="relative bg-black bg-opacity-70 text-white text-5xl font-extrabold p-5 rounded-lg animate-fade-in shadow-2xl">
                    <span className="text-yellow-400 drop-shadow-lg">{mensajeDesafio}</span>
                  </div>
                )}
                {nivel === 0 && (
                <div className="absolute bottom-4 left-8 text-white font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
                  <h1 className="text-yellow-400 drop-shadow-lg text-6xl">
                    Tiempo para presionar botones y pedal
                  </h1>
                  <h1 className="text-yellow-400 drop-shadow-lg text-9xl">
                    ⏳ {contador} segundos
                  </h1>
                </div>
                )}
              </>
            )}
          </>
        )}

        {step === 4 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
            <h1 className="text-yellow-400 text-9xl font-extrabold mb-4 animate-pulse">
              ¡Alcanzaste el nivel {nivel}!
            </h1>
            <h1 className="text-yellow-400 text-6xl font-extrabold mb-4">
              Tu desempeño fue del {Math.ceil((nivel/100)*100)}%
            </h1>
            <h2 className="text-white text-6xl font-bold italic">
              {mensajeChuscoActual}
            </h2>
            {/* <div className="grid grid-cols-2 gap-4 mt-8">
              {fotosCapturadas.map((foto, index) => (
                <img key={index} src={foto} alt={`Foto ${index + 1}`} className="w-96 object-cover rounded" />
              ))}
            </div> */}
          </div>
        )}
        {step === 6 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-6 rounded-lg">
            <h1 className="text-red-500 text-9xl font-extrabold mb-4 animate-pulse">
              ¡Se te acabó el tiempo!
            </h1>
            <h2 className="text-white text-6xl font-bold italic">
              Sigue intentando, ¡la próxima vez lo lograrás!
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toques;