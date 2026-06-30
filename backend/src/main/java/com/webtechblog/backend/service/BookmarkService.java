package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.BookmarkEntity;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.helper.PostResponseHelper;
import com.webtechblog.backend.repository.BookmarkRepository;
import com.webtechblog.backend.repository.PostRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final PostResponseHelper postResponseHelper;
    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HistoryWriteService historyService;

    /**
     * Bookmark / Remove Bookmark
     */
    public String toggleBookmark(Long postId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        PostEntity post =
                postRepository
                        .findById(postId)
                        .orElseThrow(() ->
                                new RuntimeException("Post not found"));

        BookmarkEntity bookmark =
                bookmarkRepository
                        .findByPostIdAndUserId(postId, user.getId())
                        .orElse(null);

        if (bookmark == null) {

            bookmark = BookmarkEntity.builder()
                    .postId(postId)
                    .userId(user.getId())
                    .status(1)
                    .build();

            bookmarkRepository.save(bookmark);

            post.setBookmarkCount(post.getBookmarkCount() + 1);
            postRepository.save(post);

            return "Post bookmarked successfully";
        }

        if (bookmark.getStatus() == 1) {

            bookmark.setStatus(0);

            if (post.getBookmarkCount() > 0) {
                post.setBookmarkCount(post.getBookmarkCount() - 1);
            }

            bookmarkRepository.save(bookmark);
            postRepository.save(post);

            return "Bookmark removed successfully";
        }

        bookmark.setStatus(1);

        post.setBookmarkCount(post.getBookmarkCount() + 1);

        historyService.saveHistory(
                postId,
                ActivityType.BOOKMARK
        );

        bookmarkRepository.save(bookmark);
        postRepository.save(post);

        return "Post bookmarked successfully";
    }

    /**
     * Get all bookmarked posts of logged in user
     */
    public List<PostResponse> getMyBookmarks() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity loggedUser =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return bookmarkRepository
                .findAllByUserIdAndStatusOrderByCreatedAtDesc(
                        loggedUser.getId(),
                        1
                )
                .stream()
                .map(bookmark -> postRepository.findById(bookmark.getPostId()).orElse(null))
                .filter(Objects::nonNull)
                .map(postResponseHelper::build)
                .toList();
    }

}