package com.viralfood.reservationservice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.viralfood.reservationservice.client.OrderServiceClient;
import com.viralfood.reservationservice.dto.Structures.CreateReservationRequest;
import com.viralfood.reservationservice.dto.Structures.UpdateReservationRequest;
import com.viralfood.reservationservice.entity.Reservation;
import com.viralfood.reservationservice.entity.RestaurantTable;
import com.viralfood.reservationservice.repository.ReservationRepository;
import com.viralfood.reservationservice.repository.RestaurantTableRepository;

@Service
public class ReservationService {

    private static final long APPROVED_GRACE_MINUTES = 30;
    private static final long OCCUPIED_ORDER_BLOCK_MINUTES = 240;
    private static final long APPROVED_TOTAL_BLOCK_MINUTES =
            APPROVED_GRACE_MINUTES + OCCUPIED_ORDER_BLOCK_MINUTES;

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final OrderServiceClient orderServiceClient;

    public ReservationService(ReservationRepository reservationRepository,
                              RestaurantTableRepository restaurantTableRepository,
                              OrderServiceClient orderServiceClient) {
        this.reservationRepository = reservationRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.orderServiceClient = orderServiceClient;
    }

    public ResponseEntity<List<Reservation>> getAllReservations() {
        refreshReservationStatuses();
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    public ResponseEntity<Reservation> getReservationById(Integer id) {
        refreshReservationStatuses();
        return reservationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<List<Reservation>> getReservationsByTable(Integer tableId) {
        refreshReservationStatuses();
        return ResponseEntity.ok(reservationRepository.findByTable_Id(tableId));
    }

    public ResponseEntity<?> getAvailableTablesForReservation(Integer reservationId) {
        refreshReservationStatuses();

        Optional<Reservation> optionalReservation = reservationRepository.findById(reservationId);
        if (optionalReservation.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reservation not found");
        }

        Reservation reservation = optionalReservation.get();

        if (reservation.getPeopleCount() == null || reservation.getReservationTime() == null) {
            return ResponseEntity.badRequest().body("Reservation is missing required data");
        }

        List<RestaurantTable> tables = getValidTablesForReservation(
                reservation.getPeopleCount(),
                reservation.getReservationTime(),
                reservation.getId()
        );

        return ResponseEntity.ok(tables);
    }

    public ResponseEntity<?> createReservation(CreateReservationRequest request) {
        refreshReservationStatuses();

        if (request.getCustomerAlias() == null || request.getCustomerAlias().isBlank()) {
            return ResponseEntity.badRequest().body("Customer alias is required");
        }

        if (request.getPhoneNumber() == null || request.getPhoneNumber().isBlank()) {
            return ResponseEntity.badRequest().body("Phone number is required");
        }

        if (request.getReservationTime() == null) {
            return ResponseEntity.badRequest().body("Reservation time is required");
        }

        if (request.getReservationTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Reservation time cannot be in the past");
        }

        if (request.getPeopleCount() == null || request.getPeopleCount() <= 0) {
            return ResponseEntity.badRequest().body("People count must be greater than 0");
        }

        Integer maxCapacity = getMaxTableCapacity();
        if (maxCapacity == null) {
            return ResponseEntity.badRequest().body("No restaurant tables exist");
        }

        if (request.getPeopleCount() > maxCapacity) {
            return ResponseEntity.badRequest().body("People count is larger than the biggest table");
        }

        List<RestaurantTable> validTables = getValidTablesForReservation(
                request.getPeopleCount(),
                request.getReservationTime(),
                null
        );

        if (validTables.isEmpty()) {
            return ResponseEntity.badRequest().body("No table is available for this time and party size");
        }

        Reservation reservation = new Reservation();
        reservation.setCustomerAlias(request.getCustomerAlias().trim());
        reservation.setPhoneNumber(request.getPhoneNumber().trim());
        reservation.setTable(null);
        reservation.setReservationTime(request.getReservationTime());
        reservation.setPeopleCount(request.getPeopleCount());
        reservation.setStatus("PENDING");
        reservation.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.status(HttpStatus.CREATED).body(reservationRepository.save(reservation));
    }

    public ResponseEntity<?> updateReservation(Integer id, UpdateReservationRequest request) {
        refreshReservationStatuses();

        Optional<Reservation> optionalReservation = reservationRepository.findById(id);
        if (optionalReservation.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reservation not found");
        }

        Reservation reservation = optionalReservation.get();

        if (request.getCustomerAlias() != null) {
            if (request.getCustomerAlias().isBlank()) {
                return ResponseEntity.badRequest().body("Customer alias cannot be blank");
            }
            reservation.setCustomerAlias(request.getCustomerAlias().trim());
        }

        if (request.getPhoneNumber() != null) {
            if (request.getPhoneNumber().isBlank()) {
                return ResponseEntity.badRequest().body("Phone number cannot be blank");
            }
            reservation.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getReservationTime() != null) {
            if (request.getReservationTime().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("Reservation time cannot be in the past");
            }
            reservation.setReservationTime(request.getReservationTime());
        }

        if (request.getPeopleCount() != null) {
            if (request.getPeopleCount() <= 0) {
                return ResponseEntity.badRequest().body("People count must be greater than 0");
            }

            Integer maxCapacity = getMaxTableCapacity();
            if (maxCapacity != null && request.getPeopleCount() > maxCapacity) {
                return ResponseEntity.badRequest().body("People count is larger than the biggest table");
            }

            reservation.setPeopleCount(request.getPeopleCount());
        }

        if (reservation.getStatus() != null &&
                (reservation.getStatus().equalsIgnoreCase("APPROVED")
                        || reservation.getStatus().equalsIgnoreCase("FAILED")
                        || reservation.getStatus().equalsIgnoreCase("REJECTED")
                        || reservation.getStatus().equalsIgnoreCase("COMPLETED"))) {
            return ResponseEntity.badRequest().body("Only pending reservations should be edited");
        }

        List<RestaurantTable> validTables = getValidTablesForReservation(
                reservation.getPeopleCount(),
                reservation.getReservationTime(),
                reservation.getId()
        );

        if (validTables.isEmpty()) {
            return ResponseEntity.badRequest().body("No table is available for this time and party size");
        }

        return ResponseEntity.ok(reservationRepository.save(reservation));
    }

    public ResponseEntity<?> approveReservation(Integer id, Integer tableId) {
        refreshReservationStatuses();

        if (tableId == null) {
            return ResponseEntity.badRequest().body("Table id is required");
        }

        Optional<Reservation> optionalReservation = reservationRepository.findById(id);
        if (optionalReservation.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reservation not found");
        }

        Optional<RestaurantTable> optionalTable = restaurantTableRepository.findById(tableId);
        if (optionalTable.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Table not found");
        }

        Reservation reservation = optionalReservation.get();
        RestaurantTable table = optionalTable.get();

        if (reservation.getStatus() == null || !reservation.getStatus().equalsIgnoreCase("PENDING")) {
            return ResponseEntity.badRequest().body("Only pending reservations can be approved");
        }

        List<RestaurantTable> validTables = getValidTablesForReservation(
                reservation.getPeopleCount(),
                reservation.getReservationTime(),
                reservation.getId()
        );

        boolean selectedTableIsValid = validTables.stream()
                .anyMatch(validTable -> validTable.getId().equals(table.getId()));

        if (!selectedTableIsValid) {
            return ResponseEntity.badRequest().body("Selected table is not valid for this reservation");
        }

        reservation.setTable(table);
        reservation.setStatus("APPROVED");
        table.setStatus("RESERVED");

        restaurantTableRepository.save(table);
        Reservation savedReservation = reservationRepository.save(reservation);

        reevaluatePendingReservations();

        return ResponseEntity.ok(savedReservation);
    }

    public ResponseEntity<?> deleteReservation(Integer id) {
        refreshReservationStatuses();

        Optional<Reservation> optionalReservation = reservationRepository.findById(id);
        if (optionalReservation.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reservation not found");
        }

        Reservation reservation = optionalReservation.get();
        RestaurantTable table = reservation.getTable();

        reservationRepository.deleteById(id);

        if (table != null) {
            table.setStatus("AVAILABLE");
            restaurantTableRepository.save(table);
        }

        reevaluatePendingReservations();

        return ResponseEntity.ok("Reservation deleted successfully");
    }

    public void refreshReservationStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> reservations = reservationRepository.findAll();

        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == null || reservation.getTable() == null || reservation.getTable().getId() == null) {
                continue;
            }

            Integer tableId = reservation.getTable().getId();

            if (reservation.getStatus().equalsIgnoreCase("APPROVED")) {
                if (orderServiceClient.hasActiveOrderForTable(tableId)) {
                    reservation.setStatus("COMPLETED");

                    RestaurantTable table = reservation.getTable();
                    if (table != null) {
                        table.setStatus("OCCUPIED");
                        restaurantTableRepository.save(table);
                    }

                    reservationRepository.save(reservation);
                    continue;
                }

                if (reservation.getReservationTime() != null &&
                        reservation.getReservationTime().plusMinutes(APPROVED_GRACE_MINUTES).isBefore(now)) {

                    reservation.setStatus("FAILED");

                    RestaurantTable table = reservation.getTable();
                    if (table != null) {
                        table.setStatus("AVAILABLE");
                        restaurantTableRepository.save(table);
                    }

                    reservationRepository.save(reservation);
                }
            }
        }

