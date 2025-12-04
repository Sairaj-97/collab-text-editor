package com.termination.collab_text_editor.auth;

public class RegisterRequest {
    public String username;
    public String email;
    public String password;

    // empty constructor needed for JSON deserialization
    public RegisterRequest() {
    }
}
