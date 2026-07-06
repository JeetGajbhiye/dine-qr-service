package com.restaurant.qrmenu.repository;

import com.restaurant.qrmenu.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    boolean existsByTableNumber(String tableNumber);
}
