## 📆 특화 프로젝트 진행 상황

<details>
  <summary>5주차</summary>

### 🔖 09/25(수)

- [x] blendar에서 캐릭터 애니메이션 작업
  - [x] 산타
  - [x] 엘프
  - [x] 눈사람
- [x] MainMap에 공통 컴포넌트 띄우기 (MainAlert)
- [x] 메인 판 / 개인 판 관련 화면 구성 논의
- [x] 매도 트랙 재구성, 매수 트랙 제거
- [x] 서버 통신 논의 (broadcast / 직접 요청)
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 공통 컴포넌트(안내를 위한 MainAlert)를 제작하여 3D 맵 위에 띄워보니, 메인 맵 내에서는 헤더, 푸터에 심어 두려고 했던 메인 판/개인 판이 너무 갑갑해 보이기 때문에 아이콘 등으로 숨겨 두고 클릭해야만 볼 수 있도록 수정해야 할 필요가 있음이 보였다. (거래소에서는 그대로 헤더, 푸터 넣어도 괜찮음)
    - 판 세팅 UI 관련해서 어떻게 하면 컨셉에 맞출 수 있을 지 화면 구성을 활발하게 논의했고, 매수/매도 트랙 관련하여 사용자 입장에서 해당 트랙들의 의미를 고민하고 재구성/제거 처리하기로 했다.
    - 서버 통신 방법에 대해 다함께 활발하게 소통하였고, 브로드캐스트로 받을 정보(캐릭터 관련, 메인/개인 판)와 직접 요청(거래 행위 5가지)을 통해 받을 정보를 구분 및 전원 숙지했다.

  - **Problem(문제되는 점들)**

    - 4인이 동시에 플레이를 하게 되는데, 현재는 상대의 위치/방향 정보만 알고 애니메이션이 적용되지 않은 상태다. 그럼 상대는 귀신 처럼 떠다니게 보이게 되느냐 ..? 생각해보니 서로 다른 상대가 각각 접속해서 들어올 텐데, 서로를 어떻게 보여줄 건지 부터 고민이 필요하다. => 4개 캐릭터 다 렌더링, 내꺼는 내가 제어, 본인 제외 나머지 캐릭터는 브로드캐스트로 받은 정보에 따라 움직이도록 처리
    - 결국 주식 거래가 크리스마스 트리 꾸미기가 됐는데, 이걸사실 핀테크적 요소(주식 매도/매수/변동) 임을 어떻게든 조금이라도 더 표현해서 보여줄 수 있을 지.. 고민

  - **Try(새롭게 시도해볼 것들)**

    - 트리 장식 선택 과정 & 트리 장식을 선택해서 직접 가져가서 팔거나, 사서 집으로 가져오거나 하는 등의 구현이 실제 가능한 지 우선적으로 테스트 작업을 하려고 한다. (들고 있는 에셋을 UI 적으로도 보여줄 지 vs 안 되면 화면 구석에 따로 컴포넌트 띄워서 처리)
    - 현재 헤더/푸터에 박혀 있는 메인 판/개인 판이 MainMap 내 이동 시에는 화면을 갑갑하게 느끼게 하므로, UI 재구성 필요
    - 메인 판/개인 판 모달 UI 고민 및 수정하여 컴포넌트 띄워보기
    - 시스템 커서 에셋 서칭 및 적용
    - message 규약 학습 / 웹 소켓 관련 코드 읽어보기

### 🔖 09/24(화)

- [x] blendar에서 캐릭터 애니메이션 작업
  - [x] 진저맨
  - [ ] 산타
  - [ ] 엘프
  - [ ] 눈사람
