package com.termination.collab_text_editor.auth;

public class AuthResponse {
    public String userId;
    public String username;
    public String email;

    public AuthResponse(String userId, String username, String email) {
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}
