package com.dictee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TextDictation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Le nom ne peut pas être vide")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Le texte ne peut pas être vide")
    @Size(max = 5000, message = "Le texte ne peut pas dépasser 5000 caractères")
    @Column(nullable = false, length = 5000)
    private String fullText;

    @ElementCollection(fetch = FetchType.EAGER)
    @OrderColumn
    private List<String> segments;
}
