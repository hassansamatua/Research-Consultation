# Zanzibar University Research Consultation System

A comprehensive web-based platform for managing postgraduate research supervision, submissions, and academic progress tracking at Zanzibar University.

## Features

### Core Functionality
- **Role-based Authentication**: Secure login system for students, supervisors, administrators, and super admins
- **Research Management**: Track research projects through multiple stages (proposal, chapters, final dissertation)
- **Document Upload & Review**: Secure file submission with supervisor feedback system
- **Supervisor Allocation**: Automated and manual supervisor-student assignment
- **Progress Tracking**: Real-time monitoring of research progress and deadlines
- **Messaging System**: Internal communication between students and supervisors
- **Reporting & Analytics**: Comprehensive reports for administrators

### User Roles
- **Students**: Submit documents, track progress, communicate with supervisors
- **Supervisors**: Review submissions, provide feedback, manage assigned students
- **Admins**: Allocate supervisors, generate reports, manage guidelines
- **Super Admins**: Full system control and user management

## Technology Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, MySQL Database
- **Authentication**: JWT tokens, bcrypt password hashing
- **File Upload**: Multer for secure document handling
- **Database**: MySQL with XAMPP environment

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- XAMPP (Apache + MySQL)
- Git

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd research-consultant
npm install
```

### 2. Database Setup
1. Start XAMPP and launch Apache & MySQL services
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `research_consultant`
4. Import the database schema:
   ```bash
   mysql -u root -p research_consultant < database/schema.sql
   ```
5. Initialize with sample data (optional):
   ```bash
   mysql -u root -p research_consultant < database/init.sql
   ```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=research_consultant
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Default Login Credentials

### Super Admin
- **Email**: superadmin@zu.ac.tz
- **Password**: password123

### Admin
- **Email**: admin@zu.ac.tz
- **Password**: password123

### Supervisor
- **Email**: dr.mohamed@zu.ac.tz
- **Password**: password123

### Student
- **Email**: student1@zumis.ac.tz
- **Password**: password123

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication functions
│   └── db.ts             # Database connection
└── components/           # React components

database/
├── schema.sql            # Database schema
└── init.sql              # Sample data initialization
```

## Database Schema

The system uses a normalized MySQL database with the following main tables:
- `users` - User accounts and authentication
- `students` - Student-specific information
- `supervisors` - Supervisor details and capacity
- `research_projects` - Research project tracking
- `submissions` - Document submissions by stage
- `supervisor_allocations` - Supervisor-student assignments
- `messages` - Internal messaging system
- `comments` - Supervisor feedback on submissions

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based sessions
- **Role-Based Access Control**: Granular permissions
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: Type and size validation
- **Input Validation**: Server-side validation for all inputs

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/supervisor` - Supervisor dashboard data
- `GET /api/dashboard/admin` - Admin dashboard data

## Development

### Adding New Features
1. Create API routes in `src/app/api/`
2. Add database functions in `src/lib/db.ts`
3. Create React components in `src/components/`
4. Add pages in `src/app/`

### Database Changes
1. Update `database/schema.sql`
2. Create migration scripts if needed
3. Update TypeScript types

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set secure JWT_SECRET
- Configure production database credentials
- Set NEXT_PUBLIC_APP_URL to production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support or questions:
- Contact the ICT Department at Zanzibar University
- Check the documentation in the system
- Review the database schema for data relationships

## License

© 2024 Zanzibar University. All rights reserved.
