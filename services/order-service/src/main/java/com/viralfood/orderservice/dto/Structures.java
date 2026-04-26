package com.viralfood.orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

public class Structures {

    @Getter
    @Setter
    public static class CreateOrAddOrderRequest {
    private Integer tableId;
    private String accessCode;
    private String reservationAlias;
    private String reservationPhoneNumber;
    private List<CreateOrderItemRequest> items;
    }       

    @Getter
    @Setter
    public static class CreateOrderItemRequest {
        private Integer menuItemId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer quantity;
    }

    @Getter
    @Setter
    public static class UpdateOrderStatusRequest {
        private String status;
    }

    @Getter
    @Setter
    public static class OrderResponse {
        private Integer id;
        private Integer tableId;
        private String status;
        private BigDecimal totalPrice;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;
    }

    @Getter
    @Setter
    public static class OrderItemResponse {
        private Integer id;
        private Integer orderId;
        private Integer menuItemId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal lineTotal;
    }

    @Getter
    @Setter
    public static class ActiveOrderResponse {
        private Integer id;
        private Integer tableId;
        private String status;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    public static class RestaurantTableResponse {
        private Integer id;
        private Integer tableNumber;
        private Integer capacity;
        private String status;
        private String accessCode;
    }

    @Getter
    @Setter
    public static class ReservationResponse {
        private Integer id;
        private String customerAlias;
        private String phoneNumber;
        private LocalDateTime reservationTime;
        private Integer peopleCount;
        private String status;
        private RestaurantTableResponse table;
    }
}