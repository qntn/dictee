package com.dictee.service;

import com.dictee.model.Dictation;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DictationService {

    private final List<Dictation> dictations = new ArrayList<>();

    public List<Dictation> findAll() {
        return dictations;
    }

    public Optional<Dictation> findById(String id) {
        return dictations.stream().filter(d -> id.equals(d.getId())).findFirst();
    }

    public Dictation create(Dictation dictation) {
        dictations.add(dictation);
        return dictation;
    }
}
