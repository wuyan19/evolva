## Requirements

### Requirement: DOM capture with compression
The system SHALL capture the current page DOM (`document.documentElement.outerHTML`) and apply three compression steps before sending to the LLM: (1) strip all `<script>` tags before `</body>`, (2) strip `<script type="text/plain">` system prompt tags, (3) truncate log entries to the last 10.

#### Scenario: Basic DOM capture
- **WHEN** user submits a prompt
- **THEN** the system SHALL capture the full DOM, strip scripts and system prompt, truncate logs to last 10 entries, and send the compressed DOM as the user message to the LLM

#### Scenario: Log truncation
- **WHEN** the log contains 20 entries and user submits a prompt
- **THEN** the captured DOM SHALL only include the last 10 log entries

#### Scenario: System prompt stripping
- **WHEN** the page contains a `<script type="text/plain" id="system-prompt">` element
- **THEN** the captured DOM SHALL replace it with `<!-- system prompt omitted -->`

### Requirement: Code block extraction
The system SHALL extract JavaScript code from the LLM response by matching fenced code blocks using backticks (\`\`\`javascript or \`\`\`js) or tildes (~~~javascript or ~~~js). If no code block is found, the system SHALL log an error.

#### Scenario: Standard code block found
- **WHEN** LLM responds with a message containing a \`\`\`javascript code block
- **THEN** the system SHALL extract the code content between the fences

#### Scenario: Tilde-fenced code block
- **WHEN** LLM responds with a message using ~~~javascript fencing
- **THEN** the system SHALL extract the code content between the tildes

#### Scenario: No code block found
- **WHEN** LLM responds without any fenced code block
- **THEN** the system SHALL log an error message "No JavaScript code block found" and log the full response to console

### Requirement: Script injection and execution
The system SHALL execute extracted code by injecting it as a `<script>` element in an async IIFE. Before injection, the system SHALL auto-convert `require()` calls to dynamic `import()` from esm.sh. The script element SHALL be removed after injection.

#### Scenario: Successful code execution
- **WHEN** a valid JavaScript code block is extracted
- **THEN** the system SHALL wrap it in an async IIFE, append as a script element, and remove the script element after execution

#### Scenario: require() auto-conversion
- **WHEN** the code contains `const foo = require('lodash')` or bare `require('lodash')`
- **THEN** these SHALL be converted to `const foo = (await import("https://esm.sh/lodash"))` and `(await import("https://esm.sh/lodash"))` respectively

#### Scenario: Runtime error in mutation code
- **WHEN** the injected code throws an error at runtime
- **THEN** the error SHALL be caught and logged to console.error as "Mutation Error", without crashing the application

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
