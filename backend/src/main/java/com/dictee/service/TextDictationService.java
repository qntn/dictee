package com.dictee.service;

import com.dictee.model.TextDictation;
import com.dictee.repository.TextDictationRepository;
import com.dictee.repository.TextDictationScoreRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TextDictationService {

    private final TextDictationRepository repository;
    private final TextDictationScoreRepository scoreRepository;

    public TextDictationService(TextDictationRepository repository,
                                TextDictationScoreRepository scoreRepository) {
        this.repository = repository;
        this.scoreRepository = scoreRepository;
    }

    public List<TextDictation> findAll() {
        return repository.findAll();
    }

    public Optional<TextDictation> findById(String id) {
        return repository.findById(id);
    }

    public TextDictation create(TextDictation textDictation) {
        // Auto-segment the text if segments are not provided
        if (textDictation.getSegments() == null || textDictation.getSegments().isEmpty()) {
            textDictation.setSegments(segmentText(textDictation.getFullText()));
        }
        return repository.save(textDictation);
    }

    public Optional<TextDictation> update(String id, TextDictation updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setFullText(updated.getFullText());
            // Re-segment if new text is provided
            existing.setSegments(segmentText(updated.getFullText()));
            return repository.save(existing);
        });
    }

    @Transactional
    public boolean delete(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        scoreRepository.deleteByTextDictationId(id);
        repository.deleteById(id);
        return true;
    }

    /**
     * Segments text into phrases based on sentence boundaries.
     * Splits on periods, exclamation marks, and question marks.
     */
    private List<String> segmentText(String text) {
        List<String> segments = new ArrayList<>();

        // Pattern to match sentence endings: . ! ? followed by space or end of string
        // Keep the punctuation with the sentence
        Pattern pattern = Pattern.compile("[^.!?]+[.!?]+");
        Matcher matcher = pattern.matcher(text.trim());

        while (matcher.find()) {
            String segment = matcher.group().trim();
            if (!segment.isEmpty()) {
                segments.add(segment);
            }
        }

        // Handle any remaining text without ending punctuation
        int lastEnd = 0;
        matcher.reset();
        while (matcher.find()) {
            lastEnd = matcher.end();
        }
        String remainder = text.substring(lastEnd).trim();
        if (!remainder.isEmpty()) {
            segments.add(remainder);
        }

        // If no segments were created, return the whole text as one segment
        if (segments.isEmpty()) {
            segments.add(text.trim());
        }

        return segments;
    }
}
