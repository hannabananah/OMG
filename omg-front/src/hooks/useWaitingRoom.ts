import type {
  BaseResponse,
  CreateRoomResponse,
  EnterRoomResponse,
  HasWaitingRoomResponse,
} from '@/apis/room/roomAPI';
import {
  createWaitingRooms,
  enterWaitingRoom,
  hasWaitingRoom,
} from '@/apis/room/roomAPI';
import { useMutation } from '@tanstack/react-query';

const handleMutationResponse = <T extends BaseResponse>(
  data: T,
  action: string,
) => {
  if (data.isSuccess) {
    console.log(`${action} 성공:`, data.result);
  } else {
    console.warn(`${action} 실패:`, data.message);
  }
};

// 대기방 생성 훅
export const useCreateWaitingRoom = () => {
  return useMutation<CreateRoomResponse, Error, string>({
    mutationFn: createWaitingRooms,
    onSuccess: data => handleMutationResponse(data, '대기방 생성'),
    onError: error => console.error('대기방 생성 에러:', error),
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
    onSuccess: data => handleMutationResponse(data, '대기방 입장'),
    onError: error => console.error('대기방 입장 에러:', error),
  });
};

// 대기방 존재 확인 훅
export const useHasWaitingRoom = () => {
  return useMutation<HasWaitingRoomResponse, Error, string>({
    mutationFn: hasWaitingRoom,
    onSuccess: data => handleMutationResponse(data, '대기방 존재 확인'),
    onError: error => console.error('대기방 존재 확인 에러:', error),
  });
};
