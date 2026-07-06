package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.entity.RestaurantTable;
import com.restaurant.qrmenu.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final RestaurantTableRepository repo;

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RestaurantTable t) {
        if (repo.existsByTableNumber(t.getTableNumber())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Table number already exists"));
        }
        return ResponseEntity.ok(repo.save(t));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> update(@PathVariable Long id, @RequestBody RestaurantTable t) {
        RestaurantTable existing = repo.findById(id).orElseThrow();
        existing.setTableNumber(t.getTableNumber());
        existing.setLabel(t.getLabel());
        existing.setQrUrl(t.getQrUrl());
        existing.setIsActive(t.getIsActive());
        return ResponseEntity.ok(repo.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