- [x] R3F에서 캐릭터 애니메이션 연동 완료
  - [x] 최초 대기 상태
  - [x] 위쪽 방향키 누르면 걷기, 1초 이상 지속 시 달리기로 변경
  - [x] 위쪽 방향키에서 손을 떼면 대기 상태로, 달리다가 멈춘 경우 1초 걷기 후 대기 상태로
  - [x] 왼쪽 방향키 누르면 왼쪽 90도 회전 후 대기 상태로
  - [x] 오른쪽 방향키 누르면 오른쪽 90도 회전 후 대기 상태로
  - [x] 아래 방향키 누르면 줍기 후 대기 상태로
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 주식(크리스마스 장식) 관련 매도/매수 스토리(물건 가지고 가기 동작의 타당성, 추가 선택으로 주식 이동시키는 로직에 관한 처리 백단에서만 하기로, 돈 부족한 경우 구매하기 프론트 단에서 막고 백에 요청 보내지 않기로, 주식 매도 트랙 관련하여 progress bar 처리로 변경) 관련하여 백엔드와 소통이 이루어졌고, 덕분에 게임이 사용자 입장에서 조금 더 타당한 방식으로 개선 된 것 같다.

  - **Problem(문제되는 점들)**

    - blendar에서 캐릭터 애니메이션 심어주는 것, R3F 방향키로 캐릭터 애니메이션(대기>걷기>달리기>걷기>대기) 상태 제어하는 것에 생각보다 시간이 너무 많이 걸렸다. 빨리 인게임 컴포넌트나 서버와의 로직 소통을 하고 싶은데, 3D 작업이 너무 길어진다.
    - 컨셉이 강해지고 게임적인 요소를 신경쓰다 보니, 경제 상황, 금리, 대출 이외에 핀테크 적인 요소가 부각되지 않는 것 같다.

  - **Try(새롭게 시도해볼 것들)**

    - 늘 그렇지만 절대적인 시간 투자..
    - 3D 작업을 서둘러 마무리 해야 뭐든 가닥이 잡힐 것 같다.
    - 마감까지 해야 할 작업들에 대한 나열과 데드라인이 필요

### 🔖 09/23(월)

- [x] 4주차 Jira 스프린트 이슈 등록
- [x] 크리스마스 컨셉 피그마 재작업
- [x] 피그마 공통 컴포넌트 추출
- [x] 변수화 (폰트, 컬러, border 관련)
- [x] React에 tailwind css 변수 설정
- [x] 기존 컴포넌트에 css 변수 적용
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 프론트 분업이 잘 된 것 같다. (웹소켓, 채팅 / 캐릭터 물리 엔진 및 맵 내 이동 / 전체 화면 작업 및 컴포넌트 추출, 변수화)
    - 새로 바뀐 컨셉에 맞춰 피그마를 모두 재구성하고, 흐름에 따라 연결해 놓았으며, 공통 컴포넌트 작업을 완료했다. 생각보다 반복되는 컴포넌트가 많은 것 같아서 잘 활용하면 좋을 것 같다.
    - 전체 피그마에 대하여 변수화(폰트, 컬러, border 관련) 작업을 완료하고, tailwind config에 적용했다. 잘 활용하여 일관성 있게 UI 작업을 하면 좋을 것 같다.

  - **Problem(문제되는 점들)**

    - 일정이 촉박하다.
    - 변수화한 css 속성을 잘 활용하지 않고, tailwind의 기본 css 속성을 적용하는 게 너무 용이해서 일관성을 해칠 수도 있을 것 같아 걱정이 된다.
    - 생각보다 tailwind를 많이 잊었다.. 그리운 styled component..

  - **Try(새롭게 시도해볼 것들)**

    - 절대적인 시간 투자가 필요하다.
    - 우선적으로 bleandar에서 캐릭터 애니메이션 및 3D 맵 수정 작업해서 다현이한테 넘겨줘야 겠다.
    - React 내 컴포넌트 작업을 빠르게 진행해서 3D 맵 위에 띄워보고, 백엔드와 어떻게 통신해야 하는 지 테스트 해야겠다.

</details>

<details>
  <summary>4주차</summary>

### 🔖 09/20(금)

- [x] 컨셉 및 에셋 확정 - 크리스마스
- [x] 캐릭터 및 거래소 관련 에셋 서칭
- [x] 사용할 캐릭터(4개) 리깅 테스트
- [x] 간략한 피그마 와이어프레임 제작 (미리보기)
- [x] 3d 배경 에셋 구매 - 크리스마스 $28
- [x] R3F 크리스마스 배경에 임시 미키 캐릭터 띄우기
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 싸피데이 게임 1등으로 팀워크를 다졌다 ㅎ 명실상부 게임은 6팀
    - 게임 컨셉을 크리스마스로 선정한 뒤, 빠르게 에셋을 찾고, 구현 가능성 여부(캐릭터 리깅, 배경 에셋 수정)를 우선적으로 테스트 했다.
    - 컨셉 관련해 소통할 수 있을 정도로만 대충 빠르게 피그마 와이어 프레임을 정리해서 팀원들에게 공유했다.
    - 다현이와 주말 간 분업을 명확히 했다.
    - 데일리 스크럼에서 각자 오늘 뭘 할 것인지 돌아가면서 얘기하니까 일정을 확인할 수 있어 좋았다.

  - **Problem(문제되는 점들)**

    - 오늘은 다현이랑 분업이 제대로 안 된 것 같다.
    - 노션 스크럼 페이지에서 팀원들이 뭘 하고 있는 지 잘 업데이트 되지 않아 확인이 어렵다.
    - 팀 내 게임 로직이나 상황별 필요한 데이터 관련하여 공통된 양식(?) 같은 걸 공유하고 있지 못한 것 같다. (나만 모르는 걸가..)

  - **Try(새롭게 시도해볼 것들)**

    - 프론트 전체 일정을 나열하고 작업별 데드라인 및 분업을 다함께 논의해봐야 겠다.
    - 주말 간 전체 와이어 프레임 작업 재수정 하고 공통 컴포넌트 도출해낼 것
    - 3D 크리스마스 맵 블렌더에서 수정 필요 (필요 에셋 선별, texture 작업?)

