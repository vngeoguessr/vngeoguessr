# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **vngeoguessr** - a Next.js 15 application built with React 19, TypeScript, and Tailwind CSS. The project appears to be a GeoGuessr-like application (based on the name), currently in initial development stage with the default Next.js template.

## Development Commands

### Core Development
- `npm run dev` or `pnpm dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Package Management
The project uses both npm (package-lock.json) and pnpm (pnpm-lock.yaml). Prefer `pnpm` commands when available.

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **React**: Version 19.1.0
- **TypeScript**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Bundler**: Turbopack (enabled in dev mode)

### Directory Structure
```
src/
  app/          # Next.js App Router directory
    layout.tsx  # Root layout with font configuration
    page.tsx    # Home page component
    globals.css # Global Tailwind styles
public/         # Static assets (SVG icons)
```

### Key Configuration
- **TypeScript**: Configured with path mapping (`@/*` → `./src/*`)
- **ESLint**: Next.js config with modern ESLint 9
- **Target**: ES2017 with modern module resolution

### Current State
The application is currently using the default Next.js template with Tailwind CSS. The main page displays the standard Next.js welcome screen with deployment and documentation links.

## Development Notes

### Font System
The app uses Geist font family (both Sans and Mono variants) loaded via `next/font/google` with CSS variables for consistent typography.

### Styling Approach
- Tailwind CSS v4 with modern configuration
- CSS variables for font families
- Dark mode support built into components
- Responsive design patterns (sm: breakpoints)

### File Editing
The main entry point for development is `src/app/page.tsx`. The layout is configured in `src/app/layout.tsx` with global styles in `src/app/globals.css`.