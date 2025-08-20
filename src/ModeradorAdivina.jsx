import React, {useEffect, useState} from 'react'
import Swal from 'sweetalert2'
import API from "./utils/API";
import io from "socket.io-client";
import { useStore, useStoreRound, useStoreSong } from "./utils/useStore";

export const ModeradorAdivina = () => {

  const URL = import.meta.env.VITE_APP_SOCKET_URL;

  const socket = io(URL);

  const [points, setPoints] = useState("");
  const [cronometro, setCronometro] = useState(false);
  const [artistas, setArtistas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [musicForm, setMusicForm] = useState({
    artista: "",
    genero: ""
  });
  const juego = useStore((state) => state.game);
  const ronda = useStoreRound((state) => state.round);
  const cancion = useStoreSong((state) => state.song);

  const [form, setForm] = useState({
    team1: "Equipo 1",
    team2: "Equipo 2",
    rondas: 1,
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
      canciones: 0
  });

  const [actualSong, setActualSong] = useState({
      id: 0,
      cancion: '',
      genero: '',
      artista: '',
      audio: '',
      equipo: '',
      ronda: 0,
      tipo: '',
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

    if (cancion) {
      getSong();
    }
    getGeneros();
  }, []);

  const getGeneros = () => {
    API.get("/adivinacancion/generos/")
    .then((res) => {
      setGeneros(res.data);
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const getArtistas = (genero) => {
    API.get("/adivinacancion/artistas/", {
      params: {
        genero: genero,
      }
    })
    .then((res) => {
      setArtistas(res.data);
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const getRound = () => {
    API.get("/adivinacancion/round/")
    .then((res) => {
      useStoreRound.setState({ round: res.data.id });
      setActualRound({
        id: res.data.id,
        round: res.data.ronda,
        tipo: res.data.tipo,
        terminada: res.data.terminada,
        canciones: res.data.canciones
      });
    })
    .catch((err) => {
      console.error(err);
    })
  }

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
  }

  const getSong = () => {
    API.get("/adivinacancion/question/")
    .then((res) => {
      setActualSong({
        id: res.data.id,
        cancion: res.data.cancion,
        genero: res.data.genero,
        artista: res.data.artista,
        audio: res.data.audio,
        equipo: res.data.equipo,
        ronda: res.data.ronda,
        tipo: res.data.tipo,
        robo: res.data.robo,
        equipo_robo: res.data.equipo_robo,
        terminada: res.data.terminada,
      });
      useStoreSong.setState({ song: res.data.id });
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
    API.post("/adivinacancion/round/", {
        tipo: points,
        ronda: round,
    })
    .then((res) => {
        useStoreRound.setState({ round: res.data.id });
        setPoints("");
        setTimeout(() => {
          getRound();
        }
        , 1000);
      })
      .catch((err) => {
        console.error(err);
      }
    );
  };

  const getNewSong = (round) => {
    if (!musicForm.genero) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona genero',
      });
      return;
    }
    API.post("/adivinacancion/question/", {
        genero: musicForm.genero,
        artista: musicForm.artista,
        ronda: round,
    })
    .then((res) => {
        useStoreSong.setState({ song: res.data.id });
        getSong();
        getRound();
        setMusicForm({
          artista: "",
          genero: ""
        });
        setArtistas([]);
      })
      .catch((err) => {
        console.error(err);
      }
    );
  };

  const startGame = () => {
    API.post("/adivinacancion/start-game/", form)
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
      API.get("/adivinacancion/timer", {
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
      API.get("/adivinacancion/timer", {
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
    console.log("game", game),
    console.log("actualRound", actualRound),
    console.log("actualSong", actualSong),
    <div className="flex flex-col items-center w-full h-screen bg-[#4d4e4f] text-white overflow-y-auto">
      <img src="/images/adivinacancion.png" alt="Logo" className="w-96 mt-8" />
      {!game.gameStarted && (
      <div className="bg-opacity-60 p-6 rounded-lg text-center">
        <h1 className="text-5xl mb-4">Moderador</h1>
        <label htmlFor="team1" className="block text-sm font-medium text-white mt-4">
          Numero de Rondas
        </label>
        <input
          type="number"
          name="rondas"
          value={form.rondas}
          onChange={(e) => setForm({ ...form, rondas: e.target.value })}
          className="mt-2 p-2 rounded-md w-full text-black"
        />
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
      {game.gameStarted && actualRound.round === 1 && !actualSong.cancion && !actualRound.terminada && !game.gameFinished && (
        <div className="p-6 rounded-lg text-center">
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Genero
            </label>
            <select
              name="genero"
              value={musicForm.genero}
              onChange={(e) => {
                setMusicForm({ ...musicForm, genero: e.target.value })
                getArtistas(e.target.value);
              }}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona un genero</option>
              {
                generos.map((genero, index) => (
                  <option key={index} value={genero.nombre}>{genero.nombre}</option>
                ))
              }
            </select>
            {musicForm.genero && (
              <>
              <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
                Artista
              </label>
              <select
                name="artista"
                value={musicForm.artista}
                onChange={(e) => setMusicForm({ ...musicForm, artista: e.target.value })}
                className="mt-4 p-2 rounded-md w-full text-black text-2xl"
              >
                <option value="">Selecciona un artista</option>
                {
                  artistas.map((artista, index) => (
                    <option key={index} value={artista.nombre}>{artista.nombre}</option>
                  ))
                }
              </select>
              </>
            )}
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewSong(actualRound.round);
              }}
            >
              Ir a la Cancion
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round > 0 && actualSong.terminada && !actualRound.terminada && !game.gameFinished && (
          <div className="p-6 rounded-lg text-center">
            <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
              Genero
            </label>
            <select
              name="genero"
              value={musicForm.genero}
              onChange={(e) => {
                setMusicForm({ ...musicForm, genero: e.target.value })
                getArtistas(e.target.value);
              }}
              className="mt-4 p-2 rounded-md w-full text-black text-2xl"
            >
              <option value="">Selecciona un genero</option>
              {
                generos.map((genero, index) => (
                  <option key={index} value={genero.nombre}>{genero.nombre}</option>
                ))
              }
            </select>
            {musicForm.genero && (
              <>
              <label htmlFor="type" className="block text-4xl font-medium text-white mt-4">
                Artista
              </label>
              <select
                name="artista"
                value={musicForm.artista}
                onChange={(e) => setMusicForm({ ...musicForm, artista: e.target.value })}
                className="mt-4 p-2 rounded-md w-full text-black text-2xl"
              >
                <option value="">Selecciona un artista</option>
                {
                  artistas.map((artista, index) => (
                    <option key={index} value={artista.nombre}>{artista.nombre}</option>
                  ))
                }
              </select>
              </>
            )}
            <button
              className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
              onClick={() => {
                getNewSong(actualRound.round);
              }}
            >
              Ir a la Cancion
            </button>
        </div>
      )}
      {game.gameStarted && actualRound.round != 0 && actualSong.cancion && !actualRound.terminada && !actualSong.terminada && !game.gameFinished && (
        <div className="flex flex-col items-center w-full p-8 mb-32">
          <h2 className="text-3xl font-bold">Ronda {actualRound.round}</h2>
          <div className="flex flex-col w-full mt-2">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold p-4 rounded mt-4 w-full"
                onClick={() => {
                  API.get("/adivinacancion/correct-answer/")
                  .then((res) => {
                    setTimeout(() => {
                      getGame();
                      getRound();
                      getSong();
                    }
                    , 1000);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
                }}
              >
                Respuesta Correcta
              </button>
          </div>
          <div className="flex flex-col w-full mt-2">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded mt-4 w-full"
                onClick={() => {
                  API.get("/adivinacancion/wrong-answer/")
                  .then((res) => {
                    setTimeout(() => {
                      getGame();
                      getRound();
                      getSong();
                    }
                    , 2000);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
                }}
              >
                Respuesta Incorrecta
              </button>
          </div>
          <div className="flex flex-col w-full mt-2">
            {!cronometro ? (
            <button
              className="bg-gray-700 hover:bg-gray-900 text-white font-bold p-4 rounded mt-4 w-full"
              onClick={() => handleTimer(true)}
            >
              <i className="fas fa-clock"></i> Temporizador
            </button>
            ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded mt-4 w-full"
              onClick={() => handleTimer(false)}
            >
              <i className="fas fa-clock"></i> Detener Temporizador
            </button>
            )}
          </div>
          <div className="flex flex-row w-full mt-2">
            <button
              className="bg-cyan-500 hover:bg-blue-700 text-white font-bold p-4 rounded mt-4 w-full mr-2 text-center"
              onClick={() => {
                API.get("/adivinacancion/play-audio/")
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.error(err);
                });
              }}
            >
              <i className="fas fa-volume-up text-2xl text-center"></i>
              {" "}Reproducir Cancion
            </button>
          </div>
          <div className="mt-6 flex flex-col justify-center items-center w-full">
            <div className="flex flex-col items-center w-full p-4">
              <h1 className="text-2xl font-bold">Cancion</h1>
              <h1 className="text-3xl font-bold text-center">{actualSong.cancion}</h1>
            </div>
            <div className="flex flex-col items-center w-full p-4">
              <h1 className="text-2xl font-bold">Artista</h1>
              <h1 className="text-3xl font-bold text-center">{actualSong.artista}</h1>
            </div>
            <div className="flex flex-col items-center w-full p-4">
              <h1 className="text-2xl font-bold">Genero</h1>
              <h1 className="text-3xl font-bold text-center">{actualSong.genero}</h1>
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
              API.get("/adivinacancion/reset-game")
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
                    canciones: 0,
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

export default ModeradorAdivina;
