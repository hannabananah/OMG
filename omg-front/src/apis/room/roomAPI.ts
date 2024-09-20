import { END_POINT } from '@/apis/apiConstants';
import { axiosInstance } from '@/apis/axiosInstance';

interface InstanceError {
  message: string;
  response?: {
    status: number;
  };
}

// 대기방 생성
export const createWaitingRooms = async (userNickname: string) => {
  try {
    const response = await axiosInstance.post(
      `${END_POINT.ROOM}/create`,
      null,
      { params: { userNickname } },
    );
    return response.data.result;
  } catch (error: unknown) {
    const err = error as InstanceError;
    console.error(err.response?.status, err.message);
    throw error;
  }
};

//대기방 입장
export const enterWaitingRoom = async (roomId: string, sender: string) => {
  try {
    const response = await axiosInstance.post(`${END_POINT.ROOM}/enter`, {
      roomId,
      sender,
      message: 'ENTER_SUCCESS',
    });

    const { message, roomId: returnedRoomId } = response.data.result;
    if (message === 'ENTER_SUCCESS') {
      console.log(`${returnedRoomId} 방입장 성공`);
      return { success: true, roomId: returnedRoomId };
    } else {
      console.warn(`방입장 실패: ${message}`);
      return { success: false, message };
    }
  } catch (error: unknown) {
    const err = error as InstanceError;
    console.error(err.response?.status, err.message);
    throw error;
  }
};
