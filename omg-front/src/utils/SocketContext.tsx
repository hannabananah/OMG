import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useSocketMessage } from '@/stores/useSocketMessage';
import useUser from '@/stores/useUser';
import type { ChatMessage, Player } from '@/types';
import { Client } from '@stomp/stompjs';

interface SocketContextType {
  socket: Client | null;
  online: boolean;
  player: string[];
  chatMessages: ChatMessage[];
  connect: () => void;
  disconnect: () => void;
  roomSubscription: () => void;
  leaveRoom: () => void;
  chatSubscription: () => void;
  sendMessage: (msg: string) => void;
  hostPlayer: string | null;
  startGame: () => void;
  rendered_complete: () => void;
  gameSubscription: () => void;
  players: Player[];
  moveCharacter: (position: number[], direction: number[]) => void;
}

const defaultContextValue: SocketContextType = {
  socket: null,
  online: false,
  player: [],
  chatMessages: [],
  connect: () => {},
  disconnect: () => {},
  roomSubscription: () => {},
  leaveRoom: () => {},
  chatSubscription: () => {},
  sendMessage: () => {},
  hostPlayer: '',
  startGame: () => {},
  rendered_complete: () => {},
  gameSubscription: () => {},
  players: [],
  moveCharacter: () => {},
};

export const SocketContext =
  createContext<SocketContextType>(defaultContextValue);

interface SocketProviderProps {
  children: ReactNode;
}

