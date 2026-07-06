package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryIgnoreCase(String category);
    List<MenuItem> findByIsAvailableTrue();
}
