import { create } from 'zustand';

interface RoomStore {
  roomId: string;
  sender: string;
  setRoomId: (roomId: string) => void;
  setSender: (sender: string) => void;
}

export const useRoomStore = create<RoomStore>(set => ({
  roomId: '',
  sender: '',
  setRoomId: (roomId: string) => set({ roomId }),
  setSender: (sender: string) => set({ sender }),
}));
