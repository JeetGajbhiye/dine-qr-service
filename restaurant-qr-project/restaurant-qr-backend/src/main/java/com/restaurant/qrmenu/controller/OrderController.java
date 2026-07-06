package com.restaurant.qrmenu.controller;

import com.restaurant.qrmenu.dto.OrderRequest;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.repository.OrderRepository;
import com.restaurant.qrmenu.service.NotificationService;
import com.restaurant.qrmenu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody OrderRequest request) {
        Order o = orderService.placeOrder(request);
        notificationService.notifyStatus(o);
        return ResponseEntity.ok(o);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id,
                                              @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElseThrow();
        String status = body.get("status");
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        notificationService.notifyStatus(saved);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
