## MODIFIED Requirements

### Requirement: Header area
The system SHALL display a header with the application name "evolva", subtitle "self-evolving application", and a settings toggle button. The settings button SHALL toggle the settings panel open/closed and change its label between "settings" and "close". The header SHALL include Import and Export buttons that call the Rust backend commands.

#### Scenario: Settings panel toggle
- **WHEN** user clicks the settings button
- **THEN** the settings panel SHALL toggle visibility and the button text SHALL switch between "settings" and "close"

#### Scenario: Export button
- **WHEN** user clicks the Export button
- **THEN** the system SHALL open a save dialog, call `export_app` with the selected path and a name, and log the result

#### Scenario: Import button with no unsaved versions
- **WHEN** user clicks the Import button and `get_mutation_count` returns 0
- **THEN** the system SHALL open a file dialog, call `import_app`, clear non-core DOM elements, and inject the returned code

#### Scenario: Import button with unsaved versions
- **WHEN** user clicks the Import button and `get_mutation_count` returns > 0
- **THEN** the system SHALL show a confirmation dialog before proceeding with the import flow