### 🔖 09/19(목)

- [x] mixamo 기본 캐릭터 동작 병합 (대기 / 걷기 / 러닝)
- [x] 외부 3d 캐릭터 에셋에 애니메이션 적용
  - obj 형식에 image texture 입히기
  - fbx로 추출 후 mixamo에서 리깅
  - 해당 캐릭터 및 애니메이션 개별 다운
  - 애니메이션 선정: 대기 / 걷기 / 러닝 / 줍기 / 왼쪽 돌기 / 오른쪽 돌기
  - blender에서 nonlinear animation 작업 (캐릭터에 여러 동작 입히기)
  - gltf 형식으로 export
- [x] R3F에 gltf 형식의 애니메이션 캐릭터 띄우고 방향키로 애니메이션 제어
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 외부 3D 캐릭터에 texture를 입히고, 추출해서 리깅하고, 다시 NLA 처리하는 과정에서 처음 하는 작업들이었지만 겁먹지 않고 필요한 부분을 youtube 검색하여 학습하고 적용했다.
    - R3F에서 방향키로 캐릭터 애니메이션을 연동하는 과정에서 처음 해보는 부분이라 GPT의 도움을 많이 받았는데, 복붙만 하는 것이 아니라 해당 코드를 이해하기 위해 노력했다.

  - **Problem(문제되는 점들)**

    - 명절 간 해내야 할 일을 제대로 해내지 않아서 일정이 밀렸다. 반성한다..
    - 공통적으로 학습이 필요한 부분과 분업이 필요한 부분이 명확히 구분되지 않는 것 같다.
    - 캐릭터 이동에 있어 3D 맵의 경계 및 장애물 처리, 캐릭터 간 상호작용 처리가 필요할 것 같은데, 뭔가.. 아직 아는 게 없어서 그럴 수도 있지만 노가다 느낌이 나는 것 같아서 에셋 선정에 대한 마음이 조급해진다.

  - **Try(새롭게 시도해볼 것들)**

    - 백엔드에서 캐릭터 이동 작업이 선행되어야 뒷작업이 이루어진다는 것 같아 해당 부분을 빠르게 작업하면서 백엔드와 소통해야 겠다.
    - 다현이랑 좀 더 명확히 업무 분담을 해야겠다.
    - 경계/장애물/캐릭터 간 상호작용 처리에 대해 빠르게 테스트 해보고 에셋을 확정해야 할 것 같다.
    - 이번 주말 안에 꼭 피그마 컴포넌트 처리 완료 할 것 ㅎ..!

</details>

<details>
  <summary>3주차</summary>

### 🔖 09/13 (금)

- [x] 중간 발표 및 팀 / 팀원 평가
- [x] 캐릭터 여러 명 띄워보기
  - 렌더링 좀 오래 걸리는 문제 있음.
  - 3d 렌더링 완료 시간 콘솔 찍어보면 3초 정도 나오는데, 눈에 보이기는 더 늦게 뜸
- [x] 맵 활용 기획 논의
- [x] 추석 연휴 준비
  - 목표 설정
  - 역할 분담
  - 일정 관리 방법 논의
