package com.webtechblog.backend.controller.posts;

import com.webtechblog.backend.dto.post.PostCommentResponse;
import com.webtechblog.backend.entity.PostCommentEntity;
import com.webtechblog.backend.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/post/comments")
@RequiredArgsConstructor
public class PostCommentController {

    private final PostCommentService postCommentService;

    @PostMapping("/add")
    public ResponseEntity<?> addComment(
            @RequestParam Long postId,
            @RequestParam String comment
    ) {

        PostCommentResponse savedComment =
                postCommentService.addComment(postId, comment);

        return ResponseEntity.ok(savedComment);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {

        return ResponseEntity.ok(postCommentService.getComments(postId));
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<?> getCommentCount(@PathVariable Long postId) {

        return ResponseEntity.ok(postCommentService.getCommentCount(postId));
    }

    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {

        postCommentService.deleteComment(commentId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Comment deleted successfully");

        return ResponseEntity.ok(response);
    }

}
