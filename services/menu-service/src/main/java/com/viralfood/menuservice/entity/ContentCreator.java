package com.viralfood.menuservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "content_creators", schema = "menu")
@Getter
@Setter
public class ContentCreator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String handle;

    @Column(nullable = false)
    private String followers;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false)
    private String review;

    @Column(name = "tiktok_url")
    private String tiktokUrl;

    @ManyToOne
    @JoinColumn(name = "food_item_id")
    private MenuItem foodItem;

    @ManyToOne
    @JoinColumn(name = "drink_item_id")
    private MenuItem drinkItem;
}