# MatchDay IQ - Smart Stadiums & Tournament Operations (FIFA 2026)

## Overview
**MatchDay IQ** is a GenAI-enabled solution designed to enhance stadium operations and the overall tournament experience for the FIFA World Cup 2026. The application leverages a Generative AI layer to provide dynamic crowd-routing intelligence, multilingual chatbot assistance, and real-time operational dashboarding for both fans and stadium staff.

## Key Features
- **Match Selector & Context**: Fans must select an active or upcoming match to enter the portal, providing context to their stadium location.
- **Dark / Light Mode**: A seamless, toggleable dark mode theme built natively with Tailwind CSS v4 and stored in `localStorage`.
- **Multilingual AI Assistant**: A contextual chatbot that translates and assists fans in real-time, parsing intelligent commands to automatically trigger UI changes.
- **Smart Crowd Routing & Interactive Map**: AI-powered dynamic routing to avoid congestion, paired with an accessible, keyboard-navigable SVG stadium map.
- **Real-Time Staff Operations Dashboard**: Heatmaps showing venue capacity, crowd density, and a live incident tracking system across the stadium.
- **Progressive Web App (PWA)**: Configured for offline capability and resilience in poor stadium reception environments.

## Architectural Design
1. **Multi-Portal Structure**: The application separates concerns cleanly between a `FanPortal` (for public interaction) and a `StaffPortal` (for stadium operations).
2. **GenAI Data Flow**: User input is sent to a backend Flask API service where a Gemini AI model determines intent and context. The response includes action tokens (e.g., `[ROUTE:Gate B]`) that are intercepted by the frontend to dynamically control the React UI.
3. **Component-Driven UI**: Strict single responsibility principle using functional React components and React Hooks (`useState`, `useEffect`, `useRef`).
4. **Utility-First Styling**: All styling is exclusively done with Tailwind CSS classes, completely avoiding messy inline styles.
5. **Secure & Accessible Execution**: Data rendered from AI responses is sanitized. The frontend enforces strict `PropTypes` for robust type-checking and uses ARIA attributes for screen-reader and keyboard accessibility.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4.
- **Backend**: Python 3.14, Flask, Google Generative AI (Gemini).
- **Image Processing**: Rembg (AI Background Removal), Pillow.
- **Tooling**: Node.js, npm, Git.
- **Testing**: Vitest (for unit testing and coverage tracking).

## Setup & Running

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run Backend API Server**
   ```bash
   cd backend
   python main.py
   ```

4. **Run Frontend Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm run test
   ```
