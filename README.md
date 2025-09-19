# Symptom Tracker

A flexible symptom/food/medication tracking application that accepts natural language input and automatically structures it into a queryable format.

## Product Vision

Build an intelligent health diary that combines the ease of texting a friend with the analytical power of a database. Users can type naturally like "Had pizza, feeling crampy" and the system will parse, categorize, and store this in a structured but flexible schema that can evolve over time.

## Key Features

- **Zero friction entry**: As easy as sending a text message
- **Progressive structure**: Start with chaos, evolve toward order
- **Personal vocabulary**: Learn how THIS user describes THEIR symptoms
- **Actionable insights**: Not just tracking, but discovering patterns
- **Privacy first**: Sensitive health data stays secure

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: Neon (PostgreSQL)
- **UI**: DaisyUI + Tailwind CSS
- **LLM**: Claude API (via Anthropic SDK)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon account and database
- An Anthropic API key for Claude

### Setup

1. Clone the repository:
```bash
git clone https://github.com/colinrlly/symptom-tracker.git
cd symptom-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```
DATABASE_URL=your_neon_database_url
ANTHROPIC_API_KEY=your_claude_api_key
```

4. Set up the database:
   - Create a Neon project at https://neon.tech
   - Copy your connection string to the `DATABASE_URL` in `.env.local`
   - Run the migration files in order:
     - `neon/migrations/001_initial_schema.sql`
     - `neon/migrations/002_sample_data.sql` (optional, for testing)
   - Or use Drizzle to generate and run migrations: `npx drizzle-kit generate && npx drizzle-kit migrate`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses a flexible schema that evolves with user input:

- **users**: User accounts
- **entries**: Individual log entries with timestamps
- **field_types**: Dynamic field definitions (symptoms, foods, medications)
- **field_values**: Actual data values linked to entries and field types

This design allows the system to learn and adapt to each user's unique vocabulary and tracking needs.

## Development Phases

- [x] **Phase 1**: Project setup and database schema
- [ ] **Phase 2**: Manual entry UI and data storage
- [ ] **Phase 3**: Claude integration for natural language parsing
- [ ] **Phase 4**: Timeline and visualization
- [ ] **Phase 5**: Pattern detection and insights

## Contributing

This is a personal health tracking application. Please ensure any contributions maintain the privacy-first approach and do not introduce any features that could be used for medical diagnosis.

## License

MIT License - see LICENSE file for details.
