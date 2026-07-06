package com.restaurant.qrmenu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "name_hi", length = 120)
    private String nameHi;

    @Column(name = "name_ta", length = 120)
    private String nameTa;

    @Column(length = 500)
    private String description;

    @Column(name = "description_hi", length = 500)
    private String descriptionHi;

    @Column(name = "description_ta", length = 500)
    private String descriptionTa;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "is_veg")
    private Boolean isVeg = true;
}
