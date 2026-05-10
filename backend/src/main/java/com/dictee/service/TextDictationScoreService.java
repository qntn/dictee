package com.dictee.service;

import com.dictee.model.TextDictationScore;
import com.dictee.repository.TextDictationRepository;
import com.dictee.repository.TextDictationScoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TextDictationScoreService {

    private final TextDictationScoreRepository scoreRepository;
    private final TextDictationRepository textDictationRepository;

    public TextDictationScoreService(TextDictationScoreRepository scoreRepository,
                                     TextDictationRepository textDictationRepository) {
        this.scoreRepository = scoreRepository;
        this.textDictationRepository = textDictationRepository;
    }

    public List<TextDictationScore> findByTextDictationId(String textDictationId) {
        return scoreRepository.findByTextDictationIdOrderByPlayedAtDesc(textDictationId);
    }

    public Optional<TextDictationScore> record(String textDictationId, int score, int total) {
        return textDictationRepository.findById(textDictationId).map(textDictation -> {
            TextDictationScore s = new TextDictationScore(null, textDictation, score, total, null);
            return scoreRepository.save(s);
        });
    }
}
