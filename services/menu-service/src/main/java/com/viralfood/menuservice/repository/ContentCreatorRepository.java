package com.viralfood.menuservice.repository;

import com.viralfood.menuservice.entity.ContentCreator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentCreatorRepository extends JpaRepository<ContentCreator, Integer> {
}