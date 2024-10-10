// game-access-level.png 적용

export const introduction = {
  header: '돈과 금, 그 이상의 가치를 찾을 수 있는 전략 금융 게임',
  content:
    'loremIpsum dolor sit amet, consectetur adipiscing el aspect, sed do eiusmod tempor incididunt ut lab et dolore magna aliqua. Ut enim ad minim ven',
  // setTimeout 적용하여 tips는 3초 후에 띄워지게
  tips: [
    {
      title: '게임 시작 직후',
      //  tips1에 아래 방향키 적용 import { TbSquareArrowDown } from 'react-icons/tb';
      content:
        '아래 방향키를 눌러 잠들어있던 캐릭터를 깨워야 움직일 수 있어요!',
    },
    // import { TbSquareArrowLeft } from "react-icons/tb";
    // import { TbSquareArrowRightFilled } from "react-icons/tb";
    // import { TbSquareArrowUp } from "react-icons/tb";
    {
      title: '게임 방향키 조작법',
      content:
        '좌우로는 방향 전환을! 위 방향키는 앞으로 나아가고 아래 방향키는 뒤로 갈 수 있어요. 최대한 포장된 길을 따라 걸어야 위험에 빠지지 않아요!',
    },
    {
      title: '화면 구성',
      content:
        '상단에는 실시간으로 금전 거래에 관한 현황이 보여지고, 중앙 하단에는 본인의 아이템, 금, 대출 정보를 한눈에 볼 수 있어요!. 좌측 하단의 챗 버튼을 눌러 함께 플레이를 하는 유저들과 대화도 해보세요!',
    },
    {
      title: '미니맵',
      content:
        '좌측상단에서 전체 맵을 한눈에 볼 수 있는 미니맵을 통해 아이템 거래소, 은행, 금 거래소 그리고 내 집을 확인할 수 있어요! 다른 유저들의 이동도 확인할 수 있으니 참고하세요.',
    },
    {
      title: '게임 시작 전, 판 세팅',
      content:
        '플레이어마다 랜덤하게 아이템 다섯 개를 받고 시작합니다! 초기 보유자산은 $100입니다.',
    },
    {
      title: '금리 원리 적용',
      content:
        '금리는 세 가지 산업군으로 나뉘어진 다섯 가지 아이템과 대출에 영향을 미칩니다. 금리 추이는 매라운드 이벤트 카드를 보고 다음 라운드의 금리 변동을 예측할 수 있습니다.',
    },
    {
      title: '최종 승리 조건',
      content:
        '마지막 라운드인 10라운드를 마치면 해당 시점 기준으로 보유자산+(최종 아이템 가격*아이템 개수)+(최종 금가격*금 개수)-대출 행위를 합산하여 자산이 높은 순으로 순위가 매겨집니다. 최대한 전략적인 투자를 통해 많은 자산을 보유하세요!',
    },
  ],
  footer: 'powered by RTF',
};
