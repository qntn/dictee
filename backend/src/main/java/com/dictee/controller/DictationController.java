package com.dictee.controller;

import com.dictee.model.Dictation;
import com.dictee.model.DictationScore;
import com.dictee.service.DictationScoreService;
import com.dictee.service.DictationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictations")
public class DictationController {

    private final DictationService dictationService;
    private final DictationScoreService scoreService;

    public DictationController(DictationService dictationService,
                               DictationScoreService scoreService) {
        this.dictationService = dictationService;
        this.scoreService = scoreService;
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
    @ResponseStatus(HttpStatus.CREATED)
    public Dictation create(@Valid @RequestBody Dictation dictation) {
        return dictationService.create(dictation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dictation> update(@PathVariable String id,
                                            @Valid @RequestBody Dictation dictation) {
        return dictationService.update(id, dictation)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return dictationService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // --- Score sub-resource ---

    @GetMapping("/{id}/scores")
    public ResponseEntity<List<DictationScore>> getScores(@PathVariable String id) {
        if (dictationService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(scoreService.findByDictationId(id));
    }

    @PostMapping("/{id}/scores")
    public ResponseEntity<DictationScore> recordScore(
            @PathVariable String id,
            @Valid @RequestBody ScoreRequest request) {
        return scoreService.record(id, request.score(), request.total())
                .map(s -> ResponseEntity.status(HttpStatus.CREATED).body(s))
                .orElse(ResponseEntity.notFound().build());
    }

    record ScoreRequest(@Min(0) int score, @Min(1) int total) {}
}
