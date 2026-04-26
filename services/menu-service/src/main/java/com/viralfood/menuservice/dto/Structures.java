package com.viralfood.menuservice.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

public class Structures {

    @Getter
    @Setter
    public static class CreateCategoryRequest {
        private String name;
    }

    @Getter
    @Setter
    public static class UpdateCategoryRequest {
        private String name;
    }

    @Getter
    @Setter
    public static class CreateMenuItemRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private Boolean available;
        private Integer categoryId;
    }

    @Getter
    @Setter
    public static class UpdateMenuItemRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private Boolean available;
        private Integer categoryId;
    }
}