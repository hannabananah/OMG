package com.ssafy.omg.domain.chat.controller;

import com.ssafy.omg.domain.chat.dto.ChatMessage;
import com.ssafy.omg.domain.chat.service.ChatbotService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatbotService chatbotService;

//    @MessageMapping("/chat/{roomId}")
//    public void chat(@DestinationVariable String roomId, ChatMessage chatMessage) {
//        messagingTemplate.convertAndSend("/sub/rooms/" + roomId, chatMessage);
//    }

    @MessageMapping("/{roomId}/chat")
    public void chat(@Payload StompPayload<ChatMessage> chatMessage) {
//        System.out.println("Received message: " + chatMessage); // 로그 찍어보기
        messagingTemplate.convertAndSend("/sub/" + chatMessage.getRoomId() + "/chat", chatMessage);
    }

}
