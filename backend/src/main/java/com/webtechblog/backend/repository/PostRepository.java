package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

}
