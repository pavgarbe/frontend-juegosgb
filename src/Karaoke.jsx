import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import Lottie from "lottie-react";
import Versus from './animations/versus.json';
import API from "./utils/API";
import Swal from "sweetalert2";
import { CDGPlayer } from 'cdgplayer';

const URL = import.meta.env.VITE_APP_SOCKET_URL;


const Karaoke = () => {

  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);

  const [selectedSong, setSelectedSong] = useState(null);

  const [songConfirmed, setSongConfirmed] = useState(false);

  const [genreFilter, setGenreFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [step, setStep] = useState(0);
  const [filterType, setFilterType] = useState(null);

  const refPlayer = useRef(null);

  const genres = Array.from(new Set(songs.map(song => song.genero).filter(Boolean)));
  const artists = Array.from(new Set(songs.map(song => song.artista).filter(Boolean)));

  const filteredSongs = songs.filter(song => {
    const matchesGenre = genreFilter ? song.genero === genreFilter : true;
    const matchesArtist = artistFilter ? song.artista === artistFilter : true;
    return matchesGenre && matchesArtist;
  });

  useEffect(() => {
    Swal.showLoading()
    API.get("/karaoke/canciones")
      .then((response) => {
        Swal.close();
        setSongs(response.data);
      })
      .catch((error) => {
        Swal.close();
        console.error("Error fetching songs:", error);
      });
  }
  , []);



  useEffect(() => {
    if (!songConfirmed || !selectedSong) return;
    const timeout = setTimeout(() => {
      const el = document.getElementById('cdg_video_wrapper');
      if (!el) return;
      try {
        console.log('Intentando cargar archivo:', selectedSong.archivo);
        refPlayer.current = new CDGPlayer('#cdg_video_wrapper');
        if (selectedSong.archivo) {
          const result = refPlayer.current.load(selectedSong.archivo);
          if (result && typeof result.then === 'function') {
            result.then(() => {
              if (typeof refPlayer.current.play === 'function') {
                refPlayer.current.play(); // Reproducir si existe el método
              } else {
                console.log('Métodos disponibles en CDGPlayer:', Object.keys(refPlayer.current));
                // Si existe start, intenta start
                if (typeof refPlayer.current.start === 'function') {
                  refPlayer.current.start();
                } else {
                  console.warn('No se encontró método play ni start en CDGPlayer.');
                }
              }
            }).catch((err) => {
              console.error('Error al cargar el archivo ZIP:', err);
            });
          } else {
            if (typeof refPlayer.current.play === 'function') {
              refPlayer.current.play();
            } else if (typeof refPlayer.current.start === 'function') {
              refPlayer.current.start();
            } else {
              console.log('Métodos disponibles en CDGPlayer:', Object.keys(refPlayer.current));
              console.warn('No se encontró método play ni start en CDGPlayer.');
            }
          }
        } else {
          console.error('No se proporcionó la URL del archivo de karaoke.');
        }
      } catch (err) {
        console.error('Error al inicializar el reproductor CDGPlayer:', err);
      }
    }, 500);
    return () => {
      clearTimeout(timeout);
      const el = document.getElementById('cdg_video_wrapper');
      if (el) el.innerHTML = '';
    };
  }, [songConfirmed, selectedSong]);

  return (
    console.log(songs),
    <div className="h-screen w-full flex flex-col items-center bg-[#e6e6e6] text-white relative overflow-y-auto">
      {songConfirmed && selectedSong ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div id="cdg_video_wrapper" className="w-full h-full bg-black flex-1 flex items-center justify-center">
            </div>
            <div id="cdg_controls" className="flex justify-center mt-4"></div>
          </div>
          <button
            className="absolute top-8 right-8 px-8 py-3 bg-red-600 text-white rounded-lg text-xl shadow-lg hover:bg-red-800 transition"
            onClick={() => {
              setSongConfirmed(false);
              setSelectedSong(null);
              refPlayer.current?.stop();
            }}
          >
            Cambiar canción
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full p-8">
          <div className="mb-8 w-full flex flex-col items-center">
            <img src="/images/karaoke.png" alt="Logo" className="w-[700px] mb-4" />
            <h2 className="text-5xl font-bold text-blue-800 py-16">{step === 0 ? 'Selecciona género o artista' : step === 1 && filterType === 'genre' ? 'Selecciona un género' : step === 1 && filterType === 'artist' ? 'Selecciona un artista' : 'Selecciona una canción'}</h2>
            {/* Pantalla de selección por tipo */}
            {step === 0 && (
              <div className="flex gap-8 mb-8">
                <button
                  className="px-8 py-8 bg-blue-700 text-white rounded-lg text-3xl font-semibold shadow hover:bg-blue-900 transition"
                  onClick={() => { setFilterType('genre'); setStep(1); }}
                >
                  Elegir por género
                </button>
                <button
                  className="px-8 py-8 bg-green-700 text-white rounded-lg text-3xl font-semibold shadow hover:bg-green-900 transition"
                  onClick={() => { setFilterType('artist'); setStep(1); }}
                >
                  Elegir por artista
                </button>
              </div>
            )}
            {/* Pantalla de selección de género o artista */}
            {step === 1 && filterType === 'genre' && (
              <div className="flex flex-wrap gap-4 mb-8 justify-center">
                {genres.map((g, i) => (
                  <button
                    key={i}
                    className="px-6 py-6 bg-blue-200 text-blue-900 rounded-lg font-semibold shadow hover:bg-blue-400 transition"
                    onClick={() => { setGenreFilter(g); setStep(2); }}
                  >
                    {g}
                  </button>
                ))}
                <button
                  className="px-6 py-6 bg-gray-300 text-blue-900 rounded-lg font-semibold shadow hover:bg-gray-400 transition"
                  onClick={() => { setGenreFilter(''); setStep(2); }}
                >
                  Todos los géneros
                </button>
              </div>
            )}
            {step === 1 && filterType === 'artist' && (
              <div className="flex flex-wrap gap-4 mb-8 justify-center">
                {artists.map((a, i) => (
                  <button
                    key={i}
                    className="px-6 py-6 bg-green-200 text-blue-900 rounded-lg font-semibold shadow hover:bg-green-400 transition"
                    onClick={() => { setArtistFilter(a); setStep(2); }}
                  >
                    {a}
                  </button>
                ))}
                <button
                  className="px-6 py-6 bg-gray-300 text-blue-900 rounded-lg font-semibold shadow hover:bg-gray-400 transition"
                  onClick={() => { setArtistFilter(''); setStep(2); }}
                >
                  Todos los artistas
                </button>
              </div>
            )}
            {/* Pantalla de canciones filtradas */}
            {step === 2 && (
              <>
                <div className="flex gap-4 mb-6">
                  <button
                    className="px-4 py-2 bg-gray-400 text-blue-900 rounded shadow hover:bg-gray-600 hover:text-white"
                    onClick={() => setStep(1)}
                  >
                    Volver
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-blue-900 rounded shadow hover:bg-gray-400"
                    onClick={() => { setStep(0); setGenreFilter(''); setArtistFilter(''); setFilterType(null); }}
                  >
                    Elegir otro tipo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                  {filteredSongs.map((song, idx) => (
                    <div
                      key={song.id || idx}
                      className={`cursor-pointer p-6 rounded-xl shadow-lg transition-all duration-200 border-4 ${selectedSong === song ? 'border-blue-600 bg-blue-100 text-blue-900 scale-105' : 'border-transparent bg-white text-blue-900 hover:border-blue-400'} flex flex-col items-center`}
                      onClick={() => {
                        setSelectedSong(song);
                        setSongConfirmed(true);
                      }}
                    >
                      <span className="text-xl font-semibold mb-2">{song.nombre}</span>
                      <span className="text-sm italic">{song.artista}</span>
                    </div>
                  ))}
                  {filteredSongs.length === 0 && (
                    <div className="col-span-full text-center text-blue-900">No se encontraron canciones.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Karaoke;


