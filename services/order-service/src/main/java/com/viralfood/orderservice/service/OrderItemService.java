package com.viralfood.orderservice.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.viralfood.orderservice.dto.Structures.OrderItemResponse;
import com.viralfood.orderservice.entity.OrderItem;
import com.viralfood.orderservice.repository.OrderItemRepository;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;

    public OrderItemService(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    public ResponseEntity<List<OrderItemResponse>> getAllOrderItems() {
        List<OrderItemResponse> response = orderItemRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<OrderItemResponse> getOrderItemById(Integer id) {
        return orderItemRepository.findById(id)
                .map(item -> ResponseEntity.ok(mapToResponse(item)))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> deleteOrderItem(Integer id) {
        if (!orderItemRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Order item not found");
        }

        orderItemRepository.deleteById(id);
        return ResponseEntity.ok("Order item deleted successfully");
    }

    public OrderItemResponse mapToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setOrderId(item.getOrder() != null ? item.getOrder().getId() : null);
        response.setMenuItemId(item.getMenuItemId());
        response.setProductName(item.getProductName());
        response.setUnitPrice(item.getUnitPrice());
        response.setQuantity(item.getQuantity());
        response.setLineTotal(item.getLineTotal());

        return response;
    }
}