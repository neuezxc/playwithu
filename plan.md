# Open-Source Chat App Development Plan

This document outlines the development plan for the open-source chat application. The plan is based on the requirements specified in `prompts.txt`.

## Phase 1: API Settings

The first phase focuses on creating the API settings modal, allowing users to configure the connection to their chosen LLM provider.

### 1.1. API Settings Modal

- **Objective:** Create a modal for API settings.
- **Trigger:** Appears when the "API Settings" button is clicked.
- **Tabs:**
    - Connection
    - Parameters

### 1.2. Connection Tab

- **Objective:** Configure the LLM provider and API credentials.
- **Components:**
    - **LLM Provider Selection:** A dropdown menu to select the LLM provider. Initially, this will only support "OpenRouter".
    - **API Key Input:** A text field for the user to input their API key. This will be stored in `localStorage`.
    - **Model ID Input:** A text field for the user to specify the model ID. This will also be stored in `localStorage`.

### 1.3. Parameters Tab

- **Objective:** Allow users to customize the LLM parameters.
- **Components:**
    - **Basic Parameters:**
        - **Temperature:** Input for setting the temperature.
        - **Max Tokens:** Input for setting the maximum number of tokens.
        - **Context Size:** Input for defining the context size.
    - **Advanced Settings:**
        - A collapsible section for advanced configurations.
        - **Repetition Penalty:** Input for the repetition penalty.
        - **Top-P:** Input for the Top-P value (defaulting to 0.8).

## Phase 2: Custom Prompts

This phase will implement the functionality for creating, managing, and activating custom system prompts.

### 2.1. Custom Prompt Modal

- **Objective:** Create a modal for managing custom prompts.
- **Trigger:** Appears when the "Custom Prompt" button is clicked.
- **Tabs:**
    - My Prompts
    - Create New

### 2.2. My Prompts Tab

- **Objective:** Display and manage existing prompts.
- **Components:**
    - **Default Prompt Card:** A card for the default system prompt.
    - **User Prompt Cards:** A list of cards, each representing a user-created prompt.
    - **Card Actions:**
        - **Activate:** A button to set the prompt as the active system prompt.
        - **Edit:** A button to navigate to the "Create New" tab with the prompt's data pre-filled.
        - **Delete:** A button to remove the prompt.
    - **Create Button:** A button to navigate to the "Create New" tab.

### 2.3. Create New Tab

- **Objective:** Allow users to create or edit a system prompt.
- **Components:**
    - **Prompt Name:** An input field for the prompt's name.
    - **Prompt Content:** A textarea for the prompt's content, with a token counter.
    - **Preview/Edit Toggle:** A toggle to switch between:
        - **Preview Mode:** Shows the prompt with placeholders (e.g., `{{user}}`) replaced with example values.
        - **Edit Mode:** Allows the user to continue editing the prompt.
    - **Insert Placeholders:** A set of buttons to insert reusable placeholders like `{{user}}`, `{{char}}`, `{{user_description}}`, and `{{char_description}}` into the prompt content.
    - **Save Button:** A button to save the new or edited prompt to `localStorage`.

## Phase 3: Character Management

This phase focuses on implementing CRUD (Create, Read, Update, Delete) functionality for characters.

### 3.1. Character Modal

- **Objective:** Create a modal for character management.
- **Trigger:** Appears when the "Character" button is clicked.

### 3.2. Character Management UI

- **Objective:** Provide an interface for managing characters.
- **Components:**
    - **Create Character Button:** Opens a form to create a new character.
    - **Import Button:** Functionality to import character data.
    - **Character Cards:** A section to display all character cards, including a default character.

### 3.3. Character Card

- **Objective:** Display character information and provide actions.
- **Components:**
    - **Display:** Shows the character's image, name, and bio.
    - **Actions:**
        - **Edit:** A button to modify the character's details.
        - **Delete:** A button to remove the character.

### 3.4. Character Creation/Edit Form

- **Objective:** A form to create or edit a character.
- **Fields:**
    - Character Name
    - Character Bio
    - Image URL
- **Action:** A "Save" button to create or update the character in `localStorage`.

## Phase 4: Chat Interface and API Integration

The final phase will integrate all the components into a functional chat interface.

### 4.1. Chat Components

- **Chat Input:** The main textarea for user input, along with a "Send" button.
- **Chat List:** The area where the conversation history is displayed.

### 4.2. API Integration

- **Objective:** Connect the chat interface to the OpenRouter API.
- **Workflow:**
    1. When a user sends a message, retrieve the active character and system prompt.
    2. Replace the placeholders in the system prompt with the actual data.
    3. Retrieve the API settings from `localStorage`.
    4. Construct the request payload for the OpenRouter API.
    5. Send the request to the API.
    6. Display the API's response in the chat list.