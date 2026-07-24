package com.webtechblog.backend.controller.posts;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.SkillEntity;
import com.webtechblog.backend.helper.LikeHelper;
import com.webtechblog.backend.service.PostLikeService;
import com.webtechblog.backend.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/post/likes")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;
    private final LikeHelper likeHelper;

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLike(
            @RequestParam Long postId
    ) {

        boolean liked = postLikeService.toggleLike(postId);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", postLikeService.getLikeCount(postId));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<?> getLikeCount(@PathVariable Long postId) {

        return ResponseEntity.ok(postLikeService.getLikeCount(postId));
    }

    @GetMapping("/status")
    public ResponseEntity<?> isLiked(
            @RequestParam Long postId
    ) {

        return ResponseEntity.ok(likeHelper.isLiked(postId));
    }

    @GetMapping("/liked")
    public List<PostResponse> getMyLikedPosts() {
        return postLikeService.getMyLikedPosts();
    }

}
