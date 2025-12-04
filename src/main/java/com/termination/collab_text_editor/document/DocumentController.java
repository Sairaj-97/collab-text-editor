package com.termination.collab_text_editor.document;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final DocIdGenerator docIdGenerator;

    public DocumentController(DocumentRepository documentRepository,
                              DocIdGenerator docIdGenerator) {
        this.documentRepository = documentRepository;
        this.docIdGenerator = docIdGenerator;
    }

    // Create a new document
    @PostMapping
    public ResponseEntity<Map<String, String>> createDocument(@RequestBody CreateDocumentRequest request) {

        String docId = docIdGenerator.generate();

        DocumentEntity doc = new DocumentEntity();
        doc.setDocId(docId);
        doc.setTitle(request.title != null ? request.title : "Untitled Document");
        doc.setOwnerId(request.ownerId);
        doc.setContent("");
        doc.setCollaborators(List.of(request.ownerId));
        doc.setCreatedAt(Instant.now());
        doc.setUpdatedAt(Instant.now());

        documentRepository.save(doc);

        return ResponseEntity.ok(Map.of(
                "docId", doc.getDocId(),
                "title", doc.getTitle()
        ));
    }

    // Get a document by its docId
    @GetMapping("/{docId}")
    public ResponseEntity<DocumentEntity> getDocument(@PathVariable String docId) {
        DocumentEntity doc = documentRepository.findByDocId(docId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        return ResponseEntity.ok(doc);
    }

    // Update title/content of a document
    @PutMapping("/{docId}")
    public ResponseEntity<DocumentEntity> updateDocument(
            @PathVariable String docId,
            @RequestBody UpdateDocumentRequest request
    ) {
        DocumentEntity doc = documentRepository.findByDocId(docId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        if (request.title != null) {
            doc.setTitle(request.title);
        }
        if (request.content != null) {
            doc.setContent(request.content);
        }
        doc.setUpdatedAt(Instant.now());

        documentRepository.save(doc);

        return ResponseEntity.ok(doc);
    }
}
