import { END_POINT } from '@/apis/apiConstants';
import { axiosInstance } from '@/apis/axiosInstance';

export interface BaseResponse {
  [x: string]: any;
  isSuccess: boolean;
  code: number;
  message: string;
}

export interface CreateRoomResponse extends BaseResponse {
  result: string;
}

export interface EnterRoomResponse extends BaseResponse {
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

export interface HasWaitingRoomResponse extends BaseResponse {
  result: string;
}

export interface ChatBotResponse extends BaseResponse {
  result: string;
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

// 대기방 존재 유무
export const hasWaitingRoom = async (
  roomId: string,
): Promise<HasWaitingRoomResponse> => {
  const response = await axiosInstance.get(`${END_POINT.ROOM}`, {
    params: { roomId },
  });
  return response.data;
};

// 챗봇 요청
export const requestChatBot = async (
  roomId: string,
  sender: string,
  message: string,
): Promise<ChatBotResponse> => {
  // 쿼리 파라미터로 roomId, sender, message를 GET 요청으로 전송
  const response = await axiosInstance.get(`${END_POINT.CHATBOT}/response`, {
    params: {
      roomId,
      sender,
      message,
    },
  });

  return response.data;
};
