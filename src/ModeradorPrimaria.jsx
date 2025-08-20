import React, {useEffect, useState} from 'react'
import Swal from 'sweetalert2'
import API from "./utils/API";
import io from "socket.io-client";
import { useStore, useStoreRound, useStoreQuestion } from "./utils/useStore";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

export const ModeradorPrimaria = () => {

  const [type, setType] = useState("");
  const [materia, setMateria] = useState("");
  const [points, setPoints] = useState("");
  const [cronometro, setCronometro] = useState(false);
  const juego = useStore((state) => state.game);
  const ronda = useStoreRound((state) => state.round);
  const pregunta = useStoreQuestion((state) => state.question);

  const [form, setForm] = useState({
    team1: "Equipo 1",
    team2: "Equipo 2",
    rondaPreguntas: 2,
  });

  const [game, setGame] = useState({
      id: 0,
      team1Name: "Equipo 1",
      team2Name: "Equipo 2",
      gameStarted: false,
      gameFinished: false,
      team1Score: 0,
      team2Score: 0,
      finalWinner: null,
  });

  const [actualRound, setActualRound] = useState({
      id: 0,
      round: 0,
      tipo: "",
      terminada: false,
  });

  const [actualQuestion, setActualQuestion] = useState({
      id: 0,
      question: '',
      respuestas: [],
      equipo: '',
      ronda: 0,
      tipo: '',
      materia: '',
      grado: '',
      robo: false,
      equipo_robo: '',
      terminada: false,
    });

  useEffect(() => {
    if (juego) {
      getGame();
    }

    if (ronda) {
      getRound();
    }

    if (pregunta) {
      getQuestion();
    }

    socket.on("no-winner", (data) => {
      getGame();
      getRound();
      getQuestion();
    });
  }, []);

  const getRound = () => {
    API.get("/primaria/round/")
    .then((res) => {
      useStoreRound.setState({ round: res.data.id });
      setActualRound({
        id: res.data.id,
        round: res.data.ronda,
        tipo: res.data.tipo,
        terminada: res.data.terminada
      });
    })
    .catch((err) => {
      console.error(err);
    })
  }

  const getGame = () => {
    API.get("/primaria/start-game")
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
  }

  const getQuestion = () => {
    API.get("/primaria/question/")
    .then((res) => {
      setActualQuestion({
        id: res.data.id,
        question: res.data.pregunta,
        respuestas: res.data.respuestas,
        equipo: res.data.equipo,
        ronda: res.data.ronda,
        tipo: res.data.tipo,
        materia: res.data.materia,
        grado: res.data.grado,
        robo: res.data.robo,
        equipo_robo: res.data.equipo_robo,
        terminada: res.data.terminada,
      });
      useStoreQuestion.setState({ question: res.data.id });
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const getNewRound = (round) => {
    if (!points) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona tipo de ronda',
      });
      return;
    }
    API.post("/primaria/round/", {
        tipo: points,
        ronda: round,
    })
    .then((res) => {
        useStoreRound.setState({ round: res.data.id });
        API.get("/primaria/round/")
        .then((response) => {
          setActualRound({
            id: response.data.id,
            round: response.data.ronda,
            terminada: response.data.terminada,
            tipo: response.data.tipo,
          });
          setPoints("");
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      }
    );
  };

  const getNewQuestion = (round) => {
    if (!type) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona tipo de pregunta',
      });
      return;
    }
    if (!materia) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona materia',
      });
      return;
    }
    API.post("/primaria/question/", {
        tipo: type,
        materia: materia,
        ronda: round,
    })
    .then((res) => {
        useStoreQuestion.setState({ question: res.data.id });
        getQuestion();
        getRound();
        setType("");
        setMateria("");
      })
      .catch((err) => {
        console.error(err);
      }
    );
  };

  const startGame = () => {
    API.post("/primaria/start-game/", form)
      .then((response) => {
        useStore.setState({ game: response.data.id});
        setTimeout(() => {
          getGame();
        }
        , 1000);
      })
      .catch((err) => {
        console.error(err);
      }
    );
  }

  const handleTimer = (start) => {
    if (start) {
      setCronometro(true);
      API.get("/primaria/timer", {
        params: {
          start: true,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
    } else {
      setCronometro(false);
      API.get("/primaria/timer", {
        params: {
          start: false,
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
    }
  }


  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#239be0] text-white overflow-y-auto">
      <img src="/images/preguntas-primaria.png" alt="Logo" className="w-96 mt-8" />
      {!game.gameStarted && (
      <div className="bg-opacity-60 p-6 rounded-lg text-center">
        <h1 className="text-5xl mb-4">Moderador</h1>
        <label htmlFor="team1" className="block text-sm font-medium text-white mt-4">
          Numero de Preguntas por Ronda
        </label>
        <select
          name="rondaPreguntas"
          value={form.rondaPreguntas}
          onChange={(e) => setForm({ ...form, rondaPreguntas: parseInt(e.target.value) })}
          className="mt-2 p-2 rounded-md w-full text-black"
        >
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="6">6</option>
        </select>
        <label htmlFor="team1" className="block text-sm font-medium text-white mt-4">
          Nombre del Equipo 1
        </label>
        <input
          type="text"
          name="team1"
          value={form.team1}
          onChange={(e) => setForm({ ...form, team1: e.target.value })}
          className="mt-2 p-2 rounded-md w-full text-black"
        />
        <label htmlFor="team2" className="block text-sm font-medium text-white mt-4">
          Nombre del Equipo 2
        </label>
        <input
          type="text"
          name="team2"
          value={form.team2}
          onChange={(e) => setForm({ ...form, team2: e.target.value })}
          className="mt-2 p-2 rounded-md w-full text-black"
        />
        <button
          onClick={startGame}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8"
        >
          Iniciar Juego
        </button>
      </div>
      )}
      {game.gameStarted && actualRound.round === 0 && !game.finalWinner && (
        <div className="p-6 rounded-lg text-center">
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Tipo de Ronda
            </label>
            <select
              name="points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una tipo de ronda</option>
              <option value="Sencilla">Sencilla</option>
              <option value="Doble">Doble</option>
              <option value="Triple">Triple</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewRound(1);
              }}
            >
              Siguiente
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round > 0 && actualRound.terminada && !game.finalWinner && (
        <div className="p-6 rounded-lg text-center">
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Tipo de Ronda
            </label>
            <select
              name="points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una tipo de ronda</option>
              <option value="Sencilla">Sencilla</option>
              <option value="Doble">Doble</option>
              <option value="Triple">Triple</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewRound(actualRound.round + 1);
              }}
            >
              Siguiente
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round === 1 && !actualQuestion.question && !actualRound.terminada && !game.gameFinished && (
        <div className="p-6 rounded-lg text-center">
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Materia
            </label>
            <select
              name="materia"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una materia</option>
              <option value="Español">Español</option>
              <option value="Matematicas">Matematicas</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
              <option value="Historia">Historia</option>
              <option value="Geografia">Geografia</option>
              <option value="Ciencias Sociales">Ciencias Sociales</option>
              <option value="Artes">Artes</option>
            </select>
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Tipo
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona un tipo</option>
              <option value="Opciones">Opcion Multiple</option>
              <option value="Abierta">Abierta</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewQuestion(actualRound.round);
              }}
            >
              Ir a la Pregunta
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round > 0 && actualRound.round < 6 && actualQuestion.terminada && !actualRound.terminada && !game.gameFinished && (
          <div className="p-6 rounded-lg text-center">
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Materia
            </label>
            <select
              name="materia"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una materia</option>
              <option value="Español">Español</option>
              <option value="Matematicas">Matematicas</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
              <option value="Historia">Historia</option>
              <option value="Geografia">Geografia</option>
              <option value="Ciencias Sociales">Ciencias Sociales</option>
              <option value="Artes">Artes</option>
            </select>
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Tipo
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona un tipo</option>
              <option value="Opciones">Opcion Multiple</option>
              <option value="Abierta">Abierta</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewQuestion(actualRound.round);
              }}
            >
              Ir a la Pregunta
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round === 6 && actualQuestion.terminada && !actualRound.terminada && (
        <div className="p-6 rounded-lg text-center">
          <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
            Materia
          </label>
          <select
            name="materia"
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="mt-4 p-2 rounded-md w-full text-black text-2xl"
          >
            <option value="">Selecciona una materia</option>
            <option value="Español">Español</option>
            <option value="Matematicas">Matematicas</option>
            <option value="Ciencias Naturales">Ciencias Naturales</option>
            <option value="Historia">Historia</option>
            <option value="Geografia">Geografia</option>
            <option value="Artes">Artes</option>
          </select>
          <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
            Tipo
          </label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-4 p-2 rounded-md w-full text-black text-2xl"
          >
            <option value="">Selecciona un tipo</option>
            <option value="Opciones">Opcion Multiple</option>
            <option value="Abierta">Abierta</option>
          </select>
          <button
            className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
            onClick={() => {
              getNewQuestion(6);
            }}
          >
            Ir a la Pregunta
          </button>
        </div>
      )}
      {game.gameStarted && actualRound.round != 0 && actualQuestion.question && !actualRound.terminada && !actualQuestion.terminada && !game.gameFinished && (
        <div className="flex flex-col items-center w-full p-8 mb-32">
          <h2 className="text-3xl font-bold">Ronda {actualRound.round}</h2>
          <h1 className="text-4xl font-bold mt-6 text-center">¿{actualQuestion.question.slice(-1) === '?' ? actualQuestion.question : actualQuestion.question + '?'}</h1>
          <div className="flex flex-col w-full mt-2">
            {actualQuestion.tipo === "Abierta" && (
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded mt-4 w-full"
                onClick={() => {
                  API.get("/primaria/wrong-answer/", {
                    params: {
                    respuesta: actualQuestion.respuestas[0].respuesta,
                    }
                  })
                  .then((res) => {
                    getGame();
                    getRound();
                    getQuestion();
                  })
                  .catch((err) => {
                    console.error(err);
                  });
                }}
              >
                Respuesta Incorrecta
              </button>
            )}
          </div>
          <div className="flex flex-col w-full mt-2">
            {!cronometro ? (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold p-4 rounded mt-4 w-full"
              onClick={() => handleTimer(true)}
            >
              <i className="fas fa-clock"></i> Temporizador
            </button>
            ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded mt-4 w-full"
              onClick={() => handleTimer(false)}
            >
              <i className="fas fa-clock"></i> Detener/Reiniciar Temporizador
            </button>
            )}
          </div>
          <div className="mt-6 flex justify-center w-full">
            <h1 className="text-3xl font-bold">Respuestas</h1>
          </div>
          <div className="flex flex-col justify-between w-full mt-8 mb-32">
            <div className="flex flex-col justify-center p-4 rounded-lg w-full">
              {actualQuestion.question && actualQuestion.respuestas.map((res, index) => (
                  <div
                    className={`flex flex-col justify-center items-center p-2 rounded-lg w-full mb-2 ${res.correcta ? "bg-green-500" : "bg-red-500"}`}
                    key={index}
                    onClick={() => {
                      if (res.correcta) {
                        API.get("/primaria/correct-answer", {
                          params: {
                            respuesta: res.respuesta,
                          },
                        })
                        .then((res) => {
                          getGame();
                          getRound();
                          getQuestion();
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                      } else {
                        API.get("/primaria/wrong-answer/", {
                          params: {
                          respuesta: res.respuesta,
                          }
                        })
                        .then((res) => {
                          getGame();
                          getRound();
                          getQuestion();
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                      }
                    }}
                  >
                    <h1 className="text-4xl font-bold">{res.respuesta}</h1>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {game.finalWinner && (
        <div className="p-6 rounded-lg text-center">
          <h1 className="text-7xl">Juego Terminado</h1>
          <h2 className="text-4xl mt-4">Ganador: {game.finalWinner}</h2>
          <button
            onClick={() => {
              API.get("/primaria/reset-game")
                .then(async (res) => {
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
                    terminada: null,
                    round: 0,
                    errors: 0,
                    robo: false,
                    turno: '',
                  });
                })
                .catch((err) => {
                  console.error(err);
                }
              );
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8"
          >
           Terminar Juego
          </button>
        </div>
      )}
    </div>
  );
}

export default ModeradorPrimaria;