- [x] 캐릭터 동작 병합: 대기 - 걷기 - 달리기 - 줍기 - 점프 (진행 중)
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 본투비 발표자 가은님 덕에 너무 든든하게 훌륭한 발표를 마쳤다.
    - 맵 활용 방안에 대한 기획 회의가 있었는데, 지금까지 중 가장 활발하게 소통된 시간이었다. 늘 이렇게만 했으면 좋겠다!!!
    - 추석 연휴 일정 관리를 어떻게 할 지에 대한 논의가 이루어졌다.
    - 프로젝트 세팅 및 서버 통신, 방 생성 관련하여 한나님이 올려주신 코드를 꼼꼼하게 모두 확인했다. 코드를 천천히 잘 읽어 보는 것만으로 내가 하지 않은 부분에 대한 이해를 높이고, 학습할 수 있어 좋았다.
    - 오늘 사정상 먼저 본가 내려가신 정민님이 열심히 계속 작업 중이신 게 보여서 대단하다 생각했고, 나도 뭔가 더 열심히 해야 겠다는 생각이 들었다.
    - 팀원들이 우리 프로젝트의 목표와 스토리를 고려하여 에셋, 상태나 동작, 상황에 대한 타당성을 고민하는 모습들이 좋았다.

  - **Problem(문제되는 점들)**

    - 아직 컨셉 및 에셋이 정해지지 않았다.
    - 물론 캐릭터 동작 구현이나 3D 에셋 조작이 우리 프로젝트 상 큰 부분을 차지 하긴 하지만, 진짜 게임의 핵심이 되는 로직? 흐름? 컴포넌트나 상태 관리, 화면 구성 등에 대한 논의가 없어서 걱정이 된다.
    - 특히 프론트 동작과 백엔드 api 연결 과정이 어떻게 될런지 감이 안온다..?!

  - **Try(새롭게 시도해볼 것들)**

    - 코드 리뷰가 잘 이루어진다면 좋을 것 같다.
    - 캐릭터 동작 관련한 핵심 내용을 얼른 구현해서 다음 단계로 나아가야 겠다.
    - 피그마라도 변수화 작업 및 컴포넌트 작업을 빠르게 해두어야겠다. (나중에 해당 컴포넌트만 바꾸면 전체 화면 적용되도록)
    - back-front 간 주고 받는 데이터나 그 형식에 대해 잘 확인해야 할 것 같다.

### 🔖 09/12 (목)

- [x] 피그마 작업 - 공통 컴포넌트 분류 작업 하다가 STOP
- [x] 프로젝트 방향성 논의
- [x] 캐릭터 동작 구현 테스트
  - mixamo 활용
  - R3F로 blendar에서 내보낸 gltf 형식 캐릭터 애니메이션 동작 확인
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 일단은.. 프로젝트 방향성을 다시 잡았다.

      - R3F 활용
      - 거래소를 중앙으로 모아서 동시 거래 진행
      - 캐릭터 동작 추가
      - 집이라는 공간 활용을 위한 방안 고민중 (산 물 건 집에 갖고 들어가야 내 물건 확정, 그 전엔 누구든 뺏을 수 있음)

    - 프로젝트를 어떻게 하고 싶은 지 팀원 모두 자기 의견을 말하도록 명확히 지정하니까 방향성이 보였다.
    - 분업이 잘 이루어진 것 같다. (인프라/백엔드 로직/PPT/채팅방 연결/캐릭터 동작 테스트 등)
    - 구현 가능 여부에 대해 대충이라도 빠르게 테스트 해 보는 것이 좋은 것 같다.
    - 피그마 컴포넌트 작업을 조금씩 진행해 보고 있는데, 반복되는 컴포넌트가 많은 것 같아 잘 활용해보면 좋을 것 같다.

  - **Problem(문제되는 점들)**

    - 각자가 정확히 뭘 하고 있는 지는 모르겠다.
    - 개인 집 공간 활용 방안에 대한 고민이 필요하다.
    - 스토리 컨셉 및 에셋에 대한 고민이 필요하다.
    - 반복되는 컴포넌트가 많은 만큼 상태 변경 시 동기화 해주어야 하는 부분이 많아 상태 관리가 중요할 것 같다.

  - **Try(새롭게 시도해볼 것들)**

    - 데일리 스크럼에서 back, front 태그 보다 본인이 오늘 뭘 할 건지 명확히 본인 이름을 태그해서 작업하면 조금 더 상황 공유가 잘 이루어질 것 같다.
    - 캐릭터 동시 10명 렌더링 테스트
    - 캐릭터 하나에 여러 동작 심어두고, 해당 동작 들을 방향키로 어떻게 실행시킬 것인지 테스트 (대기 - 걷기 - 2초 이상 누르면 달리기?)

### 🔖 09/11 (수)

