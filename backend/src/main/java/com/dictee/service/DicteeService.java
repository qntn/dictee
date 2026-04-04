package com.dictee.service;

import com.dictee.model.Dictee;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DicteeService {

    private final List<Dictee> dictees = new ArrayList<>();

    public List<Dictee> findAll() {
        return dictees;
    }

    public Optional<Dictee> findById(String id) {
        return dictees.stream().filter(d -> d.getId().equals(id)).findFirst();
    }

    public Dictee create(Dictee dictee) {
        dictees.add(dictee);
        return dictee;
    }
}
