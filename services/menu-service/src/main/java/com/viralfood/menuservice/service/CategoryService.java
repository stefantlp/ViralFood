package com.viralfood.menuservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.viralfood.menuservice.dto.Structures.CreateCategoryRequest;
import com.viralfood.menuservice.dto.Structures.UpdateCategoryRequest;
import com.viralfood.menuservice.entity.Category;
import com.viralfood.menuservice.entity.MenuItem;
import com.viralfood.menuservice.repository.CategoryRepository;
import com.viralfood.menuservice.repository.MenuItemRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    public CategoryService(CategoryRepository categoryRepository, MenuItemRepository menuItemRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    public ResponseEntity<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<List<MenuItem>> getMenuItemsByCategory(Integer categoryId) {
        return ResponseEntity.ok(menuItemRepository.findByCategory_Id(categoryId));
    }

    public ResponseEntity<?> createCategory(CreateCategoryRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Category name is required");
        }

        if (categoryRepository.findAll().stream().anyMatch(c -> c.getName().equalsIgnoreCase(request.getName().trim()))) {
            return ResponseEntity.badRequest().body("Category already exists");
        }

        Category category = new Category();
        category.setName(request.getName().trim());

        try {
            return ResponseEntity.status(201).body(categoryRepository.save(category));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body("Category already exists");
        }
    }

    public ResponseEntity<?> updateCategory(Integer id, UpdateCategoryRequest request) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isEmpty()) {
            return ResponseEntity.status(404).body("Category not found");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Category name is required");
        }

        Category category = optionalCategory.get();
        String newName = request.getName().trim();

        boolean duplicateExists = categoryRepository.findAll().stream()
                .anyMatch(c -> !c.getId().equals(id) && c.getName().equalsIgnoreCase(newName));

        if (duplicateExists) {
            return ResponseEntity.badRequest().body("Category already exists");
        }

        category.setName(newName);

        try {
            return ResponseEntity.ok(categoryRepository.save(category));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body("Category already exists");
        }
    }

    public ResponseEntity<?> deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Category not found");
        }

        categoryRepository.deleteById(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}