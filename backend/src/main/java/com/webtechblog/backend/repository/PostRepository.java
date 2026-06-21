package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

    List<PostEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PostEntity> findAllByOrderByCreatedAtDesc();

}