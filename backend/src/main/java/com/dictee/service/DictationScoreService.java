package com.dictee.service;

import com.dictee.model.Dictation;
import com.dictee.model.DictationScore;
import com.dictee.repository.DictationRepository;
import com.dictee.repository.DictationScoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DictationScoreService {

    private final DictationScoreRepository scoreRepository;
    private final DictationRepository dictationRepository;

    public DictationScoreService(DictationScoreRepository scoreRepository,
                                 DictationRepository dictationRepository) {
        this.scoreRepository = scoreRepository;
        this.dictationRepository = dictationRepository;
    }

    public List<DictationScore> findByDictationId(String dictationId) {
        return scoreRepository.findByDictationIdOrderByPlayedAtDesc(dictationId);
    }

    public Optional<DictationScore> record(String dictationId, int score, int total) {
        return dictationRepository.findById(dictationId).map(dictation -> {
            DictationScore s = new DictationScore(null, dictation, score, total, null);
            return scoreRepository.save(s);
        });
    }
}
