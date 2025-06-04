# How Much Is This Card

A modern web application built with Next.js for managing, voting and tracking card values. This application allows users to add, view, and manage cards with an admin interface for authorized users.

## Features

-  User Authentication with NextAuth.js
-  Role-based access control (Admin/User roles)
-  Responsive design with Tailwind CSS
-  Modern UI with smooth animations
-  Real-time form validation
-  Server-side rendering with Next.js
-  Advanced Voting System:
  - Weighted voting based on user roles (Admin votes count 5x)
  - Time-based vote decay (votes lose weight over time)
  - Three voting tiers: Low (0.25), Mid (0.5), High (1.0)
  - Real-time vote distribution visualization
  - Voting history tracking
  - User profile voting activity

## Tech Stack

- **Framework:** Next.js 14
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Database:** NeonDB and Prisma

## Voting System

The application features a sophisticated voting system:

### Vote Weights
- **Role-based Weighting:**
  - Admin votes count 5x
  - Regular user votes count 1x

### Time-based Decay
- First week: 1.0 → 0.5
- Second week: 0.5 → 0.25
- 2-4 weeks: 0.25 → 0.1
- After 1 month: 0.1 (minimum weight)

### Voting Tiers
- Low (0.25): For lower value cards
- Mid (0.5): For medium value cards
- High (1.0): For higher value cards

### Features
- Real-time vote distribution visualization
- Individual vote history tracking
- Weighted vote calculations
- Vote tie resolution
- User profile voting activity

## License

This project is licensed under the MIT License.
