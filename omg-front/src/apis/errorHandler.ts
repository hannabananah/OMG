import { HTTP_STATUS_CODE } from '@/apis/apiConstants';
import { AxiosError } from 'axios';

export const handleApiError = (error: AxiosError) => {
  if (!error.response) {
    return {
      status: 'NETWORK_ERROR',
      message: '네트워크 에러가 발생했습니다. 다시 시도해주세요.',
    };
  }

  const { status, data } = error.response;
  const errorData = data as { message?: string };

  switch (status) {
    case HTTP_STATUS_CODE.BAD_REQUEST:
      return {
        status: 'BAD_REQUEST',
        message: errorData.message || '잘못된 요청입니다.',
      };
    case HTTP_STATUS_CODE.UNAUTHORIZED:
      return { status: 'UNAUTHORIZED', message: '인증이 필요합니다.' };
    case HTTP_STATUS_CODE.NOT_FOUND:
      return { status: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' };
    case HTTP_STATUS_CODE.CONTENT_TOO_LARGE:
      return {
        status: 'CONTENT_TOO_LARGE',
        message: '요청한 콘텐츠가 너무 큽니다.',
      };
    case HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR:
      return { status: 'SERVER_ERROR', message: '서버 에러가 발생했습니다.' };
    default:
      return {
        status: 'UNKNOWN_ERROR',
        message: errorData.message || '알 수 없는 에러가 발생했습니다.',
      };
  }
};
