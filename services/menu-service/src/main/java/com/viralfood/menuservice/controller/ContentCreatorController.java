package com.viralfood.menuservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.viralfood.menuservice.entity.ContentCreator;
import com.viralfood.menuservice.repository.ContentCreatorRepository;

@RestController
@RequestMapping("/content-creators")
public class ContentCreatorController {

    private final ContentCreatorRepository contentCreatorRepository;

    public ContentCreatorController(ContentCreatorRepository contentCreatorRepository) {
        this.contentCreatorRepository = contentCreatorRepository;
    }

    @GetMapping
    public ResponseEntity<List<ContentCreator>> getAllCreators() {
        return ResponseEntity.ok(contentCreatorRepository.findAll());
    }
}