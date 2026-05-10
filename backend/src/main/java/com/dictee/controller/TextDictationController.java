package com.dictee.controller;

import com.dictee.model.TextDictation;
import com.dictee.model.TextDictationScore;
import com.dictee.service.TextDictationScoreService;
import com.dictee.service.TextDictationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/text-dictations")
public class TextDictationController {

    private final TextDictationService textDictationService;
    private final TextDictationScoreService scoreService;

    public TextDictationController(TextDictationService textDictationService,
                                   TextDictationScoreService scoreService) {
        this.textDictationService = textDictationService;
        this.scoreService = scoreService;
    }

    @GetMapping
    public List<TextDictation> findAll() {
        return textDictationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TextDictation> findById(@PathVariable String id) {
        return textDictationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TextDictation create(@Valid @RequestBody TextDictation textDictation) {
        return textDictationService.create(textDictation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TextDictation> update(@PathVariable String id,
                                                @Valid @RequestBody TextDictation textDictation) {
        return textDictationService.update(id, textDictation)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return textDictationService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // --- Score sub-resource ---

    @GetMapping("/{id}/scores")
    public ResponseEntity<List<TextDictationScore>> getScores(@PathVariable String id) {
        if (textDictationService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(scoreService.findByTextDictationId(id));
    }

    @PostMapping("/{id}/scores")
    public ResponseEntity<TextDictationScore> recordScore(
            @PathVariable String id,
            @Valid @RequestBody ScoreRequest request) {
        return scoreService.record(id, request.score(), request.total())
                .map(s -> ResponseEntity.status(HttpStatus.CREATED).body(s))
                .orElse(ResponseEntity.notFound().build());
    }

    record ScoreRequest(@Min(0) int score, @Min(1) int total) {}
}
