pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'backend'
        FRONTEND_IMAGE = 'frontend'
    }

    stages {
        stage('Backend Build') {
            steps {
                script {
                    echo '********** Backend Build Start **********'
                    dir('omg-back') {
                        sh 'docker build -t docker-image/$BACKEND_IMAGE .'
                    }
                    echo '********** Backend Build End **********'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                script {
                    echo '********** Frontend Build Start **********'
                    dir('omg-front') {
                        sh 'pwd'  // 현재 디렉토리 출력
                        sh 'ls -al'  // 디렉토리 내 파일 목록 확인
                        sh 'docker build --no-cache -t docker-image/$FRONTEND_IMAGE .'
                    }
                    echo '********** Frontend Build End **********'
                }
            }
        }

        stage('Docker Compose Up') {
            steps {
                script {
                    echo '******** Docker Compose Start ************'
                    sh 'docker compose down'  // 기존 컨테이너를 모두 중지 및 제거
                    sh 'docker rm -f frontend || true'  // 이미 존재하는 컨테이너가 있다면 강제로 삭제
                    sh 'docker rm -f backend || true'
                    sh 'docker compose up -d'  // 새로운 컨테이너 실행
                    echo '********** Docker Compose End ***********'
                }
            }
        }
    }

    post {
        success {
            script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                mattermostSend (color: 'good',
                message: "빌드 성공: ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)",
                endpoint: 'https://meeting.ssafy.com/hooks/ceutz8ibfbgm3mwbji6f7yeehy',
                channel: 'jenkins'
                )
            }
        }
        failure {
            script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                mattermostSend (color: 'danger',
                message: "빌드 실패: ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)",
                endpoint: 'https://meeting.ssafy.com/hooks/ceutz8ibfbgm3mwbji6f7yeehy',
                channel: 'jenkins'
                )
            }
        }
    }
}