- [x] 피그마 작업 - 주식 변동
- [x] 피그마 작업 - 공통 컴포넌트 분류 작업 하다가 STOP
- [x] (피그마 기준) 게임 전체 배치 및 구성 논의
- [x] 5차 팀 미팅 (1:00 ~ 2:00)
- [x] R3F 강의 듣기
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 피그마 작업을 통해 임의로 전체 게임의 흐름을 구성해 보았고, 시각화된 자료가 있으니 소통 및 협업에 용이했다.
    - 고민되던 여러 부분들을 팀원과 함께 논의하며 어느 정도 가닥을 잡았다.
    - R3F 강의를 들으며 학습 중이다.

  - **Problem(문제되는 점들)**

    - 기획이 너무 길어진다.
    - 현재 우리가 진행 중인 프로젝트 구성, 프로젝트에 필요한 개선 점, 남은 일정까지 완성도, 기술적 구현 가능성 등을 모두 적절히 고려한 프로젝트 방향이 잘 잡히지 않고 모호하다.
    - 팀 미팅이 끝난 직후 팀 끼리 소통하는 시간이 없었어서 정체된 느낌을 받았다.
    - 여전히 소통이 적극적이지는 못한 느낌이고, 팀원 각각이 무슨 작업을 하고 있는 지 잘 공유되지 않는 것 같다.

  - **Try(새롭게 시도해볼 것들)**

    - 적극적으로 소통하여 프로젝트 컨셉이나 방향을 확정해야 할 것
    - 게임 설계에 대한 고민이 필요
    - R3F 학습 계속 해 나갈 것
    - 매일 데일리 스크럼 시 오늘 진행할 본인의 맡은 바를 잘 공유할 것
    - 발표 자료 준비 필요

### 🔖 09/10 (화)

- [x] 전체 일정 논의 (과업 배분)
- [x] 10시 실습 코치님 미팅
- [x] 피그마 작업 - 게임 전체 흐름도 (ing)
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 최종 발표까지 약 3단계로 나누어 큼직한 단위별로 업무 데드라인을 정했다.
    - 분업이 잘 이루어 진 것 같다.

  - **Problem(문제되는 점들)**

    - 피그마로 대략적인 화면 구성 및 흐름을 잡아 보니, 생각보다 분기도 많고, 생각치 못했던 지점에서 자잘한 사항들도 많은 편이라 구현에 시간이 더 오래 걸릴 것으로 생각된다.
    - 나눈다고 나눴음에도 결국 한 페이지에서 보여줘야 할 필요 데이터가 많은데, 어떻게 보여줘야 가장 효과적일지
    - 매도/매수 트랙이 애매한데, 어떻게 보여줘야 할 지, 최소화/시각화, 혹은 보여주지 않을 지?
    - 메인 판 / 개인 판 >>> 현 구성 뭔가 문제다..
    - 사용자 관점에서 이 복잡한 게임을 쉽게 접근하도록 하려면 어떻게 구성할 지
    - 피그마로 짜 본 게임 구성이 3D에서는 어떤 식으로 표현될 지, 사용자 간의 인터렉션에 따른 게임 흐름이 어떻게 되는 건지아직 감이 안 온다.
    - 내부적으로 로직 처리 한 결과 반영하거나, NPC와 대화 등의 과정에서 주어진 거래시간 20초 초과하는 것에 대한 문제

  - **Try(새롭게 시도해볼 것들)**

    - 일정 관리에 더욱 신경쓸 것
    - 게임 로직을 다시 한 번 점검해 보면서 효과적으로 데이터 보여줄 방법 고민할 것
    - 공통 컴포넌트 분류할 것
    - 게임 UI의 통일성을 위해 색상, 폰트 사이즈, border-radius 등 변수화
    - 3D 빨리 연습해 봐야 된다..

### 🔖 09/09 (월)

