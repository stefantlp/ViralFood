package com.viralfood.reservationservice.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

public class Structures {

    @Getter
    @Setter
    public static class CreateReservationRequest {
        private String customerAlias;
        private String phoneNumber;
        private LocalDateTime reservationTime;
        private Integer peopleCount;
    }

    @Getter
    @Setter
    public static class UpdateReservationRequest {
        private String customerAlias;
        private String phoneNumber;
        private LocalDateTime reservationTime;
        private Integer peopleCount;
        private String status;
    }

    @Getter
    @Setter
    public static class ApproveReservationRequest {
        private Integer tableId;
    }

    @Getter
    @Setter
    public static class CreateTableRequest {
        private Integer tableNumber;
        private Integer capacity;
        private String status;
        private String accessCode;
    }

    @Getter
    @Setter
    public static class UpdateTableRequest {
        private Integer tableNumber;
        private Integer capacity;
        private String status;
        private String accessCode;
    }
}