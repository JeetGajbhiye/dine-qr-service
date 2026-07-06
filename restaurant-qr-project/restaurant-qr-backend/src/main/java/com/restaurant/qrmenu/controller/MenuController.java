package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(menuService.getByCategory(category));
        }
        return ResponseEntity.ok(menuService.getAll());
    }

    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem item) {
        return ResponseEntity.ok(menuService.create(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem item) {
        return ResponseEntity.ok(menuService.update(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
