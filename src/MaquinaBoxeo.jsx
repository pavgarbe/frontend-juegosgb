import React, { useState, useEffect, useRef } from 'react';
import { useStoreCreditos } from './utils/useStore';
import Swal from "sweetalert2";
import API from './utils/API';
import io from "socket.io-client";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

const MaquinaBoxeo = () => {
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [contador, setContador] = useState(30);
  const [videoSrc, setVideoSrc] = useState("/video/BoxRockyEntrenandoMP414.mp4");
  const [mensajeChuscoActual, setMensajeChuscoActual] = useState("");
  const [mensajeDesafio, setMensajeDesafio] = useState("");
  const mensajeIntervalo = useRef(null);
  const { creditos, setCreditos } = useStoreCreditos();
  const creditosRef = useRef(creditos);
  const refPera = useRef(null);
  const refBoxIntervalo = useRef(null);

  const messages = [
    "¿Tienes lo que se necesita? ¡Demuestra tu fuerza!",
    "¡Solo los más fuertes se atreven!",
    "¡Golpea con todo tu poder!",
    "¿Eres más fuerte que un campeón?",
    "¡La máquina espera tu golpe!",
    "¡Dale con todo, no tengas miedo!",
    "¡Atrévete a ser el mejor!",
    "¿Puedes superar el récord?",
    "¡Vamos, muéstranos tu fuerza!",
    "¡Es tu turno, demuéstralo!",
    "¡Reta a tus amigos y gana!",
    "¡Hoy es tu día de gloria!",
    "¿Estás listo para la batalla?",
    "¡Haz que la máquina tiemble!",
    "¡Me vas a tener Miedo?!",
    "¡Estoy esperando a un hombre de verdad!",
    "¡Hay algun valiente o puras gallinas!",
    "¡Mucha gente y muy poca accion!"
  ];

  const mensajesChuscos = [
    "¡Pareces un peso pluma!", "¡Ese golpe ni mi abuela lo sintió!", "¡Eso no asusta ni a un mosquito!",
    "¡Dale con ganas, no con miedo!", "¿Eso fue un golpe o un caricia?", "¡Golpea como un verdadero campeón!",
    "¡Con más fuerza se abre una lata de frijoles!", "¡Ese golpe fue más suave que un peluche!", "¡Dale duro, no seas tímido!",
    "¡Así no vas a tumbar ni un muñeco de trapo!", "¡Necesitas más proteína en tu dieta!", "¡Eso fue un golpe o un susurro?",
    "¡Mi abuelita pega más fuerte!", "¡Así no ganas el campeonato!", "¡Esa fue una caricia boxística!",
    "¡Prueba otra vez, con más energía!", "¡¿Golpeaste con miedo o con hambre?!", "¡Eso fue un golpe o me pareció un bostezo?",
    "¡Más poder, menos duda!", "¡Parece que acariciaste la máquina !"
  ];

  useEffect(() => {
    getCreditos();
    refs.current[0]?.current?.focus();
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
    socket.on("fuerza", (response) => {
      if (response.data) {
        const fuerza = response.data;
        setScore(fuerza);
        clearInterval(refBoxIntervalo.current);
        setStep(4);
        setVideoSrc("/video/BoxAnimadoMP403.mp4");
        animarPuntaje(fuerza);
        setTimeout(() => {
          setStep(5);
          setVideoSrc("/video/BoxAnimadoMP406.mp4");
          setMensajeChuscoActual(mensajesChuscos[Math.floor(Math.random() * mensajesChuscos.length)]);

          setTimeout(() => {
            setStep(1);
            setVideoSrc("/video/BoxRockyEntrenandoMP414.mp4");
            setMensajeChuscoActual("");
            getCreditos();
          }, 9000);
        }, 10000);
      }
    })
    socket.on("pera", (response) => {
      clearInterval(refPera.current);
      initBox();
    })
    socket.on("creditos", (response) => {
      getCreditos();
    });
    return () => {
      socket.off("fuerza");
      socket.off("keypress");
      socket.off("pera");
    }
  }, []);

  useEffect(() => {
    creditosRef.current = creditos;
  }, [creditos]);

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setVideoSrc(prevSrc =>
          prevSrc === "/video/BoxRockyEntrenandoMP414.mp4"
                    ? "/video/BoxMikeTysonMp412.mp4"
                    : "/video/BoxRockyEntrenandoMP414.mp4"
          );
        }, 60000);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (videoSrc === "/video/BoxAnimadoMP406.mp4") {
      const videoElement = document.getElementById("video");
      const handleVideoEnd = () => {
        setStep(1);
        setVideoSrc("/video/BoxRockyEntrenandoMP414.mp4");
      };
      videoElement.addEventListener("ended", handleVideoEnd);
      return () => videoElement.removeEventListener("ended", handleVideoEnd);
    }
  }, [videoSrc]);

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

  const iniciarBoxeo = () => {
    if (creditosRef.current >= 10) {
      setStep(2);
      setVideoSrc("/video/BoxAnimadoMP418.mp4");
      iniciarSecuencia();
      // let tiempo = 7;
      // refPera.current = setInterval(() => {
      //   setContador2(tiempo);
      //   tiempo--;
      //   console.log(tiempo);
      //   if (tiempo === -2) {
      //     clearInterval(refPera.current);
      //     if (!peraRef.current) {
      //       initBox();
      //     }
      //   }
      // }, 1000);
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

  const initBox = () => {
      setVideoSrc("/video/BoxCaraACaraMP416.mp4");
      setStep(2);
      setContador(30);
      let tiempo = 30;
      refBoxIntervalo.current = setInterval(() => {
        tiempo--;
        setContador(tiempo);
        console.log(tiempo);
        if (tiempo === -2) {
          clearInterval(refBoxIntervalo.current);
          setStep(6);
          setVideoSrc("/video/BoxAnimadoMP406.mp4");
          setMensajeChuscoActual(mensajesChuscos[Math.floor(Math.random() * mensajesChuscos.length)]);
          setTimeout(() => {
            setStep(1);
            setVideoSrc("/video/BoxRockyEntrenandoMP414.mp4");
            setMensajeChuscoActual("");
            getCreditos();
          }, 6000);
        }
      }, 1000);
  };

  const animarPuntaje = (fuerza) => {
    setScore(0);
    let incremento = fuerza / (12 * 10);
    let contadorGolpe = 0;
    let iteraciones = 0;
    const maxIteraciones = 120;
    const intervaloGolpe = setInterval(() => {
        iteraciones++;
        contadorGolpe += incremento;
        setScore(Math.round(contadorGolpe));
        if (iteraciones >= maxIteraciones) {
            clearInterval(intervaloGolpe);
            setScore(fuerza);
        }
    }, 100);
    setTimeout(() => {
        clearInterval(intervaloGolpe);
        setScore(fuerza);
    }, 9100);
  };

  const getCreditos = async () => {
    await API.get("/juegosfuerza/creditos/")
      .then((response) => {
        setCreditos(response.data.total);
      })
      .catch((error) => {
        console.error("Error fetching credits:", error);
      });
  }

  const refs = useRef([React.createRef(), React.createRef()]);

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
      iniciarBoxeo();
    }
  };

  const returnHome = () => {
    window.location.href = import.meta.env.VITE_APP_MODO === "fuerza" ? "/" : "/juegos-fuerza";
  };

  const iniciarSecuencia = () => {
    API.get("/juegosfuerza/iniciar-juego", {
      params: {
        juego: "boxeo",
        creditos: 10
      }
    })
    .then((response) => {
      console.log("Juego iniciado correctamente");
    })
    .catch((error) => {
      console.error("Error al iniciar el juego:", error);
    });
    const creds = creditosRef.current - 10;
    useStoreCreditos.setState({ creditos: creds });
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
              <img src="/images/boxeo.jpeg" alt="Logo" className="absolute top-4 w-72 opacity-100" />
                <div className="flex flex-row items-center justify-center p-6 rounded-lg">
                  <button className="bg-green-500 text-white px-8 py-4 rounded mt-6 text-3xl font-bold mr-2" onClick={iniciarBoxeo} ref={refs.current[0]}>
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
            {videoSrc === "/video/BoxCaraACaraMP416.mp4" && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 p-6 rounded-lg">
              <h1 className="text-white text-9xl mt-8 mb-8 bg-black bg-opacity-50 p-4 rounded-lg">
                  Tiempo
              </h1>
              <h2 className="text-white text-9xl font-bold mb-4">
                  {contador}
              </h2>
              <h2 className="text-white text-5xl font-bold mb-4">
                  {mensajeDesafio}
              </h2>
            </div>
            )}
          </>
        )}

        {step === 4 && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 p-6 rounded-lg">
            <h1 className="text-yellow-400 text-8xl font-extrabold mb-4 animate-pulse">
            ¡Fuerza: {score}!
            </h1>
        </div>
        )}

         {step === 5 && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 p-6 rounded-lg">
                <audio id="audioSuspenso" autoPlay>
                    <source src="/audio/SonidoSuspensoExorcista.MP3" type="audio/mpeg" />
                </audio>

               <h1 className="text-yellow-400 text-8xl font-extrabold mb-4 animate-pulse">
                    ¡Tu fuerza fue: {score}!
                </h1>
                <h2 className="text-white text-5xl font-bold italic">
                    {mensajeChuscoActual}
                </h2>
            </div>
        )}
        {step === 6 && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 p-6 rounded-lg">
                <h1 className="text-yellow-400 text-8xl font-extrabold mb-4 animate-pulse">
                    ¡Se te acabo el tiempo!
                </h1>
                <h2 className="text-white text-5xl font-bold italic">
                    {mensajeChuscoActual}
                </h2>
            </div>
        )}

      </div>
    </div>
  );
};

export default MaquinaBoxeo;
