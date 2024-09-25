package com.ssafy.omg.config.baseresponse;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BaseException extends Exception {
	private final BaseResponseStatus status;
}
