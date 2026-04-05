package com.dictee.service;

import com.dictee.model.Dictation;
import com.dictee.repository.DictationRepository;
import com.dictee.repository.DictationScoreRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DictationService {

    private final DictationRepository repository;
    private final DictationScoreRepository scoreRepository;

    public DictationService(DictationRepository repository, DictationScoreRepository scoreRepository) {
        this.repository = repository;
        this.scoreRepository = scoreRepository;
    }

    public List<Dictation> findAll() {
        return repository.findAll();
    }

    public Optional<Dictation> findById(String id) {
        return repository.findById(id);
    }

    public Dictation create(Dictation dictation) {
        return repository.save(dictation);
    }

    public Optional<Dictation> update(String id, Dictation updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setWords(updated.getWords());
            return repository.save(existing);
        });
    }

    @Transactional
    public boolean delete(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        scoreRepository.deleteByDictationId(id);
        repository.deleteById(id);
        return true;
    }
}
