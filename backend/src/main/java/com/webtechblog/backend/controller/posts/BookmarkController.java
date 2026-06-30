package com.webtechblog.backend.controller.posts;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.helper.BookmarkHelper;
import com.webtechblog.backend.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookmark")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final BookmarkHelper bookmarkHelper;

    /**
     * Bookmark / Remove Bookmark
     */
    @PostMapping("/toggle/{postId}")
    public String toggleBookmark(@PathVariable Long postId) {

        return bookmarkService.toggleBookmark(postId);
    }

    /**
     * Get logged-in user's bookmarked posts
     */
    @GetMapping("/my")
    public List<PostResponse> getMyBookmarks() {

        return bookmarkService.getMyBookmarks();
    }

    /**
     * Check bookmark status of a post
     */
    @GetMapping("/status/{postId}")
    public boolean isBookmarked(@PathVariable Long postId) {

        return bookmarkHelper.isBookmarked(postId);
    }
}