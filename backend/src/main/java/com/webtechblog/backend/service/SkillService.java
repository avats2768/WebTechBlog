package com.webtechblog.backend.service;

import com.webtechblog.backend.entity.SkillEntity;
import com.webtechblog.backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillEntity> getAllSkills() {

        return skillRepository.findAll();
    }

    public SkillEntity getSkillById(Long id) {

        return skillRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Skill not found"));
    }

    public SkillEntity createSkill(
            SkillEntity skill
    ) {

        return skillRepository.save(skill);
    }

    public SkillEntity updateSkill(
            Long id,
            SkillEntity updatedSkill
    ) {

        SkillEntity skill =
                getSkillById(id);

        skill.setName(
                updatedSkill.getName()
        );

        skill.setTerminology(
                updatedSkill.getTerminology()
        );

        skill.setStatus(
                updatedSkill.getStatus()
        );

        return skillRepository.save(skill);
    }

    public List<SkillEntity> getSkillsByIds(List<Long> ids) {

        return skillRepository.findByIdIn(ids);
    }

    public void deleteSkill(Long id) {

        skillRepository.deleteById(id);
    }
}