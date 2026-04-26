package com.viralfood.menuservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.viralfood.menuservice.dto.Structures.CreateMenuItemRequest;
import com.viralfood.menuservice.dto.Structures.UpdateMenuItemRequest;
import com.viralfood.menuservice.entity.Category;
import com.viralfood.menuservice.entity.MenuItem;
import com.viralfood.menuservice.repository.CategoryRepository;
import com.viralfood.menuservice.repository.MenuItemRepository;

@Service
public class MenuItemService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    public MenuItemService(CategoryRepository categoryRepository, MenuItemRepository menuItemRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemRepository.findAll());
    }

    public ResponseEntity<MenuItem> getMenuItemById(Integer id) {
        return menuItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> createMenuItem(CreateMenuItemRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Name is required");
        }

        if (request.getPrice() == null) {
            return ResponseEntity.badRequest().body("Price is required");
        }

        if (request.getCategoryId() == null) {
            return ResponseEntity.badRequest().body("Category id is required");
        }

        Optional<Category> optionalCategory = categoryRepository.findById(request.getCategoryId());
        if (optionalCategory.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
        }

        MenuItem menuItem = new MenuItem();
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setImageUrl(request.getImageUrl());
        if (request.getAvailable() != null) {
            menuItem.setAvailable(request.getAvailable());
        } else {
            menuItem.setAvailable(Boolean.TRUE);
        }
        menuItem.setCategory(optionalCategory.get());

        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemRepository.save(menuItem));
    }

    public ResponseEntity<?> updateMenuItem(Integer id, UpdateMenuItemRequest request) {
        Optional<MenuItem> optionalMenuItem = menuItemRepository.findById(id);
        if (optionalMenuItem.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        MenuItem menuItem = optionalMenuItem.get();

        if (request.getName() != null) {
            if (request.getName().isBlank()) {
                return ResponseEntity.badRequest().body("Name cannot be blank");
            }
            menuItem.setName(request.getName());
        }

        if (request.getDescription() != null) {
            menuItem.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            menuItem.setPrice(request.getPrice());
        }

        if (request.getImageUrl() != null) {
            menuItem.setImageUrl(request.getImageUrl());
        }

        if (request.getAvailable() != null) {
            menuItem.setAvailable(request.getAvailable());
        }

        if (request.getCategoryId() != null) {
            Optional<Category> optionalCategory = categoryRepository.findById(request.getCategoryId());
            if (optionalCategory.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
            }
            menuItem.setCategory(optionalCategory.get());
        }

        return ResponseEntity.ok(menuItemRepository.save(menuItem));
    }

    public ResponseEntity<?> deleteMenuItem(Integer id) {
        if (!menuItemRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu item not found");
        }

        menuItemRepository.deleteById(id);
        return ResponseEntity.ok("Menu item deleted successfully");
    }
}