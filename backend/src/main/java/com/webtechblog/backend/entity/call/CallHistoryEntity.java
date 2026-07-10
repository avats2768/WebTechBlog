package com.webtechblog.backend.entity.call;

import com.webtechblog.backend.enums.call.CallStatus;
import com.webtechblog.backend.enums.call.CallType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "call_history")
public class CallHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            unique = true,
            nullable = false,
            updatable = false
    )
    private String uuid;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private Long callerId;

    @Column(nullable = false)
    private Long receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallType callType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime answeredAt;

    private LocalDateTime endedAt;

    @Column(nullable = false)
    private Long durationSeconds = 0L;

    private Long endedBy;

    private Long createdBy;

    private Long updatedBy;

    @Column(
            updatable = false
    )
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

        uuid = UUID.randomUUID().toString();

        createdAt = LocalDateTime.now();

        updatedAt = LocalDateTime.now();

    }

    @PreUpdate
    public void preUpdate() {

        updatedAt = LocalDateTime.now();

    }

}