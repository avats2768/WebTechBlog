package com.webtechblog.backend.controller.skills;


import com.webtechblog.backend.entity.SkillEntity;
import com.webtechblog.backend.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public List<SkillEntity> getAllSkills() {

        return skillService.getAllSkills();
    }

    @GetMapping("/{id}")
    public SkillEntity getSkill(
            @PathVariable Long id
    ) {

        return skillService.getSkillById(id);
    }

    @PostMapping
    public SkillEntity createSkill(
            @RequestBody SkillEntity skill
    ) {

        return skillService.createSkill(skill);
    }

    @PutMapping("/{id}")
    public SkillEntity updateSkill(
            @PathVariable Long id,
            @RequestBody SkillEntity skill
    ) {

        return skillService.updateSkill(
                id,
                skill
        );
    }

    @PostMapping("/by-ids")
    public List<SkillEntity> getSkillsByIds(
            @RequestBody List<Long> ids
    ) {

        return skillService.getSkillsByIds(ids);
    }

    @DeleteMapping("/{id}")
    public String deleteSkill(
            @PathVariable Long id
    ) {

        skillService.deleteSkill(id);

        return "Skill Deleted";
    }
}