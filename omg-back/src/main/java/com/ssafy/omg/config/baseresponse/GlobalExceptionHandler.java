package com.ssafy.omg.config.baseresponse;


import com.ssafy.omg.domain.socket.dto.StompExceptionPayload;
import com.ssafy.omg.domain.socket.dto.StompResponsePayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private final SimpMessageSendingOperations messagingTemplate;
	private static final String GAME_EXCEPTION = "GAME_EXCEPTION";

	@ExceptionHandler(MessageException.class)
	public void handleMessageException(MessageException e) {
		String roomId = e.getRoomId();
		MessageResponseStatus status = e.getStatus();
		log.info("roomId: {}, {}", roomId, status.getMessage());
		StompExceptionPayload payload = new StompExceptionPayload(GAME_EXCEPTION, e.getSender());
		messagingTemplate.convertAndSend("/sub/" + roomId + "/game", payload);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public BaseResponse<String> handleValidationExceptions() {
		return new BaseResponse<>(BaseResponseStatus.REQUEST_ERROR);
	}

	@ExceptionHandler(BaseException.class)
	public BaseResponse<String> handleBaseException(BaseException ex) {
		return new BaseResponse<>(ex.getStatus());
	}

	@ExceptionHandler(Exception.class)
	public BaseResponse<String> handleGeneralException(Exception ex) {
		return new BaseResponse<>(BaseResponseStatus.SERVER_ERROR);
	}
}

