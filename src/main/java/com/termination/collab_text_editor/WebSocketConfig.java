package com.termination.collab_text_editor;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();  // fallback for browsers
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Clients subscribe to /topic/...
        config.enableSimpleBroker("/topic");
        // Clients send to /app/...
        config.setApplicationDestinationPrefixes("/app");
    }
}
