package com.dictee.model;

import java.util.List;
import java.util.UUID;

public class Dictee {

    private String id;
    private String nom;
    private List<String> mots;

    public Dictee() {
        this.id = UUID.randomUUID().toString();
    }

    public Dictee(String nom, List<String> mots) {
        this.id = UUID.randomUUID().toString();
        this.nom = nom;
        this.mots = mots;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public List<String> getMots() { return mots; }
    public void setMots(List<String> mots) { this.mots = mots; }
}
