# 🚀 GetJob

A production-ready **Job Finder Platform** built with **Spring Boot** that helps students and fresh graduates discover internships and entry-level opportunities. The project focuses on scalable backend architecture, secure authentication, cloud deployment, and production engineering practices rather than just CRUD operations.

---

## ✨ Features

* 🔐 Secure Authentication & Authorization
* 💼 Browse and search internship & entry-level jobs
* 📄 Resume upload with AWS S3
* 👤 User profile management
* 📌 Save and manage job applications
* ⚡ Optimized database queries for fast response times
* 🛡️ Input validation and centralized exception handling
* 🚦 API rate limiting
* 🐳 Dockerized application
* ☁️ AWS cloud deployment
* 🔄 Automated CI/CD using GitHub Actions

---

## 🛠️ Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate

### Database

* PostgreSQL
* AWS RDS

### Cloud

* AWS EC2
* AWS S3
* AWS RDS

### DevOps

* Docker
* GitHub Actions
* CI/CD Pipeline

### Build Tool

* Maven

---

## 🏗️ Architecture

```
Client
   │
   ▼
REST API (Spring Boot)
   │
   ├── Authentication
   ├── Job Service
   ├── User Service
   ├── Resume Service
   │
   ▼
PostgreSQL (AWS RDS)

Resume Storage
       │
       ▼
     AWS S3
```

---

## ⚡ Performance Optimizations

* Database indexing for frequently queried fields
* Optimized JPA queries
* Efficient database access patterns
* Stateless REST API design
* Reduced API response latency through query optimization

---

## 🛡️ Production Features

* Global Exception Handling
* Bean Validation
* Rate Limiting
* Environment-based configuration
* Secure password encryption
* Layered architecture
* RESTful API design
* Docker containerization
* Cloud deployment

---

## 🚀 Deployment

The application is deployed using:

* AWS EC2
* AWS RDS (PostgreSQL)
* AWS S3
* Docker
* GitHub Actions CI/CD

Deployment pipeline:

```
Push Code
     │
     ▼
GitHub Actions
     │
     ▼
Build & Test
     │
     ▼
Docker Image
     │
     ▼
Deploy to AWS EC2
```

---

## 📂 Project Structure

```
src
├── controller
├── service
├── repository
├── entity
├── dto
├── security
├── exception
├── config
├── validation
└── util
```

---

## 🔧 Running Locally

### Clone the repository

```bash
git clone https://github.com/yourusername/getjob.git
cd getjob
```

### Configure environment variables

Create an `.env` file or configure application properties for:

```
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_REGION=
S3_BUCKET_NAME=

JWT_SECRET=
```

### Run with Maven

```bash
mvn clean install
mvn spring-boot:run
```

Or run with Docker

```bash
docker-compose up --build
```

---

## 📈 Future Improvements

* AI-powered resume analysis
* Resume-to-job matching
* Job recommendations
* Email notifications
* Company dashboards
* Admin analytics
* Elasticsearch integration
* Redis caching
* OpenAPI/Swagger documentation
* Kubernetes deployment


## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository, create a feature branch, and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ If you found this project useful

Give the repository a **star** ⭐ to support the project.
