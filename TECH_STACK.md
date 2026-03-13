# CarbonX Frontend Tech Stack

This document outlines the core technologies, libraries, and tools used to build the CarbonX frontend application.

## Core Framework & Language
- **[Next.js](https://nextjs.org/) (v16.1.6)**: React framework with App Router for SSR, SSG, and API routes.
- **[React](https://react.dev/) (v19.2.3)**: JavaScript library for building user interfaces.
- **[TypeScript](https://www.typescriptlang.org/) (v5)**: Strongly typed programming language that builds on JavaScript for better DX and type safety.

## Styling & UI Architecture
- **[Tailwind CSS](https://tailwindcss.com/) (v4)**: Utility-first CSS framework for rapid and consistent UI development.
- **Glassmorphism & Custom CSS**: Heavy use of custom utility classes (like `.glass`, `.glass-thick`, `.glow`) combined with Tailwind to achieve the premium industrial aesthetic.
- **[shadcn/ui](https://ui.shadcn.com/)**: Reusable components built using Radix UI and Tailwind CSS.
- **[jsrepo](https://jsrepo.dev/)**: For managing and distributing reusable internal UI components.

## Data Visualization & Graphics
- **[Recharts](https://recharts.org/) (v3.8.0)**: Composable charting library built on React components for rendering performance and carbon data graphs.

## Animation & Interactions
- **[Framer Motion](https://www.framer.com/motion/) (v12.35.2)**: Open source, production-ready animation and gesture library for React.
- **[tw-animate-css](https://github.com/pheralb/tw-animate-css)**: Additional Tailwind animation utilities for entrance and exit effects.

## Infrastructure & Backend Services
- **[Firebase](https://firebase.google.com/) (v12.10.0)**: Backend-as-a-service providing:
  - **Firebase Realtime Database (RTDB)**: For live streaming IoT telemetry data.
  - **Firestore**: For persistent document storage and historical data logging.
  - **Firebase Authentication**: For secure user login and session management.

## Icons & Utilities
- **[Lucide React](https://lucide.dev/) (v0.577.0)**: Beautiful & consistent icon toolkit.
- **[clsx](https://github.com/lukeed/clsx) & [tailwind-merge](https://github.com/dcastil/tailwind-merge)**: For conditional class merging and resolving Tailwind conflicts.

## Developer Tooling
- **ESLint (v9) & Prettier**: For code linting, formatting, and adhering to consistent styles.
- **Babel React Compiler**: For optimized React component rendering.
