package com.dictee.controller;

import com.dictee.model.Dictation;
import com.dictee.service.DictationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DictationController.class)
class DictationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DictationService dictationService;

    @Test
    void findAll_returnsEmptyList() throws Exception {
        when(dictationService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/dictations"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void findAll_returnsDictations() throws Exception {
        Dictation dictation = new Dictation("Animals", List.of("cat", "dog"));
        when(dictationService.findAll()).thenReturn(List.of(dictation));

        mockMvc.perform(get("/api/dictations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Animals"))
                .andExpect(jsonPath("$[0].words[0]").value("cat"))
                .andExpect(jsonPath("$[0].words[1]").value("dog"));
    }

    @Test
    void findById_returnsNotFoundForUnknownId() throws Exception {
        when(dictationService.findById("unknown")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/dictations/unknown"))
                .andExpect(status().isNotFound());
    }

    @Test
    void findById_returnsDictation() throws Exception {
        Dictation dictation = new Dictation("Animals", List.of("cat", "dog"));
        when(dictationService.findById(dictation.getId())).thenReturn(Optional.of(dictation));

        mockMvc.perform(get("/api/dictations/" + dictation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Animals"))
                .andExpect(jsonPath("$.words[0]").value("cat"));
    }

    @Test
    void create_returnsSavedDictation() throws Exception {
        Dictation dictation = new Dictation("Animals", List.of("cat", "dog"));
        when(dictationService.create(any())).thenReturn(dictation);

        mockMvc.perform(post("/api/dictations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Animals\",\"words\":[\"cat\",\"dog\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Animals"))
                .andExpect(jsonPath("$.words[0]").value("cat"));
    }
}
