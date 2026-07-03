package com.webtechblog.backend.entity.chat;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_room_participants",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "roomId",
                                "userId"
                        }
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomParticipantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;

    private Long userId;

    private Integer unreadCount;

    private Long lastReadMessageId;

    private Boolean isAdmin;

    private Boolean isMuted;

    private Boolean status;

    private LocalDateTime joinedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

        this.unreadCount = 0;

        this.lastReadMessageId = null;

        this.isAdmin = false;

        this.isMuted = false;

        this.status = true;

        this.joinedAt = LocalDateTime.now();

        this.createdAt = LocalDateTime.now();

        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {

        this.updatedAt = LocalDateTime.now();
    }
}