import { END_POINT } from '@/apis/apiConstants';
import { axiosInstance } from '@/apis/axiosInstance';

export interface CreateRoomResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: string;
}

export interface EnterRoomResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: {
    roomId: string;
    sender: string;
    message: string;
    game: null;
    room: {
      roomId: string;
      hostNickname: string;
      inRoomPlayers: Array<{
        nickname: string;
        rendered: boolean;
      }>;
    };
  };
}

// 대기방 생성
export const createWaitingRooms = async (
  userNickname: string,
): Promise<CreateRoomResponse> => {
  const response = await axiosInstance.post(`${END_POINT.ROOM}/create`, null, {
    params: { userNickname },
  });
  return response.data;
};

// 대기방 입장
export const enterWaitingRoom = async (
  roomId: string,
  sender: string,
): Promise<EnterRoomResponse> => {
  const response = await axiosInstance.post(`${END_POINT.ROOM}/enter`, {
    roomId,
    sender,
    message: 'ENTER_SUCCESS',
  });
  return response.data;
};
