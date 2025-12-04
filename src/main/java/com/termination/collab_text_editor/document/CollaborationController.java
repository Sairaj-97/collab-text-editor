package com.termination.collab_text_editor.document;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollaborationController {

    // Client sends to: /app/documents/{docId}/edit
    // Server broadcasts to: /topic/documents/{docId}
    @MessageMapping("/documents/{docId}/edit")
    @SendTo("/topic/documents/{docId}")
    public EditMessage handleEdit(
            @DestinationVariable String docId,
            EditMessage message
    ) {
        long now = System.currentTimeMillis();
        return new EditMessage(
                docId,
                message.getContent(),
                message.getSender(),
                now
        );
    }
}
