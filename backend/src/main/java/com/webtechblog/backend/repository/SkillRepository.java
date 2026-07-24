package com.webtechblog.backend.repository;

import com.webtechblog.backend.entity.SkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SkillRepository
        extends JpaRepository<SkillEntity, Long> {

    List<SkillEntity> findByIdIn(Collection<Long> ids);

}