- [x] 전체적인 게임 흐름/구성 정리
- [x] 2주차 Jira 스프린트 이슈 등록
- [x] 프론트 과업 리스트 업
- [x] 프론트 컨벤션 정하기
- [x] 피그마 작업 - 게임 전체 흐름도 (ing)
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 게임 전체 흐름을 다 같이 논의하며 짚어봤다.
    - 프론트 컨벤션을 정했으니, 잘 지켜가면 좋을 것 같다.
    - 게임 전체 구성(어떤 데이터를 보여 줄 것이고, 어떤 식으로 배치 할 것인지) 및 흐름을 피그마로 대략 wireframe 작업하여, 협업 시 혼동되는 부분이 없도록 하는 중이다.

  - **Problem(문제되는 점들)**

    - 지라 관리가 엉망인 느낌이다.
    - 발표자, 영상 작업자 등 정해지지 않았다.
    - 주말 간 front / back 각각 전체 일정 상에 해야 할 모든 것들을 리스트 업 해보자고 하였으나, 하지 않은 사람이 많았다.
    - 웹 소켓 통신을 안 해봐서 어떤 식으로 소통하는 건지 감이 잘 안 잡힌다.
    - 3D 에셋 조작이 까다로운 것 같아서 걱정이다.
    - 어떻게 하면 데이터를 사용자가 이해하기 쉽게 배치할 수 있을 지, 어떤 애니메이션을 써야 효과적으로 보여줄 수 있을 지 고민이다.

  - **Try(새롭게 시도해볼 것들)**

    - 전체 일정 관리 및 효율적인 역할 배분이 필요하다.
    - R3F 에셋 다루는 연습을 빠르게 해봐야 겠다.
    - 상세 에셋, 데이터들의 배치 및 애니메이션에 대해 고민해봐야 겠다.

    </details>

<details>
  <summary>2주차</summary>

### 🔖 09/06(금)

- [x] git flow: 브랜치 전략 (이슈 생성 후 브랜치 생성)
- [x] convention 설정 (branch, commit)
- [x] 프론트 프로젝트 eslint 및 settings.json 설정
- [x] 게임 화면 구성 및 방향성 토의
  - Three.js ?
  - Unity ?
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 지금까지 중 가장 소통이 활발했던 날인 것 같다.
    - 팀원들끼리 방향성 논의를 위해 밖에 따로 모여서 회의 했을 때 팀원들의 집중도가 높아서 좋았다.
    - git flow, convention(branch, commit) / eslint 등 협업에 필요한 규칙들을 열심히 설정한 만큼 잘 유지해 나가면 좋겠다.
    - 열정적인 컨설턴트님과 코치님들 덕에 다양한 의견들을 얻을 수 있었고, 놓치고 있던 포인트들이나 본질에 대해 생각해 보게 되는 계기가 되었다.

  - **Problem(문제되는 점들)**

    - 핀테크 + 게임 접목이 다루기 까다로운 주제긴 한 것 같다.
    - 고려해 볼만한 다양한 요인들이 너무 많아서 우리 팀의 방향성이 많이 흔들린 하루였다.
    - 이제는 개발할 수 있을 줄 알았는데, 여전히 기획 단계에 머물러 있어 초조해진다.

  - **Try(새롭게 시도해볼 것들)**

    - R3F 및 Unity 각각 찾아보고, 실현가능성 생각해 볼 것
    - 유저 입장에서의 재미(게임적 요소) + 3D 에셋의 적절한 활용 방안(동적인 애니메이션) + 핀테크 개념 >>> 요 3가지를 어떻게 적절히 잘 나타낼 수 있을 지에 대한 고민
    - 계속 컨셉에만 신경 쓰고 있느라 놓치고 있던 실시간 통신에 대한 부분도 찾아 봐야 할 듯
    - 빠르게 방향성을 잡고 이제는 나아갈 것..ㅜ

### 🔖 09/05(목)

- [x] 게임 테마 UI 확정
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 게임 테마로 사용할 3D UI를 확정했다.
    - 끝도 없이 더 나은 것을 기대하며 찾기 보다, 앞으로의 로직 구현에 집중하기 위해 더 이상의 서칭은 멈추기로 했다.

  - **Problem(문제되는 점들)**

    - 지금까지는 팀 단위로 프론트 3명이 동일한 작업(컨셉 선정 및 UI 서칭)을 진행하느라 효율 측면에서는 부족했던 것 같다. 큰 틀이 잡혔으니, 이제부터는 역할 분담이 잘 이루어져야 할 것 같다.

  - **Try(새롭게 시도해볼 것들)**

    - 실제 게임 화면으로 구현해야 할 컴포넌트들의 세부 UI 에셋 서칭
    - R3F 학습
    - 프로젝트 초기 생성 완료 되면, 테마 UI 구매해서 바로 적용 도전해 볼 것

### 🔖 09/04(수)

