import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import confetti from "canvas-confetti";
import { useStore, useStoreRound, useStoreCron } from "./utils/useStore";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import Waiting from './animations/waiting.json';
import QRCode from "react-qr-code";
import API from "./utils/API";
import Swal from "sweetalert2";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const qrValue = `${window.location.origin}/moderador`;

const socket = io(URL);

const CienMexicanos = () => {
  const [revealed, setRevealed] = useState([]);
  const navigate = useNavigate();
  const juego = useStore((state) => state.game);
  const ronda = useStoreRound((state) => state.round);
  let puntaje = 0;
  let revealed2 = 0;
  const [puntaje2, setPuntaje2] = useState(0);
  const [game, setGame] = useState({
    team1Name: "Equipo 1",
    team2Name: "Equipo 2",
    gameStarted: false,
    gameFinished: false,
    team1Score: 0,
    team2Score: 0,
    finalWinner: null,
  });
  const { time, isRunning, start, stop, reset, increment } = useStoreCron();

  const [actualRound, setActualRound] = useState({
    id: 0,
    question: "",
    responses: [],
    roundWinner: null,
    round: 0,
    errors: 0,
    robo: false,
    terminada: false,
    turno: '',
    tipo: '',
  });

  let currentAudio = null;

  const playSound = (type) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(`/audio/${type}.mp3`);
    currentAudio
      .play()
      .then(() => {
        console.log("Playing sound");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const stopSound = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  };

  const myInterval = useRef();

  useEffect(() => {
    if (isRunning) {
      if (time === 15) {
        myInterval.current  = setInterval(increment, 1000);
      }
    }  else {
      clearInterval(myInterval.current);
      myInterval.current = null;
    }
  }, [isRunning]);

  useEffect(() => {
    if (time === 0) {
      stop();
      roundError();
      stopSound();
    }
  }
  , [time]);

  useEffect(() => {
    if (juego) {
      getGame()
    }

    if (ronda) {
      getRound();
    }
  }, []);


  useEffect(() => {
    socket.on("iniciar_juego", (response) => {
        useStore.setState({ game: response.data.juego });
        API.get("/cienmexicanos/start-game", {
          params: {
            juego: response.data.juego,
          },
        })
        .then((res) => {
          setGame({
            ...game,
            team1Name: res.data.team1,
            team2Name: res.data.team2,
            gameStarted: res.data.game_started,
            gameFinished: res.data.game_finished,
            team1Score: res.data.team1_score,
            team2Score: res.data.team2_score,
            finalWinner: res.data.ganador,
          })
        })
        .catch((err) => {
          console.error(err);
        });
    });

    socket.on("ronda_1", (response) => {
      useStoreRound.setState({ round: response.data.id });
      setActualRound({
        id: response.data.id,
        question: response.data.pregunta,
        responses: response.data.respuestas,
        round: response.data.ronda,
        errors: response.data.errores,
        robo: response.data.robo,
        turno: response.data.turno,
        terminada: response.data.terminada,
        roundWinner: response.data.ganador,
        tipo: response.data.tipo,
      });
      setRevealed([]);
    });

    socket.on("ronda_2", (response) => {
      useStoreRound.setState({ round: response.data.id });
      setActualRound({
        id: response.data.id,
        question: response.data.pregunta,
        responses: response.data.respuestas,
        round: response.data.ronda,
        errors: response.data.errores,
        robo: response.data.robo,
        turno: response.data.turno,
        roundWinner: response.data.ganador,
        tipo: response.data.tipo,
      });
      setRevealed([]);
    });

    socket.on("ronda_3", (response) => {
      useStoreRound.setState({ round: response.data.id });
      setActualRound({
        id: response.data.id,
        question: response.data.pregunta,
        responses: response.data.respuestas,
        round: response.data.ronda,
        errors: response.data.errores,
        robo: response.data.robo,
        turno: response.data.turno,
        roundWinner: response.data.ganador,
        tipo: response.data.tipo,
      });
      setRevealed([]);
    });

    socket.on("ronda_4", (response) => {
      useStoreRound.setState({ round: response.data.id });
      setActualRound({
        id: response.data.id,
        question: response.data.pregunta,
        responses: response.data.respuestas,
        round: response.data.ronda,
        errors: response.data.errores,
        robo: response.data.robo,
        turno: response.data.turno,
        roundWinner: response.data.ganador,
        tipo: response.data.tipo,
      });
      setRevealed([]);
    });

    socket.on("respuesta_correcta", (response) => {
      revealAnswer(response.data.id);
      if (!response.data.terminada) {
        puntaje = puntaje + (response.data.tipo === "Triple" ? response.data.calificacion * 3 : response.data.tipo === "Doble" ? response.data.calificacion * 2 : response.data.calificacion);
        setPuntaje2((prev) => prev + (response.data.tipo === "Triple" ? response.data.calificacion * 3 : response.data.tipo === "Doble" ? response.data.calificacion * 2 : response.data.calificacion));
        if (response.data.robo) {
          try {
            API.post("/cienmexicanos/round/robo/", { puntos: puntaje })
              .then(() => {
                setTimeout(() => {
                  getRound();
                  getGame();
                  playSound("gana");
                  confetti();
                  setPuntaje2(0);
                  puntaje = 0;
                }, 1000);
              })
              .catch((err) => console.error("Error en API:", err));
          } catch (error) {
            console.error("Error en solicitud de robo:", error);
          }
        } else if (revealed2 === 5) {
            try {
              API.post("/cienmexicanos/round/gana/", { puntos: puntaje })
              .then(() => {
                setTimeout(() => {
                  getRound();
                  getGame();
                  playSound("gana");
                  confetti();
                  setPuntaje2(0);
                  puntaje = 0;
                }
                , 1000);
              })
              .catch((err) => {
                console.error(err);
              });
            } catch (error) {
              console.error("Error al finalizar ronda:", error);
            }
        }
      }
    });

    socket.on("respuesta_incorrecta", (response) => {
      playSound("incorrecto");

      if (!response.data.turno) return;

      if (response.data.terminada) return;

      if (response.data.robo) {
        try {
          API.post("/cienmexicanos/round/no-robo/", { puntos: puntaje })
            .then(() => {
              setTimeout(() => {
                getRound();
                getGame();
                playSound("gana");
                confetti();
                setPuntaje2(0);
                puntaje = 0;
              }, 1000);
            })
            .catch((err) => console.error("Error en API:", err));
        } catch (error) {
          console.error("Error en solicitud de no-robo:", error);
        }
      } else {
        getRound();
      }
    });

    socket.on("inicio_cronometro", (response) => {
      start();
      console.log('Cronometro iniciado');
      playSound('reloj-100');
    })

    socket.on("fin_cronometro", (response) => {
      reset();
      console.log("Cronometro finalizado");
      stopSound();
    });

    socket.on("turno", (response) => {
      useStoreRound.setState({ round: response.data.id });
      API.post("/cienmexicanos/round/", {
        ronda: response.data.id,
      })
      .then((res) => {
        setActualRound({
          ...actualRound,
          id: res.data.id,
          question: res.data.pregunta,
          responses: res.data.respuestas,
          roundWinner: res.data.ganador,
          round: res.data.ronda,
          errors: res.data.errores,
          robo: res.data.robo,
          turno: res.data.turno,
          terminada: res.data.terminada,
        });
      })
      .catch((err) => {
        console.error(err);
      });
      if (response.data.robo) {
        Swal.fire({
          icon: 'warning',
          title: 'Robo de Puntos',
          text: actualRound.turno,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    });

    socket.on("fin_ronda", (response) => {
      getGame();
      getRound();
    });

    socket.on("fin_juego", (response) => {
      getGame();
      getRound();
    });

    socket.on("reset_game", (response) => {
                useStore.setState({ game: null });
                useStoreRound.setState({ round: null });
                  setGame({
                    team1Name: "Equipo 1",
                    team2Name: "Equipo 2",
                    gameStarted: false,
                    gameFinished: false,
                    team1Score: 0,
                    team2Score: 0,
                    finalWinner: null,
                  });
                  setActualRound({
                    id: 0,
                    question: "",
                    responses: [],
                    roundWinner: null,
                    round: 0,
                    errors: 0,
                    robo: false,
                    turno: '',
                  });
    });

  }, []);

  const getRound = () => {
    API.post("/cienmexicanos/round/", {
      ronda: actualRound.id,
    })
    .then((res) => {
      useStoreRound.setState({ round: res.data.id });
      setActualRound({
        id: res.data.id,
        question: res.data.pregunta,
        responses: res.data.respuestas,
        round: res.data.ronda,
        errors: res.data.errores,
        robo: res.data.robo,
        turno: res.data.turno,
        roundWinner: res.data.ganador,
        terminada: res.data.terminada,
        tipo: res.data.tipo,
      });
    })
    .catch((err) => {
      console.error(err);
    });
  };

  const getGame = () => {
    API.get("/cienmexicanos/start-game", {
      params: {
        juego: juego,
      },
    })
    .then((res) => {
      setGame({
        team1Name: res.data.team1,
        team2Name: res.data.team2,
        gameStarted: res.data.game_started,
        gameFinished: res.data.game_finished,
        team1Score: res.data.team1_score,
        team2Score: res.data.team2_score,
        finalWinner: res.data.ganador,
      })
    })
    .catch((err) => {
      console.error(err);
    });
  };

  const roundError = () => {
    API.post("/cienmexicanos/wrong-answer/", {
      ronda: ronda,
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
  };

  const revealAnswer = (index) => {
    setRevealed((prev) => [...prev, index]);
    revealed2 = revealed2 + 1;
    playSound('correcto');
  };

  return (
    console.log(actualRound),
    <div className="h-screen w-full flex flex-col items-center bg-[#ae3f91] text-white relative overflow-y-auto">
      {!game.gameStarted && (
        <div className="p-6 rounded-lg text-center h-screen w-full flex flex-col items-center justify-center">
          <img src="/images/100mx.png" alt="Logo" className="w-60" />
          <h1 className="text-4xl mb-4">Esperando la conexión del moderador...</h1>
          <p className="text-2xl">Accede al siguiente QR para iniciar el juego.</p>
          <div className="mt-4 flex justify-center items-center">
            <QRCode value={qrValue} size={200} />
          </div>
          <button
            className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
            onClick={() => navigate(import.meta.env.VITE_APP_MODO === "full" ? "/super-trivia" : "/")}
          >
            Regresar al Menú
          </button>
        </div>
      )}
      {game.gameStarted && actualRound.round !== 0 && !actualRound.roundWinner && (
        <div className="flex flex-col items-center w-full p-8">
          <div className="flex justify-evenly items-center w-full">
            <img src="/images/100mx.png" alt="Logo" className="w-60" />
            <div className="flex flex-col justify-center items-center w-full space-x-4">
              <h2 className="text-4xl font-bold">Ronda {actualRound.round}</h2>
              <h1 className="text-5xl font-bold mt-6 text-center">{actualRound.turno ? actualRound.question : "Esperando pregunta..."}</h1>
            </div>
            <img src="/images/100mx.png" alt="Logo" className="w-60" />
          </div>
          <div className="mt-6 flex justify-between w-full">
            <div className="text-center">
              <h3 className="text-4xl">{game.team1Name}</h3>
              <h2 className="text-center bg-black p-4 rounded-lg text-5xl font-bold mt-2">{game.team1Score} </h2>
            </div>
            <div className="text-center">
              <h3 className="text-4xl">Puntos {actualRound.tipo === "Doble" ? "Dobles" : actualRound.tipo === "Triple" ? "Triples" : ""}</h3>
              <h2 className="text-center bg-black p-4 rounded-lg text-5xl font-bold mt-2">{puntaje2}</h2>
            </div>
            <div className="text-center">
              <h3 className="text-4xl">{game.team2Name}</h3>
              <h2 className="text-center bg-black p-4 rounded-lg text-5xl font-bold mt-2">{game.team2Score} </h2>
            </div>
          </div>
          <div className="flex flex-col justify-between w-full mt-4">
            <div className="flex flex-col justify-center items-center bg-black p-4 rounded-lg w-full">
            {actualRound.responses.map((res, index) => (
                <motion.div
                  key={index}
                  className="flex justify-between w-full mb-2 p-4 bg-gray-800 text-white rounded-lg cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealed.includes(res.id) ? 1 : 0.2 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-4xl">{revealed.includes(res.id) ? res.respuesta : "- - -"}</p>
                  <p className="text-4xl">{revealed.includes(res.id) ? res.calificacion : "-"}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex justify-between w-full mt-4">
            <div className="flex justify-center p-4 rounded-lg w-1/3 bg-black">
              {actualRound.errors === 1 ? (
                <>
                  <p className="text-9xl font-bold text-red-500 text-center">X</p>
                  <p className="text-9xl font-bold text-gray-900 text-center ml-4">X</p>
                  <p className="text-9xl font-bold text-gray-900 text-center ml-4">X</p>
                </>
              ) : actualRound.errors === 2 ? (
                <>
                  <p className="text-9xl font-bold text-red-500 text-center">X</p>
                  <p className="text-9xl font-bold text-red-500 text-center ml-4">X</p>
                  <p className="text-9xl font-bold text-gray-900 text-center ml-4">X</p>
                </>
              ) : actualRound.errors === 3 ? (
                <>
                  <p className="text-9xl font-bold text-red-500 text-center">X</p>
                  <p className="text-9xl font-bold text-red-500 text-center ml-4">X</p>
                  <p className="text-9xl font-bold text-red-500 text-center ml-4">X</p>
                </>
              ) : (
                <>
                  <p className="text-9xl font-bold text-gray-900 text-center">X</p>
                  <p className="text-9xl font-bold text-gray-900 text-center ml-4">X</p>
                  <p className="text-9xl font-bold text-gray-900 text-center ml-4">X</p>
                </>
              )}
            </div>
            <div className="flex flex-col items-center justify-center w-1/3 bg-black p-4 rounded-lg ml-4">
              <label className="text-4xl font-bold">{ actualRound.terminada ? 'Ganador' : actualRound.robo ? 'Robo de puntos' : actualRound.turno ? 'En turno' : 'Esperando...' }</label>
              <h2 className="text-4xl font-bold">{actualRound.turno}</h2>
            </div>
            <div className="flex flex-row items-center justify-center w-1/3 bg-black p-4 rounded-lg ml-4">
              <label className="text-4xl font-bold">Tiempo </label>
              <h2 className="text-8xl font-bold ml-4">{time}</h2>
            </div>
          </div>
          <audio src="/audio/ajugar.mp3" autoPlay />
        </div>
      )}

      {game.gameStarted && actualRound.round === 0 && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/100mx.png" alt="Logo" className="w-60 mt-8" />
          <h1 className="text-4xl font-bold mt-4">A punto de comenzar...</h1>
          <h2 className="text-5xl font-bold mt-6">¿Todos listos para la primera ronda?</h2>
          <Lottie animationData={Waiting} style={{ width: 400, height: 400, marginTop: 20 }} />
          <audio src="/audio/entrada.mp3" autoPlay loop />
        </div>
      )}

      {game.gameStarted && actualRound.round === 1 && actualRound.roundWinner && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/100mx.png" alt="Logo" className="w-60 mt-8" />
          <h1 className="text-4xl font-bold mt-4">A punto de comenzar...</h1>
          <h2 className="text-5xl font-bold mt-6">¿Todos listos para la segunda ronda?</h2>
          <Lottie animationData={Waiting} style={{ width: 400, height: 400, marginTop: 20 }} />
          <audio src="/audio/entrada.mp3" autoPlay loop />
        </div>
      )}

{     game.gameStarted && actualRound.round === 2 && actualRound.roundWinner && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/100mx.png" alt="Logo" className="w-60 mt-8" />
          <h1 className="text-4xl font-bold mt-4">A punto de comenzar...</h1>
          <h2 className="text-5xl font-bold mt-6">¿Todos listos para la tercera ronda?</h2>
          <Lottie animationData={Waiting} style={{ width: 400, height: 400, marginTop: 20 }} />
          <audio src="/audio/entrada.mp3" autoPlay loop />
        </div>
      )}

      {game.gameStarted && actualRound.round === 3 && actualRound.roundWinner && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/100mx.png" alt="Logo" className="w-60 mt-8" />
          <h1 className="text-4xl font-bold mt-4">A punto de comenzar...</h1>
          <h2 className="text-5xl font-bold mt-6">¿Todos listos para la cuarta ronda?</h2>
          <Lottie animationData={Waiting} style={{ width: 400, height: 400, marginTop: 20 }} />
          <audio src="/audio/entrada.mp3" autoPlay loop />
        </div>
      )}

      {actualRound.roundWinner && actualRound.round !== 4 && (
        <div className="relative flex flex-col items-center justify-center">
          <p className="text-5xl text-white font-bold">Ganador de la ronda {actualRound.round}</p>
          <p className="text-6xl text-white font-bold">{actualRound.roundWinner}</p>
        </div>
      )}

      {game.finalWinner && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/100mx.png" alt="Logo" className="w-60 mt-8" />
          <h1 className="text-7xl font-bold mt-24">Ganador del juego: {game.finalWinner}</h1>
          <h2 className="text-8xl font-bold mt-6">¡Felicidades!</h2>
          <audio src="/audio/entrada.mp3" autoPlay loop />
        </div>
      )}
    </div>
  );
}

export default CienMexicanos;