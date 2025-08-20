import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'


export const useStore = create(
    persist(
        (set, get) => ({
            game: '',
            setGame: (game) => set({ game })
        }),
        {
            name: 'game',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useStoreRound = create(
    persist(
        (set, get) => ({
            round: '',
            setRound: (round) => set({ round })
        }),
        {
            name: 'round',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useStoreQuestion = create(
    persist(
        (set, get) => ({
            question: '',
            setQuestion: (question) => set({ question })
        }),
        {
            name: 'question',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useStoreCron = create(
    (set) => ({
        time: 15,
        isRunning: false,
        start: () => set({ isRunning: true }),
        stop: () => set({ isRunning: false }),
        reset: () => set({ isRunning: false, time: 15 }),
        increment: () => set((state) => ({ time: state.time - 1 })),
    })
);

export const useStoreSong = create(
    persist(
        (set, get) => ({
            song: '',
            setSong: (song) => set({ song })
        }),
        {
            name: 'song',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const useStoreCreditos = create(
        (set, get) => ({
            creditos: 0,
            setCreditos: (nuevaCantidad) =>
                set(() => ({ creditos: nuevaCantidad })),
        }
    )
);

export const useStoreJuego = create(
    persist(
        (set, get) => ({
            juego: '',
            setJuego: (juego) => set({ juego })
        }),
        {
            name: 'juego',
            storage: createJSONStorage(() => localStorage),
        }
    )
);