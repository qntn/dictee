package com.dictee.controller;

import com.dictee.model.Dictee;
import com.dictee.service.DicteeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictees")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class DicteeController {

    private final DicteeService dicteeService;

    public DicteeController(DicteeService dicteeService) {
        this.dicteeService = dicteeService;
    }

    @GetMapping
    public List<Dictee> findAll() {
        return dicteeService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dictee> findById(@PathVariable String id) {
        return dicteeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Dictee create(@RequestBody Dictee dictee) {
        return dicteeService.create(dictee);
    }
}
