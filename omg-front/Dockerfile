# Node.js 공식 이미지 사용. 경량화된 Alpine Linux 기반
FROM node:lts-slim AS build

# 작업 디렉토리 설정. 컨테이너 내 앱의 기본 경로
WORKDIR /app

# 라이브러리 설치에 필요한 파일만 복사
COPY package*.json ./

# 라이브러리 설치 (npm ci 사용으로 안정성 및 속도 향상)
RUN npm ci && npm cache clean --force

# 환경 변수 설정
ARG VITE_APP_BASE_URL
ARG VITE_APP_SOCKET_URL

# 환경 변수를 설정하여 빌드 시 주입
ENV VITE_APP_BASE_URL=${VITE_APP_BASE_URL}
ENV VITE_APP_SOCKET_URL=${VITE_APP_SOCKET_URL}

# 소스 코드 복사
COPY . /app

# 소스 코드 빌드
RUN npm run build

# 프로덕션 스테이지
FROM nginx:1.21.4-alpine


# 작업 디렉토리 설정
WORKDIR /usr/share/nginx/html

# nginx 실행 전 default.conf 파일 수정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 이미지에서 생성된 dist 폴더를 nginx 이미지로 복사
COPY --from=build /app/dist .

# 포트 노출
EXPOSE 80

# nginx 실행 명령어
CMD [ "nginx", "-g", "daemon off;" ]
