# Rentr

Rentr is a web application designed to provide a platform for users to manage their rental properties. The main features of the project include:

- User authentication and authorization
- Property management (add, edit, delete properties)
- Availability management (set availability for properties)
- Lead management (track potential renters)
- Calendar view for property availability
- Chat functionality for communication between property owners and renters

## Project Architecture and Usage

The project follows a modular architecture with the following main components:

- **Frontend**: Built with React, TypeScript, and Vite. The frontend is responsible for rendering the user interface and handling user interactions.
- **Backend**: Built with Next.js and TypeScript. The backend provides APIs for user authentication, property management, availability management, lead management, and chat functionality.
- **Database**: The project uses Supabase as the database for storing user data, property data, availability data, lead data, and chat messages.

To use the project, follow these steps:

1. Clone the repository.
2. Install the dependencies using `npm install` or `yarn install`.
3. Set up the development environment (see the next section for details).
4. Run the development server using `npm run dev` or `yarn dev`.
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Dependencies and Development Environment Setup

The project has the following dependencies:

- `react`: The React library for building the frontend.
- `react-dom`: The React DOM library for rendering the frontend.
- `vite`: The Vite build tool for development and production builds.
- `typescript`: The TypeScript language for type-safe development.
- `eslint`: The ESLint tool for linting the code.
- `postcss`: The PostCSS tool for processing CSS.
- `tailwindcss`: The Tailwind CSS framework for styling the frontend.
- `supabase`: The Supabase client for interacting with the database.

To set up the development environment, follow these steps:

1. Install Node.js and npm (or Yarn) if you haven't already.
2. Clone the repository.
3. Navigate to the `rentr` directory.
4. Install the dependencies using `npm install` or `yarn install`.
5. Set up the environment variables by creating a `.env` file in the `rentr` directory and adding the necessary variables (e.g., database connection string, API keys).
6. Run the development server using `npm run dev` or `yarn dev`.

## Contribution Guidelines

We welcome contributions to the project! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive commit messages.
4. Push your changes to your forked repository.
5. Open a pull request to the main repository.

Please ensure that your code follows the project's coding standards and passes all tests before submitting a pull request.

## Screenshots and Examples

Here are some screenshots and examples of the project's functionality:

### Property Management

![Property Management](screenshots/property-management.png)

### Availability Management

![Availability Management](screenshots/availability-management.png)

### Lead Management

![Lead Management](screenshots/lead-management.png)

### Calendar View

![Calendar View](screenshots/calendar-view.png)

### Chat Functionality

![Chat Functionality](screenshots/chat-functionality.png)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
