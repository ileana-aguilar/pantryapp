# Pantry App

Pantry App is an AI-powered recipe suggestion platform that helps users manage their pantry items and generate recipes based on available ingredients. The app utilizes the OpenAI API and GPT Vision API to analyze pantry contents and provide custom recipe suggestions.

## Features
- **Add, Delete, and Update Pantry Items**: Manage pantry inventory with a user-friendly interface.
- **Search and Filter**: Easily find pantry items using the built-in search and filter functionality.
- **AI-Powered Recipe Suggestions**: Generate recipe ideas based on the current pantry items using OpenAI API.
- **Image Upload and Analysis**: Upload images of pantry items through mobile or browser camera, and analyze them with GPT Vision API.
- **Firebase Backend**: Store and retrieve pantry data securely using Firebase.

## Technologies Used
- **Frontend**: Next.js, Material UI
- **Backend**: Firebase
- **APIs**: 
  - OpenAI API (for recipe suggestions)
  - GPT Vision API (for pantry item image analysis)
- **Hosting**: Vercel
- **Database**: Firebase

## Getting Started

### Prerequisites
- Node.js and npm installed
- Firebase account setup
- OpenAI API key

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/ileana-aguilar/pantryapp.git
    ```
2. Navigate to the project directory:
    ```bash
    cd pantryapp
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up Firebase and add your configuration in `.env`:
    ```bash
    FIREBASE_API_KEY=<your-firebase-api-key>
    FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
    ```

5. Add your OpenAI API key to `.env`:
    ```bash
    OPENAI_API_KEY=<your-openai-api-key>
    ```

6. Run the development server:
    ```bash
    npm run dev
    ```

7. Visit `http://localhost:3000` to view the app.

## Usage
1. **Manage Pantry Items**: Use the form to add, delete, or update pantry items.
2. **Upload Images**: Take photos of pantry items using your mobile or browser camera, and upload them for analysis.
3. **Generate Recipes**: Click 'Generate Recipe' to get AI-powered recipe suggestions based on your pantry contents.
