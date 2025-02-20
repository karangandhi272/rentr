This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Purpose and Features

This project is a web application built with Next.js, designed to provide a platform for users to manage their rental properties. The main features of the project include:

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

- `next`: The Next.js framework for building the backend.
- `openai`: The OpenAI API client for integrating AI features.
- `react`: The React library for building the frontend.
- `react-dom`: The React DOM library for rendering the frontend.
- `tailwindcss`: The Tailwind CSS framework for styling the frontend.
- `typescript`: The TypeScript language for type-safe development.
- `eslint`: The ESLint tool for linting the code.
- `postcss`: The PostCSS tool for processing CSS.

To set up the development environment, follow these steps:

1. Install Node.js and npm (or Yarn) if you haven't already.
2. Clone the repository.
3. Navigate to the `backend` directory.
4. Install the dependencies using `npm install` or `yarn install`.
5. Set up the environment variables by creating a `.env` file in the `backend` directory and adding the necessary variables (e.g., database connection string, API keys).
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

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
