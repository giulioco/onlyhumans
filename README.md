# OnlyHumans

OnlyHumans is a Chrome extension designed to detect and manage AI-generated tweets on Twitter. It uses OpenAI's GPT-4 model to analyze tweets and flag those that are likely to be AI-generated, helping users maintain a more authentic social media experience.

## Features

- Detects AI-generated tweets using OpenAI's GPT-4 model
- Flags suspicious tweets with a custom button
- Allows users to block and report accounts posting AI-generated content
- Stores flagged tweets for later review
- User-friendly interface for managing API keys and flagged tweets

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/giulioco/onlyhumans.git
   ```
2. Navigate to the project directory:
   ```
   cd onlyhumans
   ```
3. Install dependencies:
   ```
   bun install
   ```
4. Build the extension:
   ```
   bun run build
   ```
5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder in the project directory

## Usage

1. Click on the OnlyHumans extension icon in your Chrome toolbar
2. Enter your OpenAI API key when prompted
3. Browse Twitter as usual
4. The extension will analyze tweets in the background and flag suspicious ones
5. Click the flag button on suspicious tweets to block and report the account
6. Review flagged tweets in the extension popup

## Development

To set up the development environment:

1. Install dependencies:
   ```
   bun install
   ```
2. Start the development server:
   ```
   bun run dev
   ```
3. Make changes to the code in the `src` directory
4. The extension will automatically rebuild when changes are detected

## Project Structure

- `src/`: Source code for the extension
  - `App.tsx`: Main React component for the extension popup
  - `aiDetector.ts`: Logic for analyzing tweets using OpenAI's API
  - `background.ts`: Background script for handling extension events
  - `contentScript.ts`: Content script injected into Twitter pages
  - `main.tsx`: Entry point for the React application
- `public/`: Static assets
- `manifest.json`: Extension manifest file
- `vite.config.ts`: Vite configuration for building the extension

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- OpenAI API
- Chrome Extension API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
