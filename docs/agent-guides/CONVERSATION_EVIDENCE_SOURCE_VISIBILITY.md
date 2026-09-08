# Conversation Evidence source visibility

ConversationEvidence keeps its `source` prop as internal audit metadata, but the reader-facing card does not render the source label or source URL.

Rationale: the AI auto-trading field note is based on private research records. Exposing repository-internal document paths in the public article adds noise without providing a verifiable public destination.

The card continues to show the record date, turn count, speaker labels, reconstruction context, and editorial annotation.
