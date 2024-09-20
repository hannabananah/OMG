# Node.js 공식 이미지 사용. 경량화된 Alpine Linux 기반
FROM node:lts-slim AS build

# 작업 디렉토리 설정. 컨테이너 내 앱의 기본 경로
WORKDIR /app

# 라이브러리 설치에 필요한 파일만 복사
COPY package.json .
COPY package-lock.json .

# 라이브러리 설치
RUN npm i

# 환경 변수 설정
# ARG VITE_SERVER_URL
# ENV VITE_SERVER_URL=${VITE_SERVER_URL}

# 소스코드 복사
COPY . /app

# .env => 얘를 그냥 내용을 바꿈

# 소스 코드 빌드
RUN npm run build

# 프로덕션 스테이지
FROM nginx:1.21.4-alpine

# nginx 실행 전 default.conf 파일 수정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 이미지에서 생성된 dist 폴더를 nginx 이미지로 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
