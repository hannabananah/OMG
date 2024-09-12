import { handleApiError } from '@/apis/errorHandler';
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  config => {
    // 요청 전 처리할 작업이 있다면 여기서 처리
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(handleApiError(error));
  },
);
