package com.termination.collab_text_editor.document;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {

    Optional<DocumentEntity> findByDocId(String docId);
}
