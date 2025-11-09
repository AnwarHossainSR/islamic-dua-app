# 🕌 Islamic Dua App

*A modern, feature-rich Islamic application for daily duas and spiritual challenges*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/anwar-hossains-projects-97e9ee31/v0-islamic-dua-app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## ✨ Features

### 🎯 **Daily Challenges**
- Interactive spiritual challenges with progress tracking
- Daily completion statistics and streaks
- Missed challenges tracking and recovery
- Personalized challenge recommendations

### 📖 **Dua Collection**
- Comprehensive collection of Islamic duas
- Arabic text with Bengali translations
- Audio recitations and pronunciation guides
- Categorized by occasions and purposes

### 🔐 **Advanced Authentication**
- Secure email/password authentication
- Biometric login support (fingerprint, face recognition)
- Multi-device WebAuthn integration
- Role-based access control

### 📊 **Analytics & Insights**
- Personal progress dashboards
- Activity logs and statistics
- Completion rates and trends
- Smart notifications and reminders

### 👨‍💼 **Admin Panel**
- User management system
- Content management for duas and challenges
- Database backup and restore
- System monitoring and logs

### 🎨 **Modern UI/UX**
- Dark/Light theme support
- Responsive design for all devices
- Offline functionality with PWA support
- Smooth animations and transitions

### 🤖 **AI-Powered Features**
- Smart dua recommendations based on time and context
- Natural language search for duas and content
- Personalized spiritual insights and progress analytics
- Intelligent challenge suggestions based on user behavior

## 🚀 Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Supabase
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** Supabase Auth + WebAuthn
- **AI Integration:** OpenAI GPT for smart recommendations
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/islamic-dua-app.git
   cd islamic-dua-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase credentials and other required variables.

4. **Set up the database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Generate Drizzle schema
   npm run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
islamic-dua-app/
├── app/                    # Next.js App Router
│   ├── (authenticated)/    # Protected routes
│   ├── api/               # API endpoints
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   └── admin/            # Admin panel components
├── lib/                  # Core utilities and configurations
│   ├── actions/          # Server actions
│   ├── db/              # Database schema and queries
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── hooks/               # Custom React hooks
├── scripts/             # Database setup scripts
└── public/              # Static assets
```

## 🔧 Configuration

### Database Setup
Run the SQL scripts in order:
```bash
# Initial setup
psql -f scripts/00-initial-setup.sql

# Create admin user
psql -f scripts/01-create-admin-user.sql

# Additional features
psql -f scripts/complete-database-schema-part1.sql
# ... continue with other parts
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_api_key  # Optional: For AI features
```

## 📱 Features in Detail

### Challenge System
- **Daily Tracking:** Automatic tracking of daily spiritual activities
- **Progress Analytics:** Visual progress charts and completion rates
- **Streak Management:** Maintain and recover challenge streaks
- **Missed Challenge Recovery:** Smart system to track and recover missed challenges

### Dua Management
- **Multi-language Support:** Arabic with Bengali translations
- **Audio Integration:** Pronunciation guides and recitations
- **Category Organization:** Organized by occasions, times, and purposes
- **Search & Filter:** Advanced search capabilities

### Security Features
- **Biometric Authentication:** Secure login with fingerprint/face recognition
- **Multi-device Support:** WebAuthn for secure cross-device authentication
- **Role-based Permissions:** Granular access control system
- **Data Encryption:** End-to-end encryption for sensitive data

## 🎯 Performance

- **Lighthouse Score:** 95+ across all metrics
- **Core Web Vitals:** Optimized for excellent user experience
- **Offline Support:** PWA with offline functionality
- **Database Optimization:** Efficient queries with proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo:** [https://vercel.com/anwar-hossains-projects-97e9ee31/v0-islamic-dua-app](https://vercel.com/anwar-hossains-projects-97e9ee31/v0-islamic-dua-app)
- **Documentation:** [Admin Setup Guide](ADMIN_SETUP.md) | [Biometric Setup](BIOMETRIC_SETUP.md)
- **Database Migration:** [Drizzle Migration Guide](DRIZZLE_MIGRATION.md)

## 🙏 Acknowledgments

- Built with ❤️ for the Muslim community
- Inspired by the need for modern Islamic applications
- Special thanks to all contributors and testers

---

*May Allah accept our efforts and make this application beneficial for the Ummah. Ameen.*