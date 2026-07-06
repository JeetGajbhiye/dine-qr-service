package com.restaurant.qrmenu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "restaurant_tables")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", nullable = false, unique = true, length = 10)
    private String tableNumber;

    @Column(length = 100)
    private String label;

    @Column(name = "qr_url", length = 500)
    private String qrUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
