package com.webtechblog.backend.helper;

import com.webtechblog.backend.entity.PostLikeEntity;
import com.webtechblog.backend.entity.UserEntity;
import com.webtechblog.backend.repository.PostLikeRepository;
import com.webtechblog.backend.repository.UserRepository;
import com.webtechblog.backend.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LikeHelper {

    private final PostLikeRepository postLikeRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public boolean isLiked(Long postId) {

        UserEntity user =
                currentUserService.getCurrentUser();

        Optional<PostLikeEntity> like =
                postLikeRepository.findByPostIdAndUserId(
                        postId,
                        user.getId()
                );

        return like
                .map(l -> l.getStatus() == 1)
                .orElse(false);
    }
}
