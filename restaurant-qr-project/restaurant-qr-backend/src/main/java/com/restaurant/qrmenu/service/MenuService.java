package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.entity.MenuItem;
import com.restaurant.qrmenu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> getAll() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getByCategory(String category) {
        return menuItemRepository.findByCategoryIgnoreCase(category);
    }

    public MenuItem create(MenuItem item) {
        return menuItemRepository.save(item);
    }

    public MenuItem update(Long id, MenuItem updated) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
        existing.setName(updated.getName());
        existing.setNameHi(updated.getNameHi());
        existing.setNameTa(updated.getNameTa());
        existing.setDescription(updated.getDescription());
        existing.setDescriptionHi(updated.getDescriptionHi());
        existing.setDescriptionTa(updated.getDescriptionTa());
        existing.setPrice(updated.getPrice());
        existing.setImageUrl(updated.getImageUrl());
        existing.setCategory(updated.getCategory());
        existing.setIsAvailable(updated.getIsAvailable());
        existing.setIsVeg(updated.getIsVeg());
        return menuItemRepository.save(existing);
    }

    public void delete(Long id) {
        menuItemRepository.deleteById(id);
    }
}
