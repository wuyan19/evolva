## ADDED Requirements

### Requirement: OpenAI protocol support
The system SHALL support calling LLM APIs using the OpenAI chat completions protocol (`/v1/chat/completions`). The request SHALL include `Authorization: Bearer <api_key>` header, and the response SHALL be parsed from `choices[0].message.content`.

#### Scenario: Successful OpenAI call
- **WHEN** user sends a prompt with protocol set to "openai", a valid API key, base URL "https://api.openai.com/v1", and model "gpt-4o"
- **THEN** the system SHALL POST to `{baseURL}/chat/completions` with system and user messages, and return the text content from the response

#### Scenario: OpenAI call with empty API key
- **WHEN** user sends a prompt with an empty API key and protocol "openai"
- **THEN** the system SHALL send the request WITHOUT the Authorization header

#### Scenario: OpenAI API error
- **WHEN** the OpenAI API returns a non-2xx status code
- **THEN** the system SHALL return an error string containing the status code and response body

### Requirement: Anthropic protocol support
The system SHALL support calling LLM APIs using the Anthropic messages protocol (`/v1/messages`). The request SHALL include `x-api-key` and `anthropic-version: 2023-06-01` headers, `thinking: {type: "disabled"}`, and `max_tokens: 16384`. The response SHALL be parsed by finding the first `type=text` block in the `content` array.

#### Scenario: Successful Anthropic call
- **WHEN** user sends a prompt with protocol set to "anthropic", a valid API key, base URL "https://api.anthropic.com", and model "claude-sonnet-4-20250514"
- **THEN** the system SHALL POST to `{baseURL}/v1/messages` (stripping any trailing /v1 from input), and return the text from the first content block with type=text

#### Scenario: Anthropic call with empty API key
- **WHEN** user sends a prompt with an empty API key and protocol "anthropic"
- **THEN** the system SHALL send the request WITHOUT the x-api-key header

#### Scenario: Anthropic API error
- **WHEN** the Anthropic API returns a non-2xx status code
- **THEN** the system SHALL return an error string containing the status code and response body

### Requirement: Protocol routing
The system SHALL route to the correct API handler based on the `protocol` field. Value "anthropic" routes to Anthropic handler; all other values route to OpenAI handler.

#### Scenario: Route to Anthropic
- **WHEN** protocol field is "anthropic"
- **THEN** the request SHALL be handled by the Anthropic handler

#### Scenario: Route to OpenAI (default)
- **WHEN** protocol field is "openai" or any other value
- **THEN** the request SHALL be handled by the OpenAI handler
