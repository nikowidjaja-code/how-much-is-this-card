# How Much Is This Card

A modern web application built with Next.js for managing and tracking card values. This application allows users to add, view, and manage cards with an admin interface for authorized users.

## Features

- 🔐 User Authentication with NextAuth.js
- 👤 Role-based access control (Admin/User roles)
- 📱 Responsive design with Tailwind CSS
- ✨ Modern UI with smooth animations
- 🔄 Real-time form validation
- 🚀 Server-side rendering with Next.js
- 🎯 Advanced Voting System:
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
- **Database:** (To be added based on your implementation)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/how-much-is-this-card.git
cd how-much-is-this-card
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:

```env
# Add your environment variables here
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/              # Next.js 14 app directory
│   ├── add/         # Add card page
│   ├── cards/       # Cards listing page
│   └── api/         # API routes
├── components/      # Reusable components
│   ├── VotePanel.tsx    # Main voting interface
│   ├── VoteAccordion.tsx # Collapsible voting component
│   └── VotingHistory.tsx # User voting history
└── lib/            # Utility functions and configurations
```

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/how-much-is-this-card](https://github.com/yourusername/how-much-is-this-card)
