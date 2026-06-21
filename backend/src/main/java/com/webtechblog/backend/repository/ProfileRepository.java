package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {
    Optional<ProfileEntity> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
