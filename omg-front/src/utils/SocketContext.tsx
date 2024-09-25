import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useRoomStore } from '@/stores/room';
import { Client } from '@stomp/stompjs';

interface ChatMessage {
  sender: string;
  content: string;
}

interface SocketContextType {
  socket: Client | null;
  online: boolean;
  players: string[];
  chatMessages: ChatMessage[];
  connect: () => void;
  disconnect: () => void;
  waitingSubscription: () => void;
  leaveRoom: (sender: string) => void;
  chatSubscription: () => void;
  sendMessage: (msg: string) => void;
  hostPlayer: string | null;
  startGame: () => void;
  rendered_complete: () => void;
}

const defaultContextValue: SocketContextType = {
  socket: null,
  online: false,
  players: [],
  chatMessages: [],
  connect: () => {},
  disconnect: () => {},
  waitingSubscription: () => {},
  leaveRoom: () => {},
  chatSubscription: () => {},
  sendMessage: () => {},
  hostPlayer: '',
  startGame: () => {},
  rendered_complete: () => {},
};

export const SocketContext =
  createContext<SocketContextType>(defaultContextValue);

interface SocketProviderProps {
  children: ReactNode;
}

export default function SocketProvider({ children }: SocketProviderProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const { sender } = useRoomStore();
  const base_url = import.meta.env.VITE_APP_SOCKET_URL;
  const [socket, setSocket] = useState<Client | null>(null);
  const [online, setOnline] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hostPlayer, setHostPlayer] = useState<string | null>(null);
  const navigate = useNavigate();

  const roomTopic = `/sub/${roomId}/room`;
  const chatTopic = `/sub/${roomId}/chat`;
  // const gameTopic = `/sub/${roomId}/game`;
  const subRoomId = `room-${roomId}`;
  const subChatId = `chat-${roomId}`;

  // 방 나가기
  const leaveRoom = (sender: string) => {
    if (!socket) {
      console.log('소켓 연결이 되어 있지 않음');
      return;
    }
    // 구독 해제
    socket.unsubscribe(subRoomId);

    const leaveMessagePayload = {
      roomId,
      sender,
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
  const waitingSubscription = () => {
    if (!socket || !socket.connected) {
      console.log('소켓이 아직 연결되지 않았습니다.');
      return;
    }
    socket.subscribe(
      roomTopic,
      message => {
        console.log('대기방 구독', JSON.parse(message.body));
        const parsedMessage = JSON.parse(message.body);
        console.log('parsedMessage.message:', parsedMessage.message);
        switch (parsedMessage.message) {
          case 'ENTER_SUCCESS':
            const playerList = parsedMessage.room.inRoomPlayers;
            const hostPlayer = parsedMessage.room.hostNickname;
            const playerNicknames = playerList.map(
              (player: { nickname: string }) => player.nickname,
            );
            setPlayers(playerNicknames);
            setHostPlayer(hostPlayer);
            break;
          case 'ENTER_FAILURE':
            break;
          case 'PREPARE_GAME_START':
            break;
          case 'LEAVE_ROOM':
            setPlayers(prevPlayers =>
              prevPlayers.filter(player => player !== parsedMessage.sender),
            );
            break;
          case 'START_BUTTON_CLICKED':
            // TODO: 게임 시작 알림->음향? 텍스트? 유저들에게 보여주기
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
            break;
        }
      },
      { id: subRoomId },
    );
    const messagePayload = {
      roomId,
      sender,
      message: 'ENTER_ROOM',
    };

    // 방에 들어간 메시지 전송
    socket.publish({
      destination: '/pub/room',
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
    if (!socket || !socket.connected) {
      console.log('소켓이 아직 연결되지 않았습니다.');
      return;
    }
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
    if (!socket || !socket.connected) {
      console.log('소켓이 아직 연결되지 않았습니다.');
      return;
    }
    const messagePayload = {
      type: 'CHAT',
      roomId,
      sender,
      data: {
        sender,
        content: message,
      },
    };

    // 방에 들어간 메시지 전송
    socket.publish({
      destination: `/pub/${roomId}/chat`,
      body: JSON.stringify(messagePayload),
    });
  };

  // 개별 유저 렌더링 완료 전송
  const rendered_complete = () => {
    if (!socket || !socket.connected) {
      console.log('소켓이 아직 연결되지 않았습니다.');
      return;
    }
    const messagePayload = {
      roomId,
      sender,
      message: 'RENDERED_COMPLETE',
    };

    // 방에 들어간 메시지 전송
    socket.publish({
      destination: `/pub/room`,
      body: JSON.stringify(messagePayload),
    });
  };

  // 게임방 구독

  // 게임시작 메시지 전송
  const startGame = () => {
    if (!socket || !socket.connected) {
      console.log('소켓이 아직 연결되지 않았습니다.');
      return;
    }

    const startMessagePayload = {
      roomId,
      sender,
      message: 'START_BUTTON_CLICKED',
    };

    socket.publish({
      destination: '/pub/room',
      body: JSON.stringify(startMessagePayload),
    });
  };

  useEffect(() => {
    if (socket && online && location.pathname === `/game/${roomId}`) {
      // game방으로 갈 시 채팅방 구독 유지
      chatSubscription();
    }

    return () => {
      if (socket && online && location.pathname !== `/game/${roomId}`) {
        // game방으로 아닐 때 채팅 구독 해제
        socket.unsubscribe(subChatId);
      }
    };
  }, [socket, online, roomId]);

  const contextValue = useMemo(
    () => ({
      socket,
      online,
      players,
      chatMessages,
      connect,
      disconnect,
      waitingSubscription,
      leaveRoom,
      chatSubscription,
      sendMessage,
      hostPlayer,
      startGame,
      rendered_complete,
    }),
    [socket, online, players, chatMessages],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
