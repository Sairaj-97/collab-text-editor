package com.termination.collab_text_editor.document;

public class EditMessage {

    private String docId;
    private String content;
    private String sender;   // userId or username
    private long timestamp;

    public EditMessage() {
    }

    public EditMessage(String docId, String content, String sender, long timestamp) {
        this.docId = docId;
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }

    public String getDocId() {
        return docId;
    }

    public void setDocId(String docId) {
        this.docId = docId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
