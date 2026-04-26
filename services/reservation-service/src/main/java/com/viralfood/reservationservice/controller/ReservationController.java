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

import com.viralfood.reservationservice.dto.Structures.CreateReservationRequest;
import com.viralfood.reservationservice.dto.Structures.UpdateReservationRequest;
import com.viralfood.reservationservice.entity.Reservation;
import com.viralfood.reservationservice.service.ReservationService;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Integer id) {
        return reservationService.getReservationById(id);
    }

    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<Reservation>> getReservationsByTable(@PathVariable Integer tableId) {
        return reservationService.getReservationsByTable(tableId);
    }

    @GetMapping("/{id}/available-tables")
    public ResponseEntity<?> getAvailableTablesForReservation(@PathVariable Integer id) {
        return reservationService.getAvailableTablesForReservation(id);
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody CreateReservationRequest request) {
        return reservationService.createReservation(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable Integer id,
                                               @RequestBody UpdateReservationRequest request) {
        return reservationService.updateReservation(id, request);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveReservation(@PathVariable Integer id,
                                                @RequestBody ApproveReservationRequest request) {
        return reservationService.approveReservation(id, request.getTableId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Integer id) {
        return reservationService.deleteReservation(id);
    }

    public static class ApproveReservationRequest {
        private Integer tableId;

        public Integer getTableId() {
            return tableId;
        }

        public void setTableId(Integer tableId) {
            this.tableId = tableId;
        }
    }
}