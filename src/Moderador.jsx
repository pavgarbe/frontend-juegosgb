import React, {useEffect, useState} from 'react'
import Swal from 'sweetalert2'
import API from "./utils/API";
import io from "socket.io-client";
import { useStore, useStoreRound } from "./utils/useStore";

const URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(URL);

export const Moderador = () => {

  const [type, setType] = useState("");
  const [points, setPoints] = useState("");

  const [cronometro, setCronometro] = useState(false);

  const [form, setForm] = useState({
    team1: "Equipo 1",
    team2: "Equipo 2",
  });

  const [game, setGame] = useState({
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
      question: "",
      responses: [],
      roundWinner: null,
      round: 0,
      errors: 0,
      terminada: false,
      robo: false,
      turno: ''
  });

  const juego = useStore((state) => state.game);
  const ronda = useStoreRound((state) => state.round);

  useEffect(() => {
    if (juego) {
      getGame();
    }

    if (ronda) {
      getRound();
    }
  }, []);

  useEffect(() => {
    socket.on("robo", (data) => {
      getGame();
      getRound();
    });

    socket.on("no_robo", (data) => {
      getGame();
      getRound();
    });

    socket.on("gana", (data) => {
      getGame();
      getRound();
    });
  }
  , []);

  const getRound = () => {
    API.post("/cienmexicanos/round/", {
        ronda: ronda,
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
    })
  }

  const getGame = () => {
    API.get("/cienmexicanos/start-game", {
      params: {
        juego: juego,
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
  }

  const getNewRound = (round) => {
    if (!type) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona una categoría',
      });
      return;
    }
    if (!points) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona tipo de ronda',
      });
      return;
    }

    API.get("/cienmexicanos/new-question", {
      params: {
        tipo: type,
        puntos: points,
        ronda: round,
        juego: juego,
      },
    })
    .then((res) => {
        useStoreRound.setState({ round: res.data.id });
        API.post("/cienmexicanos/round/", {
          ronda: res.data.id,
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
            tipo: res.data.tipo,
          });
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

  const startGame = () => {
    API.post("/cienmexicanos/start-game/", form)
      .then(async (response) => {
        useStore.setState({ game: response.data.juego});
        await API.get("/cienmexicanos/start-game", {
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
      })
      .catch((err) => {
        console.error(err);
      }
    );
  }

  const handleTimer = (start) => {
    if (start) {
      setCronometro(true);
      API.get("/cienmexicanos/timer", {
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
      API.get("/cienmexicanos/timer", {
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

  const handleTurno = (turno) => {
    API.post("/cienmexicanos/turno/", {
      turno: turno,
      ronda: ronda,
    })
    .then((res) => {
      getRound();
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const finishRound = () => {
    API.get("/cienmexicanos/round/finish")
      .then(async (res) => {
        setTimeout(() => {
          getGame();
          getRound();
        }
        , 500);
      })
      .catch((err) => {
        console.error(err);
      }
    );
  }


  return (
    console.log(actualRound),
    <div className="flex flex-col items-center w-full h-screen bg-[#ae3f91] text-white overflow-y-auto">
      <img src="/images/100mx.png" alt="Logo" className="w-60 mt-8" />
      {!game.gameStarted && (
      <div className="bg-opacity-60 p-6 rounded-lg text-center">
        <h1 className="text-5xl mb-4">Moderador</h1>
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
      {game.gameStarted && actualRound.round === 0 && (
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
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Categoría
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Casa">Casa</option>
              <option value="Deportes">Deportes</option>
              <option value="Historia">Historia</option>
              <option value="Lugares">Lugares</option>
              <option value="Música">Música</option>
              <option value="Situaciones">Situaciones</option>
              <option value="Cuerpo">Cuerpo</option>
              <option value="Animales">Animales</option>
              <option value="Películas">Películas</option>
              <option value="Artistas">Artistas</option>
              <option value="Deportistas">Deportistas</option>
              <option value="Personajes">Personajes</option>
              <option value="Profesiones">Profesiones</option>
              <option value="Super Héroes">Super Héroes</option>
              <option value="Objetos">Objetos</option>
              <option value="Comidas">Comidas</option>
              <option value="Actividades">Actividades</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewRound(1);
              }}
            >
              Iniciar Primera Ronda
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round === 1 && actualRound.roundWinner && (
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
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Categoría
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Casa">Casa</option>
              <option value="Deportes">Deportes</option>
              <option value="Historia">Historia</option>
              <option value="Lugares">Lugares</option>
              <option value="Música">Música</option>
              <option value="Situaciones">Situaciones</option>
              <option value="Cuerpo">Cuerpo</option>
              <option value="Animales">Animales</option>
              <option value="Películas">Películas</option>
              <option value="Artistas">Artistas</option>
              <option value="Deportistas">Deportistas</option>
              <option value="Personajes">Personajes</option>
              <option value="Profesiones">Profesiones</option>
              <option value="Super Héroes">Super Héroes</option>
              <option value="Objetos">Objetos</option>
              <option value="Comidas">Comidas</option>
              <option value="Actividades">Actividades</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewRound(2);
              }}
            >
              Iniciar Segunda Ronda
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round === 2 && actualRound.roundWinner && (
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
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Categoría
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Casa">Casa</option>
              <option value="Deportes">Deportes</option>
              <option value="Historia">Historia</option>
              <option value="Lugares">Lugares</option>
              <option value="Música">Música</option>
              <option value="Situaciones">Situaciones</option>
              <option value="Cuerpo">Cuerpo</option>
              <option value="Animales">Animales</option>
              <option value="Películas">Películas</option>
              <option value="Artistas">Artistas</option>
              <option value="Deportistas">Deportistas</option>
              <option value="Personajes">Personajes</option>
              <option value="Profesiones">Profesiones</option>
              <option value="Super Héroes">Super Héroes</option>
              <option value="Objetos">Objetos</option>
              <option value="Comidas">Comidas</option>
              <option value="Actividades">Actividades</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewRound(3);
              }}
            >
              Iniciar Tercera Ronda
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round === 3 && actualRound.roundWinner && (
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
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Categoría
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Casa">Casa</option>
              <option value="Deportes">Deportes</option>
              <option value="Historia">Historia</option>
              <option value="Lugares">Lugares</option>
              <option value="Música">Música</option>
              <option value="Situaciones">Situaciones</option>
              <option value="Cuerpo">Cuerpo</option>
              <option value="Animales">Animales</option>
              <option value="Películas">Películas</option>
              <option value="Artistas">Artistas</option>
              <option value="Deportistas">Deportistas</option>
              <option value="Personajes">Personajes</option>
              <option value="Profesiones">Profesiones</option>
              <option value="Super Héroes">Super Héroes</option>
              <option value="Objetos">Objetos</option>
              <option value="Comidas">Comidas</option>
              <option value="Actividades">Actividades</option>
            </select>
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewRound(4);
              }}
            >
              Iniciar Cuarta Ronda
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round === 1 && !actualRound.roundWinner && (
        <div className="flex flex-col items-center w-full p-8">
          <h2 className="text-3xl font-bold">Ronda {actualRound.round}</h2>
          <h1 className="text-4xl font-bold mt-6 text-center">{actualRound.question} </h1>
          <div className="mt-6 flex justify-between w-full">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 w-full"
              onClick={() => {
                API.post("/cienmexicanos/wrong-answer/", {
                  ronda: ronda,
                })
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.error(err);
                });
              }}
            >
              Respuesta Incorrecta
            </button>
            <div className="flex flex-col justify-between w-full">
              <label htmlFor="type" className="block text-2xl font-medium text-white mt-2 text-center">
                Turno
              </label>
              <select
                name="type"
                value={actualRound.turno}
                onChange={(e) => handleTurno(e.target.value)}
                className="mt-1 p-2 rounded-md w-full text-black"
              >
                <option value="">Selecciona un turno</option>
                <option value={game.team1Name}>{game.team1Name}</option>
                <option value={game.team2Name}>{game.team2Name}</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            {!cronometro ? (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(true)}
            >
              <i className="fas fa-clock"></i> Temporizador
            </button>
            ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(false)}
            >
              <i className="fas fa-clock"></i> Detener Temporizador
            </button>
            )}
          </div>
          <div className="mt-6 flex justify-between w-full">
            <h1 className="text-3xl">Respuestas</h1>
          </div>
          <div className="flex flex-col justify-between w-full mt-6">
            <div className="flex flex-col justify-between p-4 rounded-lg w-full h-96">
              {actualRound.responses.map((res, index) => (
                  <div className="flex flex-row justify-between" key={index}>
                    <div className="flex justify-between w-full">
                      <p className="text-2xl">{res.respuesta}</p>
                      <p className="text-2xl">{res.calificacion}</p>
                    </div>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
                      onClick={() => {
                        API.post("/cienmexicanos/correct-answer/", {
                          respuesta: res.id,
                          ronda: ronda,
                        })
                        .then((res) => {
                          console.log(res);
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                      }}
                    >
                      Mostrar
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => finishRound()}
            >
              Terminar Ronda
            </button>
          </div>
        </div>
      )}
      {game.gameStarted && actualRound.round === 2 && !actualRound.roundWinner && (
        <div className="flex flex-col items-center w-full p-8">
          <h2 className="text-3xl font-bold">Ronda {actualRound.round}</h2>
          <h1 className="text-4xl font-bold mt-6 text-center">{actualRound.question} </h1>
          <div className="mt-6 flex justify-between w-full">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 w-full"
              onClick={() => {
                API.post("/cienmexicanos/wrong-answer/", {
                  ronda: ronda,
                })
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.error(err);
                });
              }}
            >
              Respuesta Incorrecta
            </button>
            <div className="flex flex-col justify-between w-full">
              <label htmlFor="type" className="block text-2xl font-medium text-white mt-2 text-center">
                Turno
              </label>
              <select
                name="type"
                value={actualRound.turno}
                onChange={(e) => handleTurno(e.target.value)}
                className="mt-1 p-2 rounded-md w-full text-black"
              >
                <option value="">Selecciona un turno</option>
                <option value={game.team1Name}>{game.team1Name}</option>
                <option value={game.team2Name}>{game.team2Name}</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            {!cronometro ? (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(true)}
            >
              <i className="fas fa-clock"></i> Temporizador
            </button>
            ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(false)}
            >
              <i className="fas fa-clock"></i> Detener Temporizador
            </button>
            )}
          </div>
          <div className="mt-6 flex justify-between w-full">
            <h1 className="text-3xl">Respuestas</h1>
          </div>
          <div className="flex flex-col justify-between w-full mt-6">
            <div className="flex flex-col justify-between p-4 rounded-lg w-full h-96">
              {actualRound.responses.map((res, index) => (
                  <div className="flex flex-row justify-between" key={index}>
                    <div className="flex justify-between w-full">
                      <p className="text-2xl">{res.respuesta}</p>
                      <p className="text-2xl">{res.calificacion}</p>
                    </div>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
                      onClick={() => {
                        API.post("/cienmexicanos/correct-answer/", {
                          respuesta: res.id,
                          ronda: ronda,
                        })
                        .then((res) => {
                          console.log(res);
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                      }}
                    >
                      Mostrar
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => finishRound()}
            >
              Terminar Ronda
            </button>
          </div>
        </div>
      )}
      {game.gameStarted && actualRound.round === 3 && !actualRound.roundWinner && (
        <div className="flex flex-col items-center w-full p-8">
          <h2 className="text-3xl font-bold">Ronda {actualRound.round}</h2>
          <h1 className="text-4xl font-bold mt-6 text-center">{actualRound.question} </h1>
          <div className="mt-6 flex justify-between w-full">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 w-full"
              onClick={() => {
                API.post("/cienmexicanos/wrong-answer/", {
                  ronda: ronda,
                })
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.error(err);
                });
              }}
            >
              Respuesta Incorrecta
            </button>
            <div className="flex flex-col justify-between w-full">
              <label htmlFor="type" className="block text-2xl font-medium text-white mt-2 text-center">
                Turno
              </label>
              <select
                name="type"
                value={actualRound.turno}
                onChange={(e) => handleTurno(e.target.value)}
                className="mt-1 p-2 rounded-md w-full text-black"
              >
                <option value="">Selecciona un turno</option>
                <option value={game.team1Name}>{game.team1Name}</option>
                <option value={game.team2Name}>{game.team2Name}</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            {!cronometro ? (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(true)}
            >
              <i className="fas fa-clock"></i> Temporizador
            </button>
            ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(false)}
            >
              <i className="fas fa-clock"></i> Detener Temporizador
            </button>
            )}
          </div>
          <div className="mt-6 flex justify-between w-full">
            <h1 className="text-3xl">Respuestas</h1>
          </div>
          <div className="flex flex-col justify-between w-full mt-6">
            <div className="flex flex-col justify-between p-4 rounded-lg w-full h-96">
              {actualRound.responses.map((res, index) => (
                  <div className="flex flex-row justify-between" key={index}>
                    <div className="flex justify-between w-full">
                      <p className="text-2xl">{res.respuesta}</p>
                      <p className="text-2xl">{res.calificacion}</p>
                    </div>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
                      onClick={() => {
                        API.post("/cienmexicanos/correct-answer/", {
                          respuesta: res.id,
                          ronda: ronda,
                        })
                        .then((res) => {
                          console.log(res);
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                      }}
                    >
                      Mostrar
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => finishRound()}
            >
              Terminar Ronda
            </button>
          </div>
        </div>
      )}
      {game.gameStarted && actualRound.round === 4 && !actualRound.roundWinner && (
        <div className="flex flex-col items-center w-full p-8">
          <h2 className="text-3xl font-bold">Ronda {actualRound.round}</h2>
          <h1 className="text-4xl font-bold mt-6 text-center">{actualRound.question} </h1>
          <div className="mt-6 flex justify-between w-full">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 w-full"
              onClick={() => {
                API.post("/cienmexicanos/wrong-answer/", {
                  ronda: ronda,
                })
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.error(err);
                });
              }}
            >
              Respuesta Incorrecta
            </button>
            <div className="flex flex-col justify-between w-full">
              <label htmlFor="type" className="block text-2xl font-medium text-white mt-2 text-center">
                Turno
              </label>
              <select
                name="type"
                value={actualRound.turno}
                onChange={(e) => handleTurno(e.target.value)}
                className="mt-1 p-2 rounded-md w-full text-black"
              >
                <option value="">Selecciona un turno</option>
                <option value={game.team1Name}>{game.team1Name}</option>
                <option value={game.team2Name}>{game.team2Name}</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            {!cronometro ? (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(true)}
            >
              <i className="fas fa-clock"></i> Temporizador
            </button>
            ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => handleTimer(false)}
            >
              <i className="fas fa-clock"></i> Detener Temporizador
            </button>
            )}
          </div>
          <div className="mt-6 flex justify-between w-full">
            <h1 className="text-3xl">Respuestas</h1>
          </div>
          <div className="flex flex-col justify-between w-full mt-6">
            <div className="flex flex-col justify-between p-4 rounded-lg w-full h-96">
              {actualRound.responses.map((res, index) => (
                  <div className="flex flex-row justify-between" key={index}>
                    <div className="flex justify-between w-full">
                      <p className="text-2xl">{res.respuesta}</p>
                      <p className="text-2xl">{res.calificacion}</p>
                    </div>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
                      onClick={() => {
                        API.post("/cienmexicanos/correct-answer/", {
                          respuesta: res.id,
                          ronda: ronda,
                        })
                        .then((res) => {
                          console.log(res);
                        })
                        .catch((err) => {
                          console.error(err);
                        });
                      }}
                    >
                      Mostrar
                    </button>
                  </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full mt-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              onClick={() => {
                API.get("/cienmexicanos/finish-game")
                  .then(async (res) => {
                    setTimeout(() => {
                      getGame();
                      getRound();
                    }
                    , 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  }
                );
              }}
            >
              Terminar Ronda
            </button>
          </div>
        </div>
      )}
      {game.gameFinished && (
        <div className="p-6 rounded-lg text-center">
          <h1 className="text-5xl">Juego Terminado</h1>
          <h2 className="text-3xl mt-4">Ganador: {game.finalWinner}</h2>
          <button
            onClick={() => {
              API.get("/cienmexicanos/reset-game")
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
                    roundWinner: null,
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

export default Moderador;