        reevaluatePendingReservations();
    }

    private void reevaluatePendingReservations() {
        List<Reservation> reservations = reservationRepository.findAll();

        for (Reservation reservation : reservations) {
            if (reservation.getStatus() != null
                    && reservation.getStatus().equalsIgnoreCase("PENDING")
                    && reservation.getPeopleCount() != null
                    && reservation.getReservationTime() != null) {

                List<RestaurantTable> validTables = getValidTablesForReservation(
                        reservation.getPeopleCount(),
                        reservation.getReservationTime(),
                        reservation.getId()
                );

                if (validTables.isEmpty()) {
                    reservation.setStatus("REJECTED");
                    reservationRepository.save(reservation);
                }
            }
        }
    }

    private List<RestaurantTable> getValidTablesForReservation(Integer peopleCount,
                                                               LocalDateTime requestedTime,
                                                               Integer ignoreReservationId) {
        List<RestaurantTable> allTables = restaurantTableRepository.findAll();
        List<RestaurantTable> validTables = new ArrayList<>();

        for (RestaurantTable table : allTables) {
            if (table.getCapacity() == null || table.getCapacity() < peopleCount) {
                continue;
            }

            if (isTableValidForReservation(table, requestedTime, ignoreReservationId)) {
                validTables.add(table);
            }
        }

        validTables.sort(Comparator.comparing(RestaurantTable::getTableNumber));
        return validTables;
    }

    private boolean isTableValidForReservation(RestaurantTable table,
                                               LocalDateTime requestedTime,
                                               Integer ignoreReservationId) {
        if (!isTableCurrentlyCompatible(table, requestedTime)) {
            return false;
        }

        List<Reservation> allReservations = reservationRepository.findAll();
        LocalDateTime requestedEnd = requestedTime.plusMinutes(APPROVED_TOTAL_BLOCK_MINUTES);

        for (Reservation reservation : allReservations) {
            if (ignoreReservationId != null && reservation.getId().equals(ignoreReservationId)) {
                continue;
            }

            if (reservation.getTable() == null || reservation.getTable().getId() == null) {
                continue;
            }

            if (!reservation.getTable().getId().equals(table.getId())) {
                continue;
            }

            if (reservation.getStatus() == null || !reservation.getStatus().equalsIgnoreCase("APPROVED")) {
                continue;
            }

            if (reservation.getReservationTime() == null) {
                continue;
            }

            LocalDateTime existingStart = reservation.getReservationTime();
            LocalDateTime existingEnd = existingStart.plusMinutes(APPROVED_TOTAL_BLOCK_MINUTES);

            boolean overlaps = requestedTime.isBefore(existingEnd) && existingStart.isBefore(requestedEnd);

            if (overlaps) {
                return false;
            }
        }

        return true;
    }

    private boolean isTableCurrentlyCompatible(RestaurantTable table, LocalDateTime requestedTime) {
        String status = table.getStatus() != null ? table.getStatus().toUpperCase() : "AVAILABLE";

        if (status.equals("AVAILABLE")) {
            return true;
        }

        if (status.equals("RESERVED")) {
            return true;
        }

        if (status.equals("OCCUPIED")) {
            OrderServiceClient.ActiveOrderResponse activeOrder =
                    orderServiceClient.getActiveOrderForTable(table.getId());

            if (activeOrder == null || activeOrder.getCreatedAt() == null) {
                return true;
            }

            LocalDateTime occupiedEnd =
                    activeOrder.getCreatedAt().plusMinutes(OCCUPIED_ORDER_BLOCK_MINUTES);

            return !requestedTime.isBefore(occupiedEnd);
        }

        return false;
    }

    private Integer getMaxTableCapacity() {
        return restaurantTableRepository.findAll().stream()
                .map(RestaurantTable::getCapacity)
                .filter(capacity -> capacity != null)
                .max(Integer::compareTo)
                .orElse(null);
    }
}