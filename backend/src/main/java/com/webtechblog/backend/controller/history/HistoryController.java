package com.webtechblog.backend.controller.history;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.service.HistoryReadService;
import com.webtechblog.backend.service.HistoryWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryReadService historyReadService;

    /**
     * Get complete activity history
     */
    @GetMapping
    public List<PostResponse> getHistory() {

        return historyReadService.getHistory();
    }

    /**
     * Get history by activity type
     *
     * Example:
     * GET /history/VIEW
     * GET /history/LIKE
     * GET /history/COMMENT
     * GET /history/BOOKMARK
     */
    @GetMapping("/{activityType}")
    public List<PostResponse> getHistoryByType(
            @PathVariable ActivityType activityType
    ) {

        return historyReadService.getHistory(activityType);
    }
}
