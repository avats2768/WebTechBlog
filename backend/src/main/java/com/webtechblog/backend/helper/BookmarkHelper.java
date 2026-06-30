package com.webtechblog.backend.helper;

import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.BookmarkRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookmarkHelper {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;

    public boolean isBookmarked(Long postId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow();

        return bookmarkRepository
                .findByPostIdAndUserId(postId, user.getId())
                .map(bookmark -> bookmark.getStatus() == 1)
                .orElse(false);
    }
}
