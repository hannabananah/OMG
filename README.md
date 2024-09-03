## 🙌 특화 프로젝트

## 회의록

<details><summary> week1
</summary>

### 1. 기본 정보

- **모의 주식** 정보 활용
    - ssasfy
    - ssasdaq
- 각각의 게임 방은 **같은 주식 시장을 공유하지 않는다**.
- **매 게임마다** 주식 시장은 **RESET**된다.
    - **개장(낮) 거래**
        - 게임 참가자 전원
        - 외부 시장
    - **폐장(밤) 거래**
        - 마피아
        - 외부 시장
- **게임 참가자**
    - **전체 주식 시장의 일부 구성원**으로 존재한다.
    - **개장(낮) 시간에 채팅으로 논의**할 수 있다.
        - 마피아 찾기 - 누가 주가를 조작한 것 같은지
        - 종목에 대한 토의 (주어진 뉴스를 바탕으로)
- **게임의 ROUND**는 다음과 같이 돌아간다.
    - ROUND의 **최대 횟수는 N회**로 제한한다.
    - **하나의 ROUND**에는 **개장(낮)과 폐장(밤)**이 존재한다.
        - 개장(낮)에는 **모든 참가자**가 거래 할 수 있다.
        - 폐장(밤)에는 **마피아가 주가 조작** 행위를 할 수 있다. (뉴스 준비 등)
- 다른 참가자의 투자 현황은 알 수 없다.
- 게임 내의 주식 종목 개수는 N개로 제한한다.


### 2. 사용자 관리

- 사용자는 회원 가입 시 **게임 머니 50만 원**을 지급 받는다.
- 사용자는 해당 **게임 머니로  ‘주식 마피아’ 게임에 참가**할 수 있다.
- 게임 머니가 부족하다면, **결제**를 통해 **게임 머니를 충전**할 수 있다.

### 3. 투자 분석

- ‘주식 마피아’ 게임에서 얻은 **이익/손실은 나의 실제 데이터**로 기록되어 **마이 페이지 대시 보드**에서 확인 가능하다.
- **확인 할 수 있는 데이터**는 다음과 같다.
    - **현금 잔액**
    - **전체 주식 잔액**
        - 투자 원금
        - 수익 금액 / 수익률
        - 모의 주식 투자 비중
    - **모의 주식 별 잔액**
        - 종목 명
        - 주식 수
        - 수익 금액 / 수익률
        - 1주 기준
            - 현재 가액
            - 내 구매 평균 가액
        - 총 금액
            - 현재 가액 기준
            - 내 구매 평균 가액 기준
        - 세금/수수료 - 일괄 적용 ?

### 5. 게임 내 역할 / 권한 / 승부 조건

- **마피아 - 주가 조작 집단의 두목**

    <aside>
    💡

  **승리 조건**

    - 끝 까지 잡히지 않기
    - 목표 금액 달성
        - 게임 입장 시 참여한 자본금의 500% ?
    - 특정 기업 인수 ?
    - 주가 조작이 성공적으로 이루어져 특정 기업의 주식 가격을 설정된 목표에 맞게 높이거나 낮춰야함
    </aside>

    - 마피아는 주식 거래의 기준이 되는 **뉴스를 생성**하여 시민들에게 발행할 수 있다.
    - 뉴스 발행 + 주가 조작??
        - 예를 들어, 긍정적인 뉴스를 발행하고 주가를 낮춰버리는 방법
- **애널리스트 - 마피아의 공범**

    <aside>
    💡

  **승리 조건**

    - 마피아와 함께 목표 금액 달성
    - 정체를 끝까지 들키지 않기
    - 특정 개미에게 잘못된 정보를 제공해 큰 손해를 입히면 인센티브 제공
    - 주가 조작에 성공한 횟수에 따라 인센트브 제공
    - 히든 승리 조건
        - 마피아가 체포되었을 때, 자신이 공범임을 끝까지 감추고 다른 인물에게 누명을 씌우면 공범만의 개인 승리 가능
    </aside>

    - 선동하는 역할
    - 찌라시 뉴스 제공 가능
