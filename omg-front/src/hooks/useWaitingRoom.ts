import {
  CreateRoomResponse,
  EnterRoomResponse,
  createWaitingRooms,
  enterWaitingRoom,
} from '@/apis/room/roomAPI';
import { useMutation } from '@tanstack/react-query';

// 대기방 생성 훅
export const useCreateWaitingRoom = () => {
  return useMutation<CreateRoomResponse, Error, string>({
    mutationFn: (userNickname: string) => createWaitingRooms(userNickname),
    onSuccess: data => {
      if (data.isSuccess) {
        console.log('대기방 생성 성공:', data.result);
      } else {
        console.warn('대기방 생성 실패:', data.message);
      }
    },
    onError: error => {
      console.error('대기방 생성 에러:', error);
    },
  });
};

// 대기방 입장 훅
export const useEnterWaitingRoom = () => {
  return useMutation<
    EnterRoomResponse,
    Error,
    { roomId: string; sender: string }
  >({
    mutationFn: ({ roomId, sender }) => enterWaitingRoom(roomId, sender),
    onSuccess: data => {
      if (data.isSuccess) {
        console.log('대기방 입장 성공:', data.result.roomId);
        console.log('대기방 데이터:', data.result.room);
      } else {
        console.warn('대기방 입장 실패:', data.message);
      }
    },
    onError: error => {
      console.error('대기방 입장 에러:', error);
    },
  });
};