- [x] 게임 UI 에셋 서칭
- [x] 게임 컨셉 및 테마 논의
- [x] 피그마 작업 및 UX 논의 (2D) => 폐기 예정..
- [x] 컨설턴트 님 및 코치 님 피드백 및 조언
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 백: 기능 명세서 및 순서도 설계 / 프론트: UI 에셋 서칭 및 화면 구성으로 나누어 팀 단위 작업이 잘 이루어졌다.
    - 에셋을 찾아보면서 막연하게 상상만 하기 보다 캡쳐라도 떠서 바로 바로 화면 구성을 띄워보며 테스트 하니까 잘 와 닿았다.
    - 컨설턴트님과 여러 코치님 들께 적극적으로 조언을 구하여, 현 문제점을 명확히 짚어볼 수 있었고, 앞으로의 방향성이 조금은 잡히는 것 같..았다.

  - **Problem(문제되는 점들)**

    - 정신 없다 보니 벌써부터 랩업 스크럼을 하지 않았고, 프론트 / 백 간 소통 시간도 부족했던 것 같다.
    - 마땅한 3D 에셋을 찾기가 쉽지 않다.
    - 2D 보드게임 느낌 그대로 세팅해 보았으나, 바다 이야기 UI 같다는 피드백에 뼈를 맞았고 / 페이지 구성 하나에 너무 정보가 많아 보기 싫어진다는 점 / 게임이라는 특성에 맞지 않게 정적이라는 점 등의 문제가 있었다.
    - 방향성이나 가닥은 잡히는 것 같은데, 이 기획을 구현해 낼 만한 기술력에 대한 학습 부족이 문제다..

  - **Try(새롭게 시도해볼 것들)**
    - **[조언] 에셋 자체에서 재미를 찾을 필요까지는 없을 것 같고, 월스트리트 같은 아예 주식시장 분위기로 잡아 버리는 것이 핀테크라는 분야가 살아날 것 같다. 재미는 게임 자체의 역동성과 UI의 화려함에서 찾을 것(시야 전환 크게)**
    - 보드게임이라는 굴레에서 벗어나서 3D로 구성
    - 분야 별(주식/금/대출)로 분리하고 컴포넌트화
    - 복잡한 게임 룰을 사용자 접근성 측면에서 쉽게 이해하고 조작하기 수월하도록 구현
    - 사용자에게 보여줘야 할 정보와 개발자 측 내부 로직으로만 처리해도 될 정보를 잘 구분해야겠다.
    - R3F에 대한 학습

### 🔖 09/03(화)

- [x] 블랙 프라이데이 보드게임 구매 문의
- [x] 전체 구성 논의 (로그인 / 방 생성 등)
- [x] 4차 팀 미팅 (1:00~2:00)
  - 재미를 잃지 말고, **게임 컨셉**을 명확히 잡아 볼 것
  - 부가적 기능보다 **메인 기능(게임)** 에 집중할 것
  - 요구사항 명세서 VS 기능 명세서 차이점
- [x] 기능 명세서 레이아웃 및 피그잼 생성
  - ![기능 명세서 예시](/uploads/4bc93eedd4740b9abe616fd649a5e47f/스크린샷_2024-09-03_오후_6.48.57.png)
  - ![피그잼 이미지 예시 1](/uploads/07951f0cc5140663f269752635eb648e/스크린샷_2024-09-03_오후_6.46.09.png)
  - ![피그잼 이미지 예시 2](/uploads/83c83bf4e68650f645e28182995f2286/스크린샷_2024-09-03_오후_6.46.55.png)
- [x] Figma 와이어 프레임 - 대략적 흐름만
  - ![와이어 프레임 - 대략적 흐름](/uploads/50930ef454a105cad945521e50d10a32/스크린샷_2024-09-03_오후_6.43.52.png)
- [x] 게임 UI 에셋 서칭 (ing)
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 팀 구성을 3 / 3 규모로 나눠서 진행하니까 효율도 높아지고 소통이 조금 더 원활해진 것 같다.
    - 부가적인 기능들보다 게임 자체에 우선 순위를 둔 점이 좋았다.
    - 팀원들이 새로운 것에 도전하려 하는 점이 좋았다.
    - 피그잼 순서도 및 UI 에셋 서칭 작업이 잘 이루어지고 있는 것 같다.

  - **Problem(문제되는 점들)**

    - 프론트 / 백이 각각의 팀 회의에서 논의한 내용들을 파트 서로 간에 잘 전달 할 수 있어야 할 것 같다.
    - 팀 미팅 전에 피드백 받고 싶은 부분들을 잘 추려 가면 좋을 것 같다.
    - 적절한 asset을 찾아서 게임에 어우러지도록 잘 배치하는 것, 애니메이션을 어떻게 적용할 지, 어떤 기준으로 게임 로직 api를 붙여야 할 지 등이 고민이다.

  - **Try(새롭게 시도해볼 것들)**
    - 프론트 논의 중 message 규약에 관한 이야기가 나왔는데, 프론트-백 간 협업 및 통일성을 잡아줄 수 있는 좋은 틀이 되어줄 것 같아서 제대로 소통하고 설정해야 겠다.

