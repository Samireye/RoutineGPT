# RoutineGPT

An AI-powered routine optimization tool that combines wisdom from "Atomic Habits", "The 5 AM Club", and "Limitless" to help you create and maintain effective daily routines.

## Features

- 🤖 AI-powered routine generation using GPT-4
- 📚 Knowledge integration from three powerful books:
  - Atomic Habits by James Clear
  - The 5 AM Club by Robin Sharma
  - Limitless by Jim Kwik
- 🌓 Dark/Light mode support
- 📋 Save and manage your routines
- 📥 Download routines as markdown files
- 📱 Responsive design for all devices

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma (Database ORM)
- OpenAI API
- Vercel (Deployment)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
OPENAI_API_KEY=your_api_key_here
DATABASE_URL="postgres://..."  # For production
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/RoutineGPT.git
cd RoutineGPT
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server
```bash
npm run dev
```

### Deployment

1. Create a GitHub repository and push your code
2. Sign up for Vercel (vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy!

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.