- **금융 감독 원**

    <aside>
    💡

  **승리 조건**

    - 마피아 잡기
    </aside>

    - 주식 시장의 공정성을 유지하며, 마피아와 공범의 주가 조작 시도를 최대한 저지(?)

- **개미**

    <aside>
    💡

  **승리 조건**

    - 마피아 잡기
    </aside>

- **기자**

    <aside>
    💡

  **승리 조건**

    - 마피아 잡기
    </aside>
</details>

<details><summary> week2
</summary>
<details>
<summary>day1 (기존 블랙프라이데이에 금리, 대출 추가)
</summary>

![easyme](/uploads/23f5548b60ea31ce73b9314843052d60/F10F3048-1946-4B59-9038-96BA3B15AC0C.jpg)
- **금리 바(대출 / 상환) 적용**
    - **초기 금리 5%, 변동 가능 (1 ~ 10%)** - 고정 금리와 변동 금리를 고려한 최종 금리
    - **각 턴 시작 시 주어지는 경제 상황 (대공황, 곡물 가격 상승 등)에 따라 금리 변동**
- 자기 차례에는
    - **1. 선택** - 2가지 중 하나 선택 가능
        - 대출
        - 상환
    - **2. 필수** - 4가지 중 1개 행동
        - **주식 매입** (0개 매입 가능 → 주식 토큰 옮기기)
        - **주식 매도** (0개 매도 가능 → 주식 토큰 옮기기)
        - **금괴 매입**
- **대출**
    - 대출 횟수 제한 최대 2번
    - 해당 플레이어의 보유 자산 기준으로 대출 최대 금액 제한
        - 안정 자산(현금 + 금괴) 기준
        - (임시) 대출 금액 기준 표


            | 보유한 안정 자산 | 대출 최대 금액 |
            | --- | --- |
            | 0 ~ 150 | 100 |
            | 150 ~ 350 | 200 |
            | 350 ~ 600 | 300 |
            | 600 ~ 900 | 400 |
            | 900 ~ | 500 |
    - 대출 이자
        - 1 turn은 1분기(3개월) 뜻한다.
        - 총 16 turn (4년) —————> 게임 종료 조건 할까???
        - 한 턴이 끝날 때마다 상환하지 못한 금액에 대한 이자를 **단리**로 계산한다.
            - 대출 이력 띄워주기
            - 1turn 에서의 대출 금액 * 1turn이 끝날 때의 금리
            + 2turn  에서의 대출 금액 * 2turn이 끝날 때의 금리
            + 3turn 에서의 대출 금액 * 3turn이 끝날 때의 금리 = ex) 이자 500
- **상환**
    - 중간 상환 -  ex) 500 중에 300 갚는다.
    - 최종 상환 - ex) 돈 없으면 마이너스
- **기타**
    - 3명 이상이 게임을 하다가 한 명이 갑자기 나갔을 경우도 고려해야 함
        - 나간 사람 턴을 어떻게 할 것인가
        - 코치님 네는 해결을 못해서 봇으로 대체하셨음
</details>

<details>
<summary>day2 (순서도)
</summary>

### 오늘 한 일
- [🌲 순서도 게임 로직 정리 figma](https://www.figma.com/board/MQPH1pZWkN7CF15FK1Ezcp/%EC%88%9C%EC%84%9C%EB%8F%84---%EA%B2%8C%EC%9E%84-%EB%A1%9C%EC%A7%81?node-id=0-1&t=lR4gNds70XMbcXdl-1)

### 회고
**Keep** 
- 서로 생각하고 있는 프로세스가 동일한지 점검하면서 같이 작성하는 것이 좋았다.

**Problem**
- 과업에 대한 기한이 명확하지 않다. api를 빨리 만들어줘야 해서 마음이 급해졌다.

**Try**
- bot의 동작 로직을 생각해봐야 할 것 같다. 최적이 좋을지, 랜덤이 좋을지도 고려해봐야 할 것 같다.

### 내일 할 것
- 백 팀원들과 업무 분담 및 기능 명세 작성
- bot에 대해 공부

</details>

</details>