### 🔖 09/02(월)

- [x] 1주차 JIRA 스프린트 이슈 등록 및 시작
- [x] 블랙 프라이데이 룰 복기
- [x] 블랙 프라이데이 룰 및 진행 방법 정리
- [x] 블랙 프라이데이 룰 추가
  - 대출 및 상환
  - 경제 상황에 따른 금리 변동
- [x] 데일리 KPT 회고

  - **Keep (잘해오고 있는 것들)**

    - 플립을 활용해 게임 RULE을 다같이 복기하고, 발전시키는 시간을 가졌다.
    - 게임에 적용할 RULE들을 잘 문서화했다.

  - **Problem(문제되는 점들)**

    - 의사 소통에 적극적이었으면 좋겠다.

  - **Try(새롭게 시도해볼 것들)**
    - 설정한 RULE들을 어떻게 구현해 나갈 지.. 고민해 봐야 겠다.
    - 화면 구성 및 assets 찾아봐야 겠다.

</details>

<details>
  <summary>1주차</summary>

### 🔖 08/30(금)

- [x] 3차 팀 미팅 (1시)
- [x] 프로젝트 주제 디벨롭: 주식 마피아 => 폐기
- [x] 김재형 실습코치님 미팅: 프로젝트 아이디어(보드게임) 및 기술 스택 관련 조언 (5시)
- [x] 보드 게임 분야 프로젝트 아이디어 서칭/학습/체험 - 최종 후보 3개
  - 샤크 (건물 세우면서 주가 Up&Down 처리)
  - 어콰이어 (건물 세워서 기업 인수 합병 & 주식)
  - **블랙 프라이데이 => 새로운 주제로 선정 (주식 매수/매도 디테일 + 안전자산인 금)**
- [x] 1주차 KPT 회고
- [x] 강남 데빌다이스 보드 게임 카페 -> 보드 게임 체험 및 RULE 정리
  - ![2학기_특화_프로젝트-3](/uploads/d810f22bceff3f82333078acca04c971/2학기_특화_프로젝트-3.jpg)
  - ![2학기_특화_프로젝트-4](/uploads/b5d2c624b45401feb74f8bf9ac9decc2/2학기_특화_프로젝트-4.jpg)
  - ![2학기_특화_프로젝트-5](/uploads/c4f3d763747c4c2caafdcf31fe5cfa4e/2학기_특화_프로젝트-5.jpg)
  - ![2학기_특화_프로젝트-6](/uploads/a17ae466ff84b9d1125112d7d55ee167/2학기_특화_프로젝트-6.jpg)
  - ![2학기_특화_프로젝트-7](/uploads/9b6a3a694d10b8434c92b0c89890a402/2학기_특화_프로젝트-7.jpg)

### 🔖 08/29(목)

- [x] 프로젝트 기획 아이디어 서칭 및 회의
- [x] 프로젝트 기획 아이디어 선정 및 디벨롭 (ing)
  - 주식 마피아 게임
  - ![주식 마피아 게임 최초 기획](/uploads/c0d7b36b74b58b5c55e292187cf4fa8b/image.png)
- [x] 1차 전문가 리뷰 - 핀테크 KB 국민은행 이창환 대리님 (12시 30분)
- [x] 1차 전문가 리뷰 - 멘티 할동 일지 작성

### 🔖 08/28(수)

- [x] 프로젝트 기획 아이디어 서칭 및 회의
  - 개인 이미지에 맞는 향수 추천 사이트
  - 핀테크 다이어리 앱

### 🔖 08/27(화)

- [x] 프로젝트 기획 아이디어 서칭 및 회의
- [x] 2차 팀 미팅 (1시 30분)
  - 체크리스트 기반 결제 관리 앱
  - 주식 시뮬레이션
  - 탈북민 대상 지원금 안내 혹은 경제용어 교육
  - 프리랜서 특화 세금 및 회계 자동화 도구
  - 클린 임대인-사회초년생 신용 관리 연계 서비스
- [x] 전문가 리뷰 PPT 작성 및 제출
- [x] 취업 특강 (4시 ~ 6시)

</details>
