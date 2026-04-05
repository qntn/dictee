package com.dictee.controller;

import com.dictee.model.Dictation;
import com.dictee.service.DictationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictations")
public class DictationController {

    private final DictationService dictationService;

    public DictationController(DictationService dictationService) {
        this.dictationService = dictationService;
    }

    @GetMapping
    public List<Dictation> findAll() {
        return dictationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dictation> findById(@PathVariable String id) {
        return dictationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Dictation create(@RequestBody Dictation dictation) {
        return dictationService.create(dictation);
    }
}
