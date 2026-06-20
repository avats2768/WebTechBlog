package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.SkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository
        extends JpaRepository<SkillEntity, Long> {
}