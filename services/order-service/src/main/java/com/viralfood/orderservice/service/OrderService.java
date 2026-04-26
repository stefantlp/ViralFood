package com.viralfood.orderservice.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import com.viralfood.orderservice.client.ReservationServiceClient;
import com.viralfood.orderservice.dto.Structures.ActiveOrderResponse;
import com.viralfood.orderservice.dto.Structures.CreateOrAddOrderRequest;
import com.viralfood.orderservice.dto.Structures.CreateOrderItemRequest;
import com.viralfood.orderservice.dto.Structures.OrderItemResponse;
import com.viralfood.orderservice.dto.Structures.OrderResponse;
import com.viralfood.orderservice.dto.Structures.RestaurantTableResponse;
import com.viralfood.orderservice.dto.Structures.UpdateOrderStatusRequest;
import com.viralfood.orderservice.entity.Order;
import com.viralfood.orderservice.entity.OrderItem;
import com.viralfood.orderservice.repository.OrderItemRepository;
import com.viralfood.orderservice.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReservationServiceClient reservationServiceClient;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ReservationServiceClient reservationServiceClient) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reservationServiceClient = reservationServiceClient;
    }

    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> response = orderRepository.findAll()
                .stream()
                .map(this::mapOrderToResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<OrderResponse> getOrderById(Integer id) {
        return orderRepository.findById(id)
                .map(order -> ResponseEntity.ok(mapOrderToResponse(order)))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<List<OrderResponse>> getOrdersByTable(Integer tableId) {
        List<OrderResponse> response = orderRepository.findByTableId(tableId)
                .stream()
                .map(this::mapOrderToResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> getActiveOrderByTable(Integer tableId) {
        Optional<Order> optionalOrder = findActiveOrderByTable(tableId);

        if (optionalOrder.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No active order found for table");
        }

        Order order = optionalOrder.get();

        ActiveOrderResponse response = new ActiveOrderResponse();
        response.setId(order.getId());
        response.setTableId(order.getTableId());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> createOrAddOrder(CreateOrAddOrderRequest request) {
        if (request.getTableId() == null) {
            return ResponseEntity.badRequest().body("Table id is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Order items are required");
        }

        RestaurantTableResponse tableResponse;
        try {
            tableResponse = reservationServiceClient.getTableById(request.getTableId());
        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Could not validate table using reservation-service");
        }

        if (tableResponse == null || tableResponse.getId() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Table not found");
        }

        String tableStatus = tableResponse.getStatus() != null
                ? tableResponse.getStatus().trim().toUpperCase()
                : "AVAILABLE";

        if (tableStatus.equals("AVAILABLE")) {
            if (request.getAccessCode() == null || request.getAccessCode().isBlank()) {
                return ResponseEntity.badRequest().body("Access code is required");
            }

            if (!request.getAccessCode().equals(tableResponse.getAccessCode())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access code for table");
            }
        } else if (tableStatus.equals("RESERVED")) {
            if (request.getAccessCode() == null || request.getAccessCode().isBlank()) {
                return ResponseEntity.badRequest().body("Access code is required");
            }

            if (!request.getAccessCode().equals(tableResponse.getAccessCode())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access code for table");
            }

            boolean hasAlias = request.getReservationAlias() != null && !request.getReservationAlias().isBlank();
            boolean hasPhone = request.getReservationPhoneNumber() != null && !request.getReservationPhoneNumber().isBlank();

            if (!hasAlias && !hasPhone) {
                return ResponseEntity.badRequest()
                        .body("Reservation alias or phone number is required for reserved tables");
            }

            boolean reservationMatchesApprovedReservation = reservationServiceClient.getReservationsByTable(request.getTableId())
                    .stream()
                    .filter(reservation -> reservation.getStatus() != null
                            && reservation.getStatus().equalsIgnoreCase("APPROVED"))
                    .anyMatch(reservation -> {
                        boolean aliasMatches = hasAlias
                                && reservation.getCustomerAlias() != null
                                && reservation.getCustomerAlias().trim()
                                .equalsIgnoreCase(request.getReservationAlias().trim());

                        boolean phoneMatches = hasPhone
                                && reservation.getPhoneNumber() != null
                                && reservation.getPhoneNumber().trim()
                                .equalsIgnoreCase(request.getReservationPhoneNumber().trim());

                        return aliasMatches || phoneMatches;
                    });

            if (!reservationMatchesApprovedReservation) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Reservation identity does not match the approved reservation for this table");
            }
        } else if (tableStatus.equals("OCCUPIED")) {
            if (request.getAccessCode() == null || request.getAccessCode().isBlank()) {
                return ResponseEntity.badRequest().body("Access code is required");
            }

            if (!request.getAccessCode().equals(tableResponse.getAccessCode())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access code for table");
            }
        } else {
            return ResponseEntity.badRequest().body("Table is not in a valid state for ordering");
        }

        Optional<Order> optionalActiveOrder = findActiveOrderByTable(request.getTableId());
        Order order;

        if (optionalActiveOrder.isPresent()) {
            order = optionalActiveOrder.get();
        } else {
            order = new Order();
            order.setTableId(request.getTableId());
            order.setStatus("OPEN");
            order.setTotalPrice(BigDecimal.ZERO);
            order = orderRepository.save(order);
        }

        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getMenuItemId() == null) {
                return ResponseEntity.badRequest().body("Menu item id is required");
            }

            if (itemRequest.getProductName() == null || itemRequest.getProductName().isBlank()) {
                return ResponseEntity.badRequest().body("Product name is required");
            }

            if (itemRequest.getUnitPrice() == null || itemRequest.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                return ResponseEntity.badRequest().body("Unit price is required");
            }

            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body("Quantity must be greater than 0");
            }

            Optional<OrderItem> optionalExistingItem =
                    orderItemRepository.findByOrder_IdAndMenuItemId(order.getId(), itemRequest.getMenuItemId());

            if (optionalExistingItem.isPresent()) {
                OrderItem existingItem = optionalExistingItem.get();
                int newQuantity = existingItem.getQuantity() + itemRequest.getQuantity();

                existingItem.setQuantity(newQuantity);
                existingItem.setLineTotal(
                        existingItem.getUnitPrice().multiply(BigDecimal.valueOf(newQuantity))
                );

                orderItemRepository.save(existingItem);
            } else {
                OrderItem newItem = new OrderItem();
                newItem.setOrder(order);
                newItem.setMenuItemId(itemRequest.getMenuItemId());
                newItem.setProductName(itemRequest.getProductName().trim());
                newItem.setUnitPrice(itemRequest.getUnitPrice());
                newItem.setQuantity(itemRequest.getQuantity());
                newItem.setLineTotal(
                        itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                );

                orderItemRepository.save(newItem);
            }
        }

        recalculateOrderTotal(order);

        try {
            reservationServiceClient.updateTableStatus(request.getTableId(), "OCCUPIED");
        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Order updated, but failed to update table status to OCCUPIED");
        }

        return ResponseEntity.ok(mapOrderToResponse(orderRepository.findById(order.getId()).orElse(order)));
    }

    public ResponseEntity<?> updateOrderStatus(Integer id, UpdateOrderStatusRequest request) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        Order order = optionalOrder.get();
        String newStatus = request.getStatus().trim().toUpperCase();

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        if (order.getTableId() != null &&
                (newStatus.equals("COMPLETED") || newStatus.equals("CANCELLED") || newStatus.equals("ENDED"))) {
            try {
                reservationServiceClient.updateTableStatus(order.getTableId(), "AVAILABLE");
            } catch (RestClientException ex) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body("Order updated, but failed to update table status to AVAILABLE");
            }
        }

        return ResponseEntity.ok(mapOrderToResponse(savedOrder));
    }

    public ResponseEntity<?> deleteOrder(Integer id) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }

        Order order = optionalOrder.get();
        Integer tableId = order.getTableId();

        orderRepository.deleteById(id);

        if (tableId != null) {
            try {
                reservationServiceClient.updateTableStatus(tableId, "AVAILABLE");
            } catch (RestClientException ex) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body("Order deleted, but failed to update table status to AVAILABLE");
            }
        }

        return ResponseEntity.ok("Order deleted successfully");
    }

    private Optional<Order> findActiveOrderByTable(Integer tableId) {
        return orderRepository.findByTableId(tableId)
                .stream()
                .filter(order -> order.getStatus() != null
                        && !order.getStatus().equalsIgnoreCase("COMPLETED")
                        && !order.getStatus().equalsIgnoreCase("CANCELLED")
                        && !order.getStatus().equalsIgnoreCase("ENDED"))
                .max(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));
    }

    private void recalculateOrderTotal(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());

        BigDecimal total = items.stream()
                .map(OrderItem::getLineTotal)
                .filter(lineTotal -> lineTotal != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalPrice(total);
        orderRepository.save(order);
    }

    private OrderResponse mapOrderToResponse(Order order) {
        List<OrderItemResponse> itemResponses = orderItemRepository.findByOrder_Id(order.getId())
                .stream()
                .map(this::mapOrderItemToResponse)
                .toList();

        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTableId(order.getTableId());
        response.setStatus(order.getStatus());
        response.setTotalPrice(order.getTotalPrice());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(itemResponses);

        return response;
    }

    private OrderItemResponse mapOrderItemToResponse(OrderItem item) {
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