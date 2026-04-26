package com.viralfood.reservationservice.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.viralfood.reservationservice.service.ReservationService;

@Component
public class ReservationStatusScheduler {

    private final ReservationService reservationService;

    public ReservationStatusScheduler(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Scheduled(fixedRate = 120000)
    public void refreshReservations() {
        reservationService.refreshReservationStatuses();
    }
}