package com.webtechblog.backend.helper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtechblog.backend.entity.SkillEntity;
import com.webtechblog.backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SkillsHelper {

    private final SkillRepository skillRepository;

    public List<String> getSkillNames(String skillsJson) {

        try {

            ObjectMapper objectMapper = new ObjectMapper();

            List<Long> skillIds = objectMapper.readValue(
                    skillsJson,
                    new TypeReference<List<Long>>() {}
            );

            return skillRepository
                    .findAllById(skillIds)
                    .stream()
                    .map(SkillEntity::getName)
                    .toList();

        } catch (Exception e) {
            return List.of();
        }
    }
}