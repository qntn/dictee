package com.dictee.model;

import java.util.List;
import java.util.UUID;

public class Dictation {

    private String id;
    private String name;
    private List<String> words;

    public Dictation() {
        this.id = UUID.randomUUID().toString();
    }

    public Dictation(String name, List<String> words) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.words = words;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getWords() { return words; }
    public void setWords(List<String> words) { this.words = words; }
}