export default function SocketProvider({ children }: SocketProviderProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const { nickname } = useUser();
  const base_url = import.meta.env.VITE_APP_SOCKET_URL;
  const { setRoomMessage, setGameMessage } = useSocketMessage();
  const [socket, setSocket] = useState<Client | null>(null);
  const [online, setOnline] = useState(false);
  const [player, setPlayer] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hostPlayer, setHostPlayer] = useState<string | null>(null);
  const navigate = useNavigate();

  const roomTopic = `/sub/${roomId}/room`;
  const chatTopic = `/sub/${roomId}/chat`;
  const gameTopic = `/sub/${roomId}/game`;
  const subRoomId = `room-${roomId}`;
  const subChatId = `chat-${roomId}`;
  const subGameId = `game-${roomId}`;

  // 소켓 연결 상태 확인 함수
  const isSocketConnected = () => {
    if (!socket || !socket.connected) {
      console.log('소켓이 아직 연결되지 않았습니다.');
      return false;
    }
    return true;
  };

  // 방 나가기
  const leaveRoom = () => {
    if (!isSocketConnected()) return;

    // 구독 해제
    socket.unsubscribe(subRoomId);

    const leaveMessagePayload = {
      roomId,
      sender: nickname,
      message: 'LEAVE_ROOM',
    };

    socket.publish({
      destination: '/pub/room',
      body: JSON.stringify(leaveMessagePayload),
    });
  };

  // 소켓 연결
  const connect = () => {
    const stompClient = new Client({
      brokerURL: base_url,
      debug: str => console.log(str),
      onConnect: () => {
        setSocket(stompClient);
        setOnline(true);
      },
      onDisconnect: () => {
        setSocket(null);
        setOnline(false);
      },
    });
    stompClient.activate();
  };

  // 소켓 해제
  const disconnect = () => {
    if (socket) {
      socket.deactivate();
      setSocket(null);
      setOnline(false);
    }
  };

  // 대기방 구독
  const roomSubscription = () => {
    if (!isSocketConnected()) return;

    socket.subscribe(
      roomTopic,
      message => {
        const parsedMessage = JSON.parse(message.body);
        console.log('대기방 구독', parsedMessage);
        setRoomMessage(parsedMessage);
        switch (parsedMessage.message) {
          case 'ENTER_SUCCESS':
            const playerList = parsedMessage.room.inRoomPlayers;
            const hostPlayer = parsedMessage.room.hostNickname;
            const playerNicknames = playerList.map(
              (player: { nickname: string }) => player.nickname,
            );
            setPlayer(playerNicknames);
            setHostPlayer(hostPlayer);
            break;
          case 'ENTER_FAILURE':
            break;
          case 'PREPARE_GAME_START':
            break;
          case 'LEAVE_ROOM':
            setPlayer(prevPlayers =>
              prevPlayers.filter(player => player !== parsedMessage.sender),
            );
            break;
          case 'START_BUTTON_CLICKED':
            console.log('호스트가 게임을 시작했습니다');
            navigate(`/game/${roomId}`);
            break;
          case 'RENDERED_COMPLETE':
            if (parsedMessage.roomId === roomId && parsedMessage.sender) {
              console.log(
                `${parsedMessage.sender} 님의 렌더링이 완료되었습니다.`,
              );
            }
            break;
          case 'ALL_RENDERED_COMPLETED':
            console.log('모든 렌더링이 완료되었습니다.');
            socket.unsubscribe(subRoomId);
            gameSubscription();
            chatSubscription();
            break;
        }
      },
      { id: subRoomId },
    );

    const messagePayload = {
      roomId,
      sender: nickname,
      message: 'ENTER_ROOM',
    };
    console.log(messagePayload);

    socket.publish({
      destination: '/pub/room',
      body: JSON.stringify(messagePayload),
    });
  };

  // 게임방 구독
  const gameSubscription = () => {
    if (!isSocketConnected()) return;

    socket.subscribe(
      gameTopic,
      message => {
        const parsedMessage = JSON.parse(message.body);
        console.log('게임방 구독', parsedMessage);
        setGameMessage(parsedMessage);

        const gameInfo = parsedMessage.data;
        switch (gameInfo.message) {
          case 'GAME_INITIALIZED':
            const { players } = gameInfo.game;
            setPlayers(players);
            break;
          case 'GAME_EVENT':
            break;
        }
      },
      { id: subGameId },
    );

    const messagePayload: {
      roomId: string;
      type: string;
      sender: string;
      data: null | object;
    } = {
      type: 'test',
      roomId,
      sender: nickname,
      data: null,
    };
    console.log('messagePayload', messagePayload);

    socket.publish({
      destination: '/pub/game-initialize',
      body: JSON.stringify(messagePayload),
    });
  };

  useEffect(() => {
    if (roomId) {
      disconnect(); // 기존 소켓이 있으면 해제 후
      connect();
    }

    return () => {
      disconnect();
    };
  }, [roomId]);

  // 채팅방 구독
  const chatSubscription = () => {
    if (!isSocketConnected()) return;

    socket.subscribe(
      chatTopic,
      message => {
        const parsedMessage = JSON.parse(message.body);
        if (parsedMessage.data) {
          const sender = parsedMessage.data.sender;
          const content = parsedMessage.data.content;
          setChatMessages(prevMessages => [
            ...prevMessages,
            { sender, content },
          ]);
        }
      },
      { id: subChatId },
    );
  };

  // 채팅 메세지 전송
  const sendMessage = (message: string) => {
    if (!isSocketConnected()) return;

    const messagePayload = {
      type: 'CHAT',
      roomId,
      sender: nickname,
      data: {
        sender: nickname,
        content: message,
      },
    };

    socket.publish({
      destination: `/pub/${roomId}/chat`,
      body: JSON.stringify(messagePayload),
    });
  };

  // 개별 유저 렌더링 완료 전송
  const rendered_complete = () => {
    if (!isSocketConnected()) return;

    const messagePayload = {
      roomId,
      sender: nickname,
      message: 'RENDERED_COMPLETE',
    };

    socket.publish({
      destination: '/pub/room',
      body: JSON.stringify(messagePayload),
    });
  };

  // 게임시작
  const startGame = () => {
    if (!isSocketConnected()) return;

    const startMessagePayload = {
      roomId,
      sender: nickname,
      message: 'START_BUTTON_CLICKED',
    };

    socket.publish({
      destination: '/pub/room',
      body: JSON.stringify(startMessagePayload),
    });
  };

  // 캐릭터 이동
  const moveCharacter = (position: number[], direction: number[]) => {
    if (!isSocketConnected()) return;

    const messagePayload = {
      type: 'PLAYER_MOVE',
      roomId,
      sender: nickname,
      data: {
        position,
        direction,
      },
    };

    socket.publish({
      destination: '/pub/player-move',
      body: JSON.stringify(messagePayload),
    });
  };

  const contextValue = useMemo(
    () => ({
      socket,
      online,
      player,
      chatMessages,
      connect,
      disconnect,
      roomSubscription,
      leaveRoom,
      chatSubscription,
      sendMessage,
      hostPlayer,
      startGame,
      rendered_complete,
      gameSubscription,
      players,
      moveCharacter,
    }),
    [socket, online, player, players, chatMessages],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
