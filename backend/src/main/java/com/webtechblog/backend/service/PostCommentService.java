    package com.webtechblog.backend.service;

    import com.webtechblog.backend.dto.post.PostCommentResponse;
    import com.webtechblog.backend.entity.PostCommentEntity;
    import com.webtechblog.backend.entity.PostEntity;
    import com.webtechblog.backend.entity.ProfileEntity;
    import com.webtechblog.backend.entity.UserEntity;
    import com.webtechblog.backend.repository.PostCommentRepository;
    import com.webtechblog.backend.repository.PostRepository;
    import com.webtechblog.backend.repository.ProfileRepository;
    import com.webtechblog.backend.repository.UserRepository;
    import jakarta.transaction.Transactional;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.stereotype.Service;

    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class PostCommentService {

        private final PostCommentRepository postCommentRepository;
            private final PostRepository postRepository;
            private final UserRepository userRepository;
            private final ProfileRepository profileRepository;

        public PostCommentResponse addComment(
                Long postId,
                String comment
        ) {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            String email = authentication.getName();

            UserEntity user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new IllegalArgumentException("User not found"));

            Long userId = user.getId();

            // Create comment entity
            PostCommentEntity entity = PostCommentEntity.builder()
                    .postId(postId)
                    .userId(userId)
                    .comment(comment)
                    .status(1)
                    .build();

            // Save comment
            PostCommentEntity savedComment =
                    postCommentRepository.save(entity);

            // Calculate latest comment count
            long commentCount =
                    postCommentRepository.countByPostIdAndStatus(postId, 1);

            // Update posts table
            postRepository.updateCommentCount(postId, commentCount);

            // Convert to response DTO
            PostCommentResponse response =
                    convertToResponse(savedComment);

            // Set latest comment count
            response.setCommentCount(commentCount);

            return response;
        }

        private PostCommentResponse convertToResponse(PostCommentEntity comment) {

            UserEntity user = userRepository
                    .findById(comment.getUserId())
                    .orElse(null);

            ProfileEntity profile = profileRepository
                    .findByUserId(comment.getUserId())
                    .orElse(null);

            return PostCommentResponse.builder()
                    .id(comment.getId())
                    .postId(comment.getPostId())
                    .userId(comment.getUserId())
                    .comment(comment.getComment())
                    .commentCount(postCommentRepository.countByPostIdAndStatus(comment.getPostId(),1))

                    .username(user != null ? user.getUsername() : null)

                    .firstName(profile != null ? profile.getFirstName() : null)
                    .lastName(profile != null ? profile.getLastName() : null)
                    .designation(profile != null ? profile.getDesignation() : null)
                    .profileImage(profile != null ? profile.getProfileImage() : null)

                    .createdAt(comment.getCreatedAt())
                    .build();
        }

        public List<PostCommentResponse> getComments(Long postId) {

            return postCommentRepository
                    .findByPostIdAndStatusOrderByCreatedAtDesc(postId, 1)
                    .stream()
                    .map(this::convertToResponse)
                    .toList();
        }

        public long getCommentCount(Long postId) {

            return postCommentRepository
                    .countByPostIdAndStatus(postId, 1);
        }

        @Transactional
        public PostCommentResponse deleteComment(Long commentId) {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            String email = authentication.getName();

            UserEntity user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new IllegalArgumentException("User not found"));

            Long userId = user.getId();

            PostCommentEntity comment =
                    postCommentRepository.findById(commentId)
                            .orElseThrow(() ->
                                    new RuntimeException("Comment not found"));

            // Validation: only the comment owner can delete it
            if (!comment.getUserId().equals(userId)) {
                throw new RuntimeException("You are not allowed to delete this comment.");
            }

            comment.setStatus(0);

            postCommentRepository.save(comment);

            long commentCount =
                    postCommentRepository.countByPostIdAndStatus(
                            comment.getPostId(), 1);

            postRepository.updateCommentCount(
                    comment.getPostId(), commentCount);

            PostCommentResponse response =
                    convertToResponse(comment);

            response.setCommentCount(commentCount);

            return response;
        }
    }