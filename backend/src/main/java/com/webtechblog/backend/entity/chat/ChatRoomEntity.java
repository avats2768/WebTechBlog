package com.webtechblog.backend.entity.chat;

import com.webtechblog.backend.enums.chat.RoomType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_rooms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uuid;

    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    private String name;

    private String image;

    @Column(name = "user1_id")
    private Long user1Id;

    @Column(name = "user2_id")
    private Long user2Id;

    private Long lastMessageId;

    @Column(columnDefinition = "LONGTEXT")
    private String lastMessage;

    private LocalDateTime lastMessageAt;

    private Boolean status;

    private Long createdBy;

    private Long updatedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

        this.uuid = UUID.randomUUID().toString();

        this.roomType = RoomType.PRIVATE;

        this.status = true;

        this.createdAt = LocalDateTime.now();

        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {

        this.updatedAt = LocalDateTime.now();
    }
}