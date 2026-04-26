package com.viralfood.reservationservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.viralfood.reservationservice.entity.RestaurantTable;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Integer> {
    Optional<RestaurantTable> findByAccessCode(String accessCode);
}