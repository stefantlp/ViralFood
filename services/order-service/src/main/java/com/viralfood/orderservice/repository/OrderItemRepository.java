package com.viralfood.orderservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.viralfood.orderservice.entity.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrder_Id(Integer orderId);
    Optional<OrderItem> findByOrder_IdAndMenuItemId(Integer orderId, Integer menuItemId);
}