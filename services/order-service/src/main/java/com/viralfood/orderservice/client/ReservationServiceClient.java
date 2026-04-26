package com.viralfood.orderservice.client;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.viralfood.orderservice.dto.Structures.ReservationResponse;
import com.viralfood.orderservice.dto.Structures.RestaurantTableResponse;

@Component
public class ReservationServiceClient {

    private static final String RESERVATION_SERVICE_BASE_URL = "http://localhost:8084";

    private final RestTemplate restTemplate = new RestTemplate();

    public RestaurantTableResponse getTableById(Integer tableId) {
        return restTemplate.getForObject(
                RESERVATION_SERVICE_BASE_URL + "/tables/" + tableId,
                RestaurantTableResponse.class
        );
    }

    public List<ReservationResponse> getReservationsByTable(Integer tableId) {
        try {
            ReservationResponse[] response = restTemplate.getForObject(
                    RESERVATION_SERVICE_BASE_URL + "/reservations/table/" + tableId,
                    ReservationResponse[].class
            );

            if (response == null) {
                return Collections.emptyList();
            }

            return Arrays.asList(response);
        } catch (RestClientException ex) {
            return Collections.emptyList();
        }
    }

    public void updateTableStatus(Integer tableId, String newStatus) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = "{\"status\":\"" + newStatus + "\"}";
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        restTemplate.exchange(
                RESERVATION_SERVICE_BASE_URL + "/tables/" + tableId,
                HttpMethod.PUT,
                entity,
                String.class
        );
    }
}