package com.dictee.service;

import com.dictee.model.Dictation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class DictationServiceTest {

    private DictationService service;

    @BeforeEach
    void setUp() {
        service = new DictationService();
    }

    @Test
    void findAll_returnsEmptyListInitially() {
        assertThat(service.findAll()).isEmpty();
    }

    @Test
    void create_addsDictationAndReturnsIt() {
        Dictation dictation = new Dictation("Animals", List.of("cat", "dog"));
        Dictation created = service.create(dictation);

        assertThat(created).isSameAs(dictation);
        assertThat(service.findAll()).containsExactly(dictation);
    }

    @Test
    void findById_returnsCorrectDictation() {
        Dictation dictation = new Dictation("Animals", List.of("cat", "dog"));
        service.create(dictation);

        Optional<Dictation> found = service.findById(dictation.getId());
        assertThat(found).isPresent().contains(dictation);
    }

    @Test
    void findById_returnsEmptyForUnknownId() {
        assertThat(service.findById("unknown-id")).isEmpty();
    }

    @Test
    void findAll_returnsAllCreatedDictations() {
        service.create(new Dictation("Animals", List.of("cat", "dog")));
        service.create(new Dictation("Colors", List.of("red", "blue")));

        assertThat(service.findAll()).hasSize(2);
    }
}
