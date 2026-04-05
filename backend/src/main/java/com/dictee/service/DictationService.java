package com.dictee.service;

import com.dictee.model.Dictation;
import com.dictee.repository.DictationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DictationService {

    private final DictationRepository repository;

    public DictationService(DictationRepository repository) {
        this.repository = repository;
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

    public boolean delete(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
