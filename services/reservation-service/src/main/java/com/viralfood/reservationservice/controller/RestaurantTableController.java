package com.viralfood.reservationservice.controller;

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

import com.viralfood.reservationservice.dto.Structures.CreateTableRequest;
import com.viralfood.reservationservice.dto.Structures.UpdateTableRequest;
import com.viralfood.reservationservice.entity.RestaurantTable;
import com.viralfood.reservationservice.service.RestaurantTableService;

@RestController
@RequestMapping("/tables")
public class RestaurantTableController {

    private final RestaurantTableService restaurantTableService;

    public RestaurantTableController(RestaurantTableService restaurantTableService) {
        this.restaurantTableService = restaurantTableService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        return restaurantTableService.getAllTables();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTableById(@PathVariable Integer id) {
        return restaurantTableService.getTableById(id);
    }

    @GetMapping("/access-code/{accessCode}")
    public ResponseEntity<RestaurantTable> getTableByAccessCode(@PathVariable String accessCode) {
        return restaurantTableService.getTableByAccessCode(accessCode);
    }

    @PostMapping
    public ResponseEntity<?> createTable(@RequestBody CreateTableRequest request) {
        return restaurantTableService.createTable(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTable(@PathVariable Integer id, @RequestBody UpdateTableRequest request) {
        return restaurantTableService.updateTable(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTable(@PathVariable Integer id) {
        return restaurantTableService.deleteTable(id);
    }
}