# USMBOK

A modern AI-powered knowledge consultation platform built with React and Vite.

## Features

- **Multi-Domain AI Consultation**: Access specialized AI assistants across various domains
- **Interactive Chat Interface**: Real-time conversations with domain-specific AI experts
- **Credit-Based System**: Manage usage with a flexible credit system
- **Conversation History**: Save and manage your consultation sessions
- **User Dashboard**: Track usage analytics and manage account settings
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit for complex state management
- **Routing**: React Router DOM for navigation
- **Icons**: Lucide React for consistent iconography
- **Animation**: Framer Motion for smooth interactions

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd usmbok
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Update the `.env` file with your configuration.

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The build files will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run serve
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   └── ...
├── pages/              # Page components
│   ├── user-dashboard/ # Dashboard functionality
│   ├── ai-chat-interface/ # Chat interface
│   ├── domain-selection/ # Domain selection
│   └── ...
├── styles/             # Global styles and Tailwind configuration
├── utils/              # Utility functions
├── App.jsx             # Main application component
├── Routes.jsx          # Application routing configuration
└── index.jsx           # Application entry point
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact our team or create an issue in the repository.