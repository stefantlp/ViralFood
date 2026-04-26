package com.viralfood.orderservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.viralfood.orderservice.dto.Structures.CreateOrAddOrderRequest;
import com.viralfood.orderservice.dto.Structures.OrderResponse;
import com.viralfood.orderservice.dto.Structures.UpdateOrderStatusRequest;
import com.viralfood.orderservice.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByTable(@PathVariable Integer tableId) {
        return orderService.getOrdersByTable(tableId);
    }

    @GetMapping("/table/{tableId}/active")
    public ResponseEntity<?> getActiveOrderByTable(@PathVariable Integer tableId) {
        return orderService.getActiveOrderByTable(tableId);
    }

    @PostMapping
    public ResponseEntity<?> createOrAddOrder(@RequestBody CreateOrAddOrderRequest request) {
        return orderService.createOrAddOrder(request);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer id,
                                               @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Integer id) {
        return orderService.deleteOrder(id);
    }
}