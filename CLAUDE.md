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
```

## Project Structure

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Technologies
- **Next.js 15** with App Router
- **React 19** 
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **ESLint** with Next.js TypeScript rules

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