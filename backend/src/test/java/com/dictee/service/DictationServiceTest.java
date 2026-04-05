package com.dictee.service;

import com.dictee.model.Dictation;
import com.dictee.repository.DictationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DictationServiceTest {

    @Mock
    private DictationRepository repository;

    @InjectMocks
    private DictationService service;

    @Test
    void findAll_returnsEmptyListInitially() {
        when(repository.findAll()).thenReturn(List.of());
        assertThat(service.findAll()).isEmpty();
    }

    @Test
    void create_savesDictationAndReturnsIt() {
        Dictation dictation = new Dictation(null, "Animals", List.of("cat", "dog"));
        when(repository.save(any())).thenReturn(dictation);

        Dictation created = service.create(dictation);

        assertThat(created).isSameAs(dictation);
        verify(repository).save(dictation);
    }

    @Test
    void findById_returnsCorrectDictation() {
        Dictation dictation = new Dictation("abc", "Animals", List.of("cat", "dog"));
        when(repository.findById("abc")).thenReturn(Optional.of(dictation));

        Optional<Dictation> found = service.findById("abc");

        assertThat(found).isPresent().contains(dictation);
    }

    @Test
    void findById_returnsEmptyForUnknownId() {
        when(repository.findById("unknown-id")).thenReturn(Optional.empty());

        assertThat(service.findById("unknown-id")).isEmpty();
    }

    @Test
    void findAll_returnsAllCreatedDictations() {
        when(repository.findAll()).thenReturn(List.of(
                new Dictation("1", "Animals", List.of("cat", "dog")),
                new Dictation("2", "Colors", List.of("red", "blue"))
        ));
        assertThat(service.findAll()).hasSize(2);
    }

    @Test
    void update_modifiesDictationWhenFound() {
        Dictation existing = new Dictation("abc", "Animals", List.of("cat"));
        Dictation patch = new Dictation(null, "Fruits", List.of("apple", "pear"));
        when(repository.findById("abc")).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        Optional<Dictation> result = service.update("abc", patch);

        assertThat(result).isPresent();
        assertThat(existing.getName()).isEqualTo("Fruits");
        assertThat(existing.getWords()).containsExactly("apple", "pear");
    }

    @Test
    void update_returnsEmptyForUnknownId() {
        when(repository.findById("unknown")).thenReturn(Optional.empty());

        assertThat(service.update("unknown", new Dictation(null, "X", List.of("a")))).isEmpty();
    }

    @Test
    void delete_returnsTrueWhenFound() {
        when(repository.existsById("abc")).thenReturn(true);

        assertThat(service.delete("abc")).isTrue();
        verify(repository).deleteById("abc");
    }

    @Test
    void delete_returnsFalseForUnknownId() {
        when(repository.existsById("unknown")).thenReturn(false);

        assertThat(service.delete("unknown")).isFalse();
    }
}
