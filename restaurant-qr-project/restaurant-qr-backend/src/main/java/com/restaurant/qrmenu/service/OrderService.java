package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.dto.OrderRequest;
import com.restaurant.qrmenu.entity.Order;
import com.restaurant.qrmenu.entity.OrderItem;
import com.restaurant.qrmenu.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Order placeOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setTableNumber(request.getTableNumber());
        order.setGrandTotal(request.getGrandTotal());
        order.setPaymentId(request.getPaymentId());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(request.getPaymentId() != null && !request.getPaymentId().isBlank() ? "PAID" : "PENDING");

        List<OrderItem> items = request.getItems().stream().map(i -> {
            OrderItem oi = new OrderItem();
            oi.setMenuItemId(i.getMenuItemId());
            oi.setName(i.getName());
            oi.setPrice(i.getPrice());
            oi.setQuantity(i.getQuantity());
            oi.setOrder(order);
            return oi;
        }).collect(Collectors.toList());

        order.setItems(items);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
