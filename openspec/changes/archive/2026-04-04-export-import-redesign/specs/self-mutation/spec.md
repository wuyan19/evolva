## MODIFIED Requirements

### Requirement: Mutation loop orchestration
The system SHALL orchestrate the full mutation loop: lock UI during processing, call LLM, extract and execute code, save mutation to backend, unlock UI. The prompt textarea SHALL be cleared on successful mutation. Context usage SHALL be updated after each cycle. After successful code injection, the system SHALL call `save_mutation` with the user instruction and extracted code.

#### Scenario: Full successful cycle
- **WHEN** user submits a valid prompt with configured settings
- **THEN** the system SHALL lock UI, log user message, call LLM, execute mutation, save mutation to backend, log success, clear prompt, unlock UI, and update context bar

#### Scenario: Processing lock
- **WHEN** a request is in progress and user clicks send again
- **THEN** the system SHALL ignore the click and not start a duplicate request

#### Scenario: Missing configuration
- **WHEN** user submits a prompt with no API key and no base URL configured
- **THEN** the system SHALL log an error "Configure settings first" and not call the LLM
