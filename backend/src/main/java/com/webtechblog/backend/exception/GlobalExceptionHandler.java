package com.webtechblog.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(
            RuntimeException ex
    ) {

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                ex.getMessage()
        );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    /**
     * Safety net for any DB-level unique/foreign-key constraint violation
     * that slips past explicit application checks (e.g.
     * existsByUsername/existsByEmail) — a race condition between two
     * concurrent registrations, or a constraint we haven't added an
     * explicit check for yet. Without this, DataIntegrityViolationException
     * would be caught by the generic RuntimeException handler above and
     * expose the raw SQL/Hibernate message (table names, constraint names,
     * column values) straight to the client. Placed before the
     * RuntimeException handler in resolution order since it's a subtype
     * and Spring picks the most specific match — no ordering annotation
     * needed, but keeping it distinct here for clarity.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(
            DataIntegrityViolationException ex
    ) {

        Map<String, Object> response = new HashMap<>();

        response.put(
                "message",
                "This value conflicts with an existing record. Please check your input and try again."
        );

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        Map<String, String> errors =
                new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errors);
    }
}