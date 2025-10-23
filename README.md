# 🚀 Job Portal - Full Stack Application

A comprehensive job portal platform built with modern web technologies, connecting job seekers with recruiters through an intuitive and feature-rich interface.

## 🌟 Features

### 👥 For Job Seekers
- **User Registration & Authentication** - Secure account creation and login
- **Job Search & Filtering** - Advanced search with multiple filter options
- **Job Applications** - Apply for jobs with cover letters and resume uploads
- **My Applications** - Track application status and history
- **Saved Jobs** - Bookmark interesting job opportunities
- **Profile Management** - Complete profile setup with skills and experience
- **Dashboard** - Personalized overview of job activities

### 🏢 For Recruiters
- **Company Profile Setup** - Comprehensive company information management
- **Job Posting** - Create detailed job listings with rich text descriptions
- **Application Management** - Review and manage job applications
- **Candidate Tracking** - Monitor application statuses and candidate progress
- **Dashboard Analytics** - View statistics and insights
- **Resume Downloads** - Access candidate resumes and documents

### 🔐 Security & Authentication
- **JWT-based Authentication** - Secure token-based login system
- **Role-based Access Control** - Different permissions for job seekers and recruiters
- **Protected Routes** - Secure navigation and data access
- **Password Encryption** - Secure password storage and validation

## 🛠 Tech Stack

### Backend
- **Java 21** - Modern Java features and performance
- **Spring Boot 3.x** - Enterprise-grade framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **Hibernate** - ORM for database operations
- **MySQL** - Relational database management
- **Maven** - Dependency management and build tool
- **JWT** - JSON Web Tokens for authentication

### Frontend
- **React 18** - Modern UI library with hooks
- **Bootstrap 5** - Responsive CSS framework
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Context API** - State management
- **Font Awesome** - Icon library

### Development Tools
- **Docker** - Containerization support
- **Git** - Version control
- **IntelliJ IDEA** - IDE for backend development
- **VS Code** - Frontend development environment
- **Postman** - API testing and documentation

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Java 21** or later
- **Node.js 16** or later
- **MySQL 8.0** or later
- **Maven 3.6** or later
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Aryanmalikk17/job-portal-fullstack.git
cd job-portal-fullstack
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE jobportal;
CREATE USER 'jobportal_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON jobportal.* TO 'jobportal_user'@'localhost';
FLUSH PRIVILEGES;

# Run database scripts
mysql -u jobportal_user -p jobportal < DB_Scripts/01-jobportal.sql
mysql -u jobportal_user -p jobportal < DB_Scripts/02-job-application-enhancement.sql
```

### 3. Backend Setup
```bash
cd backend

# Update application.properties with your database credentials
# Edit src/main/resources/application.properties

# Install dependencies and run
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on `http://localhost:3000`

### 5. Using Docker (Optional)
```bash
# Run the entire application with Docker Compose
docker-compose up -d
```

## 📁 Project Structure

```
job-portal-fullstack/
├── backend/                    # Spring Boot application
│   ├── src/main/java/         # Java source code
│   │   └── com/jobportal/     
│   │       ├── api/           # REST controllers
│   │       ├── config/        # Configuration classes
│   │       ├── entity/        # JPA entities
│   │       ├── repository/    # Data repositories
│   │       ├── services/      # Business logic
│   │       └── security/      # Security configurations
│   ├── src/main/resources/    # Configuration files
│   └── pom.xml               # Maven dependencies
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layers
│   │   ├── context/         # React context providers
│   │   └── styles/          # CSS stylesheets
│   └── package.json         # NPM dependencies
├── DB_Scripts/               # Database setup scripts
├── docker-compose.yml        # Docker configuration
└── README.md                # Project documentation
```

## 🔧 Configuration

### Backend Configuration
Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/jobportal
spring.datasource.username=jobportal_user
spring.datasource.password=your_password

# JWT Configuration
app.jwt.secret=your-secret-key
app.jwt.expiration=86400000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Frontend Configuration
Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Job Endpoints
- `GET /api/jobs` - Get all jobs with filters
- `POST /api/jobs` - Create new job (Recruiter only)
- `GET /api/jobs/{id}` - Get job details
- `PUT /api/jobs/{id}` - Update job (Recruiter only)
- `DELETE /api/jobs/{id}` - Delete job (Recruiter only)

### Application Endpoints
- `POST /api/applications/job/{jobId}/apply` - Apply for job
- `GET /api/applications/my-applications` - Get user applications
- `PUT /api/applications/{id}/withdraw` - Withdraw application
- `GET /api/applications/recruiter/applications` - Get recruiter applications

### Job Management Endpoints
- `POST /api/jobs/{id}/save` - Save job
- `DELETE /api/jobs/{id}/unsave` - Unsave job
- `GET /api/jobs/{id}/status` - Check job status

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📱 Screenshots

### Home Page
Modern landing page with job search functionality and featured opportunities.

### Job Seeker Dashboard
- Personalized job recommendations
- Application tracking
- Saved jobs management
- Profile completion status

### Recruiter Dashboard
- Posted jobs overview
- Application management
- Candidate pipeline
- Analytics and insights

### Job Application Flow
- Detailed job descriptions
- One-click apply process
- Resume upload functionality
- Cover letter submission

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Coding Standards
- Follow Java naming conventions for backend
- Use ESLint and Prettier for frontend code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Known Issues

- File upload size is limited to 10MB
- Email notifications are not yet implemented
- Advanced search filters need optimization

## 🔮 Future Enhancements

- [ ] **Email Notifications** - Application status updates
- [ ] **Advanced Analytics** - Detailed recruitment metrics
- [ ] **Video Interviews** - Integrated video calling
- [ ] **AI Job Matching** - Smart job recommendations
- [ ] **Mobile App** - React Native mobile application
- [ ] **Admin Panel** - Platform administration tools
- [ ] **Payment Integration** - Premium job posting features
- [ ] **Social Login** - Google/LinkedIn authentication

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aryan Malik**
- GitHub: [@Aryanmalikk17](https://github.com/Aryanmalikk17)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- React team for the amazing framework
- Bootstrap for responsive design components
- All contributors who helped improve this project

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues** - See if your question has already been answered
2. **Create an Issue** - Describe the problem with steps to reproduce
3. **Contact** - Reach out via email or social media

---

⭐ **Star this repository if you find it helpful!**

Built with ❤️ using Spring Boot and React
