package com.viralfood.reservationservice.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.viralfood.reservationservice.dto.Structures.CreateTableRequest;
import com.viralfood.reservationservice.dto.Structures.UpdateTableRequest;
import com.viralfood.reservationservice.entity.RestaurantTable;
import com.viralfood.reservationservice.repository.RestaurantTableRepository;

@Service
public class RestaurantTableService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("AVAILABLE", "RESERVED", "OCCUPIED");

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableService(RestaurantTableRepository restaurantTableRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
    }

    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        return ResponseEntity.ok(restaurantTableRepository.findAll());
    }

    public ResponseEntity<RestaurantTable> getTableById(Integer id) {
        return restaurantTableRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<RestaurantTable> getTableByAccessCode(String accessCode) {
        return restaurantTableRepository.findByAccessCode(accessCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> createTable(CreateTableRequest request) {
        if (request.getTableNumber() == null) {
            return ResponseEntity.badRequest().body("Table number is required");
        }

        if (request.getCapacity() == null) {
            return ResponseEntity.badRequest().body("Capacity is required");
        }

        if (request.getAccessCode() == null || request.getAccessCode().isBlank()) {
            return ResponseEntity.badRequest().body("Access code is required");
        }

        String status = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "AVAILABLE";
        if (!ALLOWED_STATUSES.contains(status)) {
            return ResponseEntity.badRequest().body("Invalid table status");
        }

        RestaurantTable restaurantTable = new RestaurantTable();
        restaurantTable.setTableNumber(request.getTableNumber());
        restaurantTable.setCapacity(request.getCapacity());
        restaurantTable.setStatus(status);
        restaurantTable.setAccessCode(request.getAccessCode().trim());

        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantTableRepository.save(restaurantTable));
    }

    public ResponseEntity<?> updateTable(Integer id, UpdateTableRequest request) {
        Optional<RestaurantTable> optionalTable = restaurantTableRepository.findById(id);
        if (optionalTable.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Table not found");
        }

        RestaurantTable restaurantTable = optionalTable.get();

        if (request.getTableNumber() != null) {
            restaurantTable.setTableNumber(request.getTableNumber());
        }

        if (request.getCapacity() != null) {
            restaurantTable.setCapacity(request.getCapacity());
        }

        if (request.getStatus() != null) {
            String status = request.getStatus().trim().toUpperCase();
            if (!ALLOWED_STATUSES.contains(status)) {
                return ResponseEntity.badRequest().body("Invalid table status");
            }
            restaurantTable.setStatus(status);
        }

        if (request.getAccessCode() != null) {
            if (request.getAccessCode().isBlank()) {
                return ResponseEntity.badRequest().body("Access code cannot be blank");
            }
            restaurantTable.setAccessCode(request.getAccessCode().trim());
        }

        return ResponseEntity.ok(restaurantTableRepository.save(restaurantTable));
    }

    public ResponseEntity<?> deleteTable(Integer id) {
        if (!restaurantTableRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Table not found");
        }

        restaurantTableRepository.deleteById(id);
        return ResponseEntity.ok("Table deleted successfully");
    }
}