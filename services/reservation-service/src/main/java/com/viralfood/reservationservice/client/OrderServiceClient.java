package com.viralfood.reservationservice.client;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class OrderServiceClient {

    private static final String ORDER_SERVICE_BASE_URL = "http://localhost:8083";

    private final RestTemplate restTemplate = new RestTemplate();

    public ActiveOrderResponse getActiveOrderForTable(Integer tableId) {
        try {
            return restTemplate.getForObject(
                    ORDER_SERVICE_BASE_URL + "/orders/table/" + tableId + "/active",
                    ActiveOrderResponse.class
            );
        } catch (RestClientException ex) {
            return null;
        }
    }

    public boolean hasActiveOrderForTable(Integer tableId) {
        ActiveOrderResponse response = getActiveOrderForTable(tableId);
        return response != null && response.getId() != null;
    }

    public static class ActiveOrderResponse {
        private Integer id;
        private Integer tableId;
        private String status;
        private LocalDateTime createdAt;

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public Integer getTableId() {
            return tableId;
        }

        public void setTableId(Integer tableId) {
            this.tableId = tableId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}