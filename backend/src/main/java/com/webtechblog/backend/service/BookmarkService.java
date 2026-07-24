package com.webtechblog.backend.service;

import com.webtechblog.backend.dto.post.PostResponse;
import com.webtechblog.backend.entity.BookmarkEntity;
import com.webtechblog.backend.entity.PostEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.enums.ActivityType;
import com.webtechblog.backend.repository.BookmarkRepository;
import com.webtechblog.backend.repository.PostRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final CurrentUserService currentUserService;
    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final FeedService feedService;
    private final HistoryWriteService historyService;

    /**
     * Bookmark / Remove Bookmark
     */
    @Transactional
    public Map<String, Object> toggleBookmark(Long postId) {

        UserEntity user =
                currentUserService.getCurrentUser();

        Optional<BookmarkEntity> optional =
                bookmarkRepository.findByPostIdAndUserId(
                        postId,
                        user.getId()
                );

        boolean bookmarked;

        if (optional.isEmpty()) {

            BookmarkEntity bookmark =
                    BookmarkEntity.builder()
                            .postId(postId)
                            .userId(user.getId())
                            .status(1)
                            .build();

            bookmarkRepository.save(bookmark);

            postRepository.incrementBookmarkCount(postId);

            historyService.saveHistory(
                    postId,
                    ActivityType.BOOKMARK
            );

            bookmarked = true;

        } else {

            BookmarkEntity bookmark = optional.get();

            if (bookmark.getStatus() == 1) {

                bookmark.setStatus(0);

                bookmarkRepository.save(bookmark);

                postRepository.decrementBookmarkCount(postId);

                bookmarked = false;

            } else {

                bookmark.setStatus(1);

                bookmarkRepository.save(bookmark);

                postRepository.incrementBookmarkCount(postId);

                historyService.saveHistory(
                        postId,
                        ActivityType.BOOKMARK
                );

                bookmarked = true;
            }

        }

        Map<String, Object> response = new HashMap<>();

        response.put("bookmarked", bookmarked);

        response.put(
                "message",
                bookmarked
                        ? "Post bookmarked successfully"
                        : "Bookmark removed successfully"
        );

        System.out.println("Response = " + response);

        return response;
    }

    /**
     * Get all bookmarked posts of logged in user
     */
    public List<PostResponse> getMyBookmarks() {

        UserEntity user = currentUserService.getCurrentUser();

        List<Long> postIds = bookmarkRepository
                .findAllByUserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(),
                        1
                )
                .stream()
                .map(BookmarkEntity::getPostId)
                .toList();

        if (postIds.isEmpty()) {
            return List.of();
        }

        return feedService.getPostsByIds(postIds);
    }

}