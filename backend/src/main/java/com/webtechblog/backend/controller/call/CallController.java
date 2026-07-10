package com.webtechblog.backend.controller.call;

import com.webtechblog.backend.dto.ApiResponse;
import com.webtechblog.backend.service.call.CallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/call")
@RequiredArgsConstructor
public class CallController {

    private final CallService callService;

    @GetMapping("/history")
    public ApiResponse<?> getMyCallHistory() {

        return ApiResponse.builder()
                .success(true)
                .data(callService.getMyCallHistory())
                .build();
    }

    @GetMapping("/history/{roomUuid}")
    public ApiResponse<?> getRoomCallHistory(
            @PathVariable String roomUuid
    ) {

        return ApiResponse.builder()
                .success(true)
                .data(callService.getRoomCallHistory(roomUuid))
                .build();
    }
}
