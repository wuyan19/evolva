## ADDED Requirements

### Requirement: Header area
The system SHALL display a header with the application name "evolva", subtitle "self-evolving application", and a settings toggle button. The settings button SHALL toggle the settings panel open/closed and change its label between "settings" and "close".

#### Scenario: Settings panel toggle
- **WHEN** user clicks the settings button
- **THEN** the settings panel SHALL toggle visibility and the button text SHALL switch between "settings" and "close"

### Requirement: Settings panel
The system SHALL provide a settings panel with fields for API Key (password input), Base URL (text input), Protocol (select: OpenAI/Anthropic), and Model (text input). Settings SHALL be persisted to localStorage with keys `evolva_key`, `evolva_base`, `evolva_model`, `evolva_protocol`. Settings SHALL be loaded from localStorage on startup.

#### Scenario: Save settings
- **WHEN** user fills in settings fields and clicks save
- **THEN** values SHALL be trimmed and stored in localStorage, and a system log entry "Settings saved." SHALL appear

#### Scenario: Load settings on startup
- **WHEN** the application starts
- **THEN** settings fields SHALL be populated from localStorage values, defaulting protocol to "openai"

### Requirement: Context usage bar
The system SHALL display a context usage bar showing estimated token count (DOM length / 4) relative to 128K. The bar SHALL change color: normal (accent), warning at >72% (amber), danger at >96% (red).

#### Scenario: Context display
- **WHEN** the application starts or after a mutation cycle completes
- **THEN** the context bar SHALL display "context {tokens} / 128k ({pct}%)" with appropriate fill width and color

### Requirement: Log area
The system SHALL display a scrollable log area with timestamped entries. Each entry SHALL show time, actor (system/user/error), and message. Log entries SHALL use textContent (not innerHTML) to prevent XSS. The log SHALL auto-scroll to the bottom on new entries. User-select SHALL be enabled for log content.

#### Scenario: Log entry creation
- **WHEN** a log event occurs (system message, user input, or error)
- **THEN** a new entry SHALL appear with timestamp, colored actor label, and message text

#### Scenario: Auto-scroll
- **WHEN** a new log entry is added
- **THEN** the log area SHALL scroll to show the latest entry

### Requirement: Input area
The system SHALL provide a textarea for user input and a send button. The textarea SHALL auto-grow up to 140px max height. Ctrl+Enter SHALL trigger execution. The send button SHALL show a spinner during processing and be disabled.

#### Scenario: Auto-growing textarea
- **WHEN** user types multiple lines of text
- **THEN** the textarea height SHALL grow to fit content, capped at 140px

#### Scenario: Keyboard shortcut
- **WHEN** user presses Ctrl+Enter in the textarea
- **THEN** the system SHALL trigger the execution flow

#### Scenario: Send button loading state
- **WHEN** a request is in progress
- **THEN** the arrow icon SHALL hide, a spinner SHALL appear, and the button SHALL have reduced opacity

### Requirement: Tauri environment check
The system SHALL verify `window.__TAURI__` exists on startup. If not found, the page SHALL display a message instructing the user to run `cargo tauri dev` and throw an error.

#### Scenario: Running in Tauri
- **WHEN** the application loads inside a Tauri webview
- **THEN** the application SHALL initialize normally

#### Scenario: Running outside Tauri
- **WHEN** the application loads in a regular browser without `window.__TAURI__`
- **THEN** the page body SHALL be replaced with a centered message "Evolva must run inside Tauri. Use: cargo tauri dev"
