import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  const topic = `/sub/${roomId}/room`;
  const subscriptionId = `sub-${roomId}0`;

  // 방 나가기
  const leaveRoom = (sender: string) => {
    if (!socket) {
      console.log('소켓 연결이 되어 있지 않음');
      return;
    }

    // 구독 해제
    socket.unsubscribe(subscriptionId);

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
      topic,
      message => {
        console.log('대기방 구독', JSON.parse(message.body));
        const parsedMessage = JSON.parse(message.body);
        console.log('parsedMessage.message:', parsedMessage.message);
        switch (parsedMessage.message) {
          case 'ENTER_SUCCESS':
            const playerList = parsedMessage.room.inRoomPlayers;
            const playerNicknames = playerList.map(
              (player: { nickname: string }) => player.nickname,
            );

            setPlayers(playerNicknames);
            break;
          case 'ENTER_FAILURE ':
            break;
          case 'PREPARE_GAME_START  ':
            break;
          case 'PLAYER_LEAVED ':
            break;
          case 'START_BUTTON_CLICKED ':
            break;
          case 'RENDER_COMPLETE_ACCEPTED ':
            break;
          case 'ALL_RENDERED_COMPLETED ':
            break;
        }
      },
      { id: subscriptionId },
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
      `/sub/${roomId}/chat`,
      message => {
        console.log('채팅 메시지', JSON.parse(message.body));
        const parsedMessage = JSON.parse(message.body);
        if (parsedMessage.data) {
          const sender = parsedMessage.data.sender;
          const content = parsedMessage.data.content;
          setChatMessages(prevMessages => [
            ...prevMessages,
            { sender, content },
          ]);
          console.log('chatMessages 상태:', chatMessages);
        }
      },
      { id: `chat-${roomId}` },
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

    console.log('전송할 메시지:', messagePayload);

    // 방에 들어간 메시지 전송
    socket.publish({
      destination: `/pub/${roomId}/chat`,
      body: JSON.stringify(messagePayload),
    });
  };

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
    }),
    [socket, online, players, chatMessages],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
