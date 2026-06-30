package com.webtechblog.backend.helper;

import com.webtechblog.backend.entity.PostLikeEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.PostLikeRepository;
import com.webtechblog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LikeHelper {

    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;

    public boolean isLiked(Long postId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        UserEntity user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow();

        PostLikeEntity like =
                postLikeRepository.findByPostIdAndUserId(
                        postId,
                        user.getId()
                );

        return like != null && like.getStatus() == 1;
    }
}
