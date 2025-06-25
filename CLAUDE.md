# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (opens http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Run tests with Vitest
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Technologies

- **Next.js 15** with App Router
- **React 19**
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **ESLint** with Next.js TypeScript rules
- **Vitest** for testing with React Testing Library

### Architecture Overview

- **App Directory**: All routes and layouts are in `/app/`
- **Layout System**: Root layout in `app/layout.tsx` uses Geist fonts
- **Path Aliases**: `@/*` maps to project root (configured in tsconfig.json)
- **Styling**: Tailwind CSS with PostCSS processing
- **Fonts**: Geist Sans and Geist Mono from next/font/google

### Configuration Files

- `next.config.ts`: Next.js configuration (currently minimal)
- `tsconfig.json`: TypeScript with Next.js plugin and strict settings
- `eslint.config.mjs`: ESLint with Next.js core-web-vitals and TypeScript rules
- `postcss.config.mjs`: PostCSS with Tailwind CSS plugin

## Development Notes

- The project uses TypeScript with strict mode enabled
- All components should be TypeScript React components
- ESLint is configured for Next.js with TypeScript support
- Use the `@/` path alias for imports from the project root
- Components are expected to follow Next.js App Router conventions

## Next.js Best Practices

### Component Development
- Use TypeScript for all components with proper type definitions
- Follow the App Router conventions for page and layout components
- Use the `@/` path alias for imports from the project root
- Implement proper error boundaries and loading states
- Use Next.js built-in components (Image, Link) for optimization

### API Development
- Use proper HTTP status codes and error handling
- Implement proper authentication checks for protected routes
- Use TypeScript interfaces for request/response types
- Add proper CORS headers when needed
- Use Next.js runtime configurations appropriately

### Data Fetching Best Practices
参考: https://zenn.dev/akfm/books/nextjs-basic-principle

- **Server Components**: Use fetch directly in Server Components for initial data loading
- **Client Components**: Use React hooks (useState, useEffect) with proper error handling
- **Internal API Calls**: Always use absolute URLs or create utility functions for API calls
- **Error Handling**: Implement comprehensive error handling with user-friendly messages
- **Loading States**: Always provide loading indicators during data fetching
- **Caching**: Use Next.js built-in fetch caching where appropriate
- **Type Safety**: Define TypeScript interfaces for all API responses
- **Abort Controllers**: Use AbortController for cancellable requests when needed
- **Base URL**: Use environment variables or utility functions for API base URLs
- **Request Headers**: Always include proper Content-Type and authentication headers

### Testing Requirements
- **IMPORTANT**: Always run tests with Vitest before committing any changes
- Write comprehensive tests for new features and bug fixes
- Test both positive and negative scenarios
- Use React Testing Library for component testing
- Mock external dependencies properly
- Ensure all tests pass before proceeding to the next task

### Git Workflow
- **IMPORTANT**: Always commit changes after completing a feature or bug fix
- Run tests and lint checks before committing
- Use descriptive commit messages that explain what was changed and why
- Commit frequently with small, focused changes
- Never leave uncommitted changes when moving to the next task

### Performance
- Use Next.js Image component for image optimization
- Implement proper caching strategies
- Use dynamic imports for code splitting
- Optimize bundle size with proper tree shaking

## nextauth のコードをいじるときは必ず nextauth の公式ドキュメントを参照してください以下のリンクが公式ドキュメントです

https://next-auth.js.org/configuration/options
