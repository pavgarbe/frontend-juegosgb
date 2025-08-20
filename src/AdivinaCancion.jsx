import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import confetti from "canvas-confetti";
import { useStore, useStoreRound, useStoreCron, useStoreSong } from "./utils/useStore";
import Lottie from "lottie-react";
import Versus from './animations/versus.json';
import Turno from './animations/turno.json';
import Ganador from './animations/ganador.json';
import QRCode from "react-qr-code";
import API from "./utils/API";
import Swal from "sweetalert2";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const qrValue = `${window.location.origin}/moderador-adivina`;

const socket = io(URL);

const AdivinaCancion = () => {

  const { time, isRunning, start, stop, reset, increment } = useStoreCron();
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();
  const juego = useStore((state) => state.game);
  const ronda = useStoreRound((state) => state.round);
  const cancion = useStoreSong((state) => state.song);

  const [game, setGame] = useState({
    id: 0,
    team1Name: "Equipo 1",
    team2Name: "Equipo 2",
    gameStarted: false,
    gameFinished: false,
    team1Score: 0,
    team2Score: 0,
    finalWinner: null
  });

  const [actualRound, setActualRound] = useState({
    id: 0,
    round: 0,
    terminada: false,
    tipo: '',
    canciones: 0
  });

  const [actualSong, setActualSong] = useState({
    id: 0,
    cancion: '',
    artista: '',
    genero: '',
    audio: '',
    equipo: '',
    ronda: 0,
    tipo: '',
    robo: false,
    equipo_robo: '',
    terminada: false,
    ganador: '',
  });

  const playSound = (type) => {
    const audio = new Audio(`/audio/${type}.mp3`);
    audio
      .play()
      .then(() => {
        console.log("Playing sound");
      })
      .catch((err) => {
        console.error(err);
      });
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

    if (cancion) {
      getSong();
    }
  }, []);


  useEffect(() => {
    socket.on("iniciar_juego", (response) => {
        useStore.setState({ game: response.data.id });
        API.get("/adivinacancion/start-game")
        .then((res) => {
          setGame({
            id: res.data.id,
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

    socket.on("ronda", (response) => {
      useStoreRound.setState({ round: response.data.id });
      setActualRound({
        id: response.data.id,
        tipo: response.data.tipo,
        round: response.data.ronda,
        terminada: response.data.terminada,
      });
      setRevealed(false);
    });

    socket.on("respuesta_correcta", (response) => {
        if (!response.data.terminada) {
          playSound("correcto-primaria");
          setRevealed(true);
          Swal.fire({
            icon: 'success',
            title: 'Pregunta Terminada Ganador '+ response.data.ganador,
            text: response.data.cancion + ' - ' + response.data.artista + ' - ' + response.data.genero,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          confetti()
          playSound("ganador-primaria");
          setTimeout(() => {
            setRevealed(false);
            getSong();
            getRound();
            getGame();
          }, 6000);
        } else {
          playSound("correcto-primaria");
          setRevealed(true);
          Swal.fire({
            icon: 'success',
            title: 'Pregunta Terminada y fin de la ronda Ganador: '+ response.data.ganador,
            text: response.data.cancion + ' - ' + response.data.artista + ' - ' + response.data.genero,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          confetti()
          playSound("ganador-primaria");
          setTimeout(() => {
            setRevealed(false);
            getSong();
            getRound();
            getGame();
          }, 6000);
        }
    });

    socket.on("respuesta_incorrecta", (response) => {
      playSound("incorrecto");
      if (!response.data.terminada) {
        if (!response.data.p_terminada) {
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
          setTimeout(() => {
            getSong();
            getRound();
            getGame();
          }, 1000);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Pregunta Terminada Sin Ganador',
            text: actualRound.turno,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          playSound("no-ganador");
          setTimeout(() => {
            setRevealed(false);
            getSong();
            getRound();
            getGame();
          }, 6000);
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Ronda Terminada',
          text: 'Fin de la ronda',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        playSound("no-ganador");
        setTimeout(() => {
          setRevealed(false);
          getSong();
          getRound();
          getGame();
        }, 6000);
      }
    });

    socket.on("pregunta", (response) => {
      getSong();
      getRound();
      setRevealed(false);
    });

    socket.on("fin_pregunta", (response) => {
      setRevealed(false);
      getSong();
      getRound();
      getGame();
    });

    socket.on("inicio_cronometro", (response) => {
      start();
      console.log('Cronometro iniciado');
    })

    socket.on("fin_cronometro", (response) => {
      reset();
      console.log("Cronometro finalizado");
    });

    socket.on("turno", (response) => {
      useStoreRound.setState({ round: response.data.id });
      API.get("/adivinacancion/round/")
      .then((res) => {
        setActualRound({
          id: res.data.id,
          tipo: res.data.tipo,
          round: res.data.ronda,
          terminada: res.data.terminada,
          canciones: res.data.canciones,
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

    socket.on("play_audio", (response) => {
      playSong(response.data.audio);
    });

    socket.on("reset_game", (response) => {
        useStore.setState({ game: null });
        useStoreRound.setState({ round: null });
        setGame({
          id: 0,
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
          tipo: '',
          terminada: false,
          turno: '',
          canciones: 0,
        });
    });

  }, []);

  const getRound = () => {
    API.get("/adivinacancion/round/")
    .then((res) => {
      useStoreRound.setState({ round: res.data.id });
      setActualRound({
        id: res.data.id,
        round: res.data.ronda,
        terminada: res.data.terminada,
        tipo: res.data.tipo,
        canciones: res.data.canciones,
      });
    })
    .catch((err) => {
      console.error(err);
    });
  };

  const getGame = () => {
    API.get("/adivinacancion/start-game")
    .then((res) => {
      useStore.setState({ game: res.data.id });
      setGame({
        id: res.data.id,
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

  const getSong = () => {
      API.get("/adivinacancion/question/")
      .then((res) => {
        useStoreSong.setState({ song: res.data.id });
        setActualSong({
          id: res.data.id,
          cancion: res.data.cancion,
          artista: res.data.artista,
          genero: res.data.genero,
          audio: res.data.audio,
          equipo: res.data.equipo,
          ronda: res.data.ronda,
          tipo: res.data.tipo,
          robo: res.data.robo,
          equipo_robo: res.data.equipo_robo,
          terminada: res.data.terminada,
          ganador: res.data.ganador,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const roundError = () => {
    API.post("/adivinacancion/wrong-answer/", {
      ronda: ronda,
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
  };

  function changeString(str) {
    return str.split('').map(char => char === ' ' ? '  ' : '_ ').join(' ');
  }

  let currentAudio = null;

const playSong = (url) => {
  console.log(url);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(url);
  currentAudio
    .play()
    .then(() => {
      console.log(`Playing sound from ${url}`);
    })
    .catch((err) => {
      console.error("Error playing audio:", err);
    });

  setTimeout(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      console.log("Audio stopped");
      currentAudio = null;
    }
  }, 5000);
};


  return (
    <div className="h-screen w-full flex flex-col items-center bg-[#4d4e4f] text-white relative overflow-y-auto">
      {!game.gameStarted && (
        <div className="p-6 rounded-lg text-center h-screen w-full flex flex-col items-center justify-center">
          <img src="/images/adivinacancion.png" alt="Logo" className="w-96" />
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
      {game.gameStarted && actualRound.round > 0 && !actualRound.terminada && actualSong.cancion && !actualSong.terminada && (
        <div className="flex flex-col items-center w-full p-8">
          <div className="flex justify-evenly items-center w-full">
            <img src="/images/adivinacancion.png" alt="Logo" className="w-96" />
            <div className="flex flex-col justify-center items-center w-full space-x-4">
              <h2 className="text-6xl font-bold">Ronda {actualRound.round} - {actualRound.tipo === "Doble" ? "Puntos Dobles" : actualRound.tipo === "Triple" ? "Puntos Triples" : "Puntos Sencillos"}</h2>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center rounded-lg w-full">
            {actualSong.cancion && revealed ? (
              <div className="flex flex-col items-center justify-center w-full">
                <h2 className="text-4xl font-bold mt-4 text-center">{actualSong.cancion}</h2>
                <h2 className="text-4xl font-bold mt-4 text-center">{actualSong.artista}</h2>
                <h2 className="text-4xl font-bold mt-4 text-center">{actualSong.genero}</h2>
              </div>
            ) : (
              <h2 className="text-5xl font-bold mt-4 text-center whitespace-pre-wrap">{changeString(actualSong.cancion)}</h2>
            )}
          </div>
          <div className="flex flex-row justify-between w-full mt-12">
            <div className="flex flex-col justify-center items-center w-full">
              {actualSong.robo ? (
                actualSong.equipo_robo === game.team1Name ? (
                  <Lottie animationData={Turno} style={{ width: 100, height: 100 }} />
                ) : (
                  <div className="mt-[100px]"></div>
                )
              ) : (
                actualSong.equipo === game.team1Name ? (
                  <Lottie animationData={Turno} style={{ width: 100, height: 100 }} />
                ) : (
                  <div className="mt-[100px]"></div>
                )
              )}
              <div className="flex flex-col items-center justify-center w-5/6 bg-blue-500 p-4 rounded-lg">
                <h2 className="text-4xl font-bold">{game.team1Name}</h2>
                <h2 className="text-6xl font-bold mt-2">{game.team1Score}</h2>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              {actualSong.robo ? (
                actualSong.equipo_robo === game.team2Name ? (
                  <Lottie animationData={Turno} style={{ width: 100, height: 100 }} />
                ) : (
                  <div className="mt-[100px]"></div>
                )
              ) : (
                actualSong.equipo === game.team2Name ? (
                  <Lottie animationData={Turno} style={{ width: 100, height: 100 }} />
                ) : (
                  <div className="mt-[100px]"></div>
                )
              )}
              <div className="flex flex-col items-center justify-center w-5/6 bg-yellow-500 p-4 rounded-lg">
                <h2 className="text-4xl font-bold">{game.team2Name}</h2>
                <h2 className="text-6xl font-bold mt-2">{game.team2Score}</h2>
              </div>
            </div>
          </div>
          <div className="flex justify-between w-full mt-4">
            <div className="flex flex-col items-center justify-center w-1/2 bg-gray-600 p-4 rounded-lg ml-4">
              <label className="text-5xl font-bold">{ actualRound.terminada ? 'Ganador' : actualSong.robo ? 'Robo de puntos' : actualSong.equipo ? 'En turno' : 'Esperando...' }</label>
              <h2 className="text-7xl font-bold">{actualSong.robo ? actualSong.equipo_robo : actualSong.equipo}</h2>
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 bg-gray-600 p-4 rounded-lg ml-4">
              <label className="text-5xl font-bold">Tiempo </label>
              <h2 className="text-8xl font-bold">{time}</h2>
            </div>
          </div>
        </div>
      )}

      {game.gameStarted && actualRound.round === 0 && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/adivinacancion.png" alt="Logo" className="w-96 mt-8" />
          <h1 className="text-8xl font-bold mt-4 text-center">Preparense para la primera ronda</h1>
          <div className="flex flex-row items-center justify-center w-full mt-16">
            <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg">
              <label className="text-6xl font-bold">{game.team1Name}</label>
              <h2 className="text-8xl font-bold mt-2">{game.team1Score}</h2>
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
              <Lottie animationData={Versus} style={{ width: 300, height: 300, marginTop: 20 }} />
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
              <label className="text-6xl font-bold">{game.team2Name}</label>
              <h1 className="text-8xl font-bold mt-2">{game.team2Score}</h1>
            </div>
          </div>
        </div>
      )}

      {game.gameStarted && actualRound.round > 0 && actualRound.terminada && !game.finalWinner && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/adivinacancion.png" alt="Logo" className="w-96 mt-8" />
          <h1 className="text-8xl font-bold mt-4 text-center">Preparense para la siguiente ronda</h1>
          <div className="flex flex-row items-center justify-center w-full mt-16">
            <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg">
              {actualSong.ganador === game.team1Name ? (
                <Lottie animationData={Ganador} style={{ width: 100, height: 100 }} />
              ) : (
                <div className="mt-[100px]"></div>
              )}
              <label className="text-6xl font-bold">{game.team1Name}</label>
              <h2 className="text-8xl font-bold mt-2">{game.team1Score}</h2>
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
              <Lottie animationData={Versus} style={{ width: 300, height: 300, marginTop: 20 }} />
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
              {actualSong.ganador === game.team2Name ? (
                <Lottie animationData={Ganador} style={{ width: 100, height: 100 }} />
              ) : (
                <div className="mt-[100px]"></div>
              )}
              <label className="text-6xl font-bold">{game.team2Name}</label>
              <h1 className="text-8xl font-bold mt-2">{game.team2Score}</h1>
            </div>
          </div>
        </div>
      )}

      {game.gameStarted && actualRound.round === 1 && !actualRound.terminada && !actualSong.cancion && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/adivinacancion.png" alt="Logo" className="w-96 mt-8" />
          <h2 className="text-4xl font-bold mt-4 text-center">Ronda {actualRound.round} - {actualRound.tipo === "Doble" ? "Puntos Dobles" : actualRound.tipo === "Triple" ? "Puntos Triples" : "Puntos Sencillos"}</h2>
          <h1 className="text-8xl font-bold mt-8 text-center">Esperando la canción...</h1>
          <div className="flex flex-row items-center justify-center w-full mt-16">
            <div className="flex flex-row items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg">
                <label className="text-6xl font-bold">{game.team1Name}</label>
                <h2 className="text-8xl font-bold mt-2">{game.team1Score}</h2>
              </div>
              <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
                <Lottie animationData={Versus} style={{ width: 300, height: 300, marginTop: 20 }} />
              </div>
              <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
                <label className="text-6xl font-bold">{game.team2Name}</label>
                <h1 className="text-8xl font-bold mt-2">{game.team2Score}</h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {game.gameStarted && actualRound.round > 0 && !actualRound.terminada && actualSong.terminada && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/adivinacancion.png" alt="Logo" className="w-96 mt-8" />
          <h2 className="text-4xl font-bold mt-4 text-center">Ronda {actualRound.round} - {actualRound.tipo === "Doble" ? "Puntos Dobles" : actualRound.tipo === "Triple" ? "Puntos Triples" : "Puntos Sencillos"}</h2>
          <h1 className="text-8xl font-bold mt-4 text-center">Esperando canción...</h1>
          <div className="flex flex-row items-center justify-center w-full mt-16">
            <div className="flex flex-row items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg">
                {actualSong.ganador === game.team1Name ? (
                  <Lottie animationData={Ganador} style={{ width: 100, height: 100 }} />
                ) : (
                  <div className="mt-[100px]"></div>
                )}
                <label className="text-6xl font-bold">{game.team1Name}</label>
                <h2 className="text-8xl font-bold mt-2">{game.team1Score}</h2>
              </div>
              <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
                <Lottie animationData={Versus} style={{ width: 300, height: 300, marginTop: 20 }} />
              </div>
              <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
                {actualSong.ganador === game.team2Name ? (
                  <Lottie animationData={Ganador} style={{ width: 100, height: 100 }} />
                ) : (
                  <div className="mt-[100px]"></div>
                )}
                <label className="text-6xl font-bold">{game.team2Name}</label>
                <h1 className="text-8xl font-bold mt-2">{game.team2Score}</h1>
              </div>
            </div>
          </div>
        </div>
      )}


      {game.finalWinner && (
        <div className="flex flex-col items-center justify-center w-full p-8">
          <img src="/images/adivinacancion.png" alt="Logo" className="w-96 mt-8" />
          <h1 className="text-8xl font-bold mt-24">Ganador del juego</h1>
          <div className="flex flex-col items-center justify-center w-1/2 p-4 rounded-lg mt-4">
                {game.finalWinner === game.team1Name ? (
                  <>
                    <Lottie animationData={Ganador} style={{ width: 100, height: 100 }} />
                    <label className="text-6xl font-bold">{game.team1Name}</label>
                    <h1 className="text-8xl font-bold mt-2">{game.team1Score}</h1>
                  </>
                ) : (
                  <>
                    <Lottie animationData={Ganador} style={{ width: 100, height: 100 }} />
                    <label className="text-6xl font-bold">{game.team2Name}</label>
                    <h1 className="text-8xl font-bold mt-2">{game.team2Score} puntos</h1>
                  </>
                )}
          </div>
          <h2 className="text-8xl font-bold mt-6">¡Felicidades!</h2>
        </div>
      )}
    </div>
  );
}

export default AdivinaCancion;
