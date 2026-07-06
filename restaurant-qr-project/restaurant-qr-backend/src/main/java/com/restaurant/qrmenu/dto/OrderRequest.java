package com.restaurant.qrmenu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String tableNumber;
    private BigDecimal grandTotal;
    private String paymentId;
    private String paymentMethod;
    private List<Item> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {
        private Long menuItemId;
        private String name;
        private BigDecimal price;
        private Integer quantity;
    }
}
