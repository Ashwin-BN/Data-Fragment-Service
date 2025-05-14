# Data Fragment Service

A highly scalable, cloud-native microservice engineered for seamless storage, retrieval, and management of diverse data fragments originating from IoT devices in industrial environments. Built with AWS services for optimal security, scalability, and integration efficiency, this service is designed to enhance data flow in connected ecosystems.

## Overview

The Data Fragment Service offers a secure, efficient API for managing various data fragment types, including text, JSON, and images. Equipped with format conversion capabilities and AWS Cognito authentication, it seamlessly integrates with industrial IoT systems to optimize data management in real time.

## Key Features

* **Multi-format Data Handling**

  * Store, retrieve, and manage:

    * **Text** – Plain text, Markdown, HTML, CSV
    * **Data Formats** – JSON, YAML
    * **Images** – PNG, JPEG, WebP, AVIF, GIF

* **Enterprise-Grade Security**

  * Seamless integration with **AWS Cognito** for identity management
  * Secure **JWT-based authorization** for every request
  * User isolation and role-based access control to protect sensitive data

* **Advanced Format Conversion**

  * Effortlessly convert between supported formats
  * Integrity checks and automatic validation
  * Ensures original format is preserved for auditability

* **Scalable Cloud Architecture**

  * Dockerized for containerized deployments
  * GitHub Actions for **CI/CD automation**
  * **Amazon ECS** and **Amazon ECR** for scalable, cloud-native deployments

## Architecture Overview

This microservice is designed with a cloud-native, microservices architecture that leverages:

* **API Gateway:** Manages external traffic and routes requests securely.
* **AWS Cognito:** Provides robust user authentication and authorization.
* **Amazon S3:** Ensures scalable, encrypted storage for binary data.
* **DynamoDB:** Optimized for low-latency metadata retrieval.
* **Amazon ECS:** Facilitates container orchestration for high availability.

## Technical Details

* **API Versioning:**

  * Current version: **v1.0** (`/v1/` prefix)
  * RESTful design principles with standardized JSON responses

* **Authentication:**

  * User authentication and authorization via **AWS Cognito**
  * Secure, stateless JWT tokens for session validation
  * Granular role-based access to ensure data privacy

* **Data Storage:**

  * Metadata handled by **DynamoDB** for rapid access
  * Binary data securely housed in **Amazon S3** with content validation

* **CI/CD Pipeline:**

  * **Continuous Integration:** Automated tests, lint checks, Docker builds, and image pushes to **DockerHub**
  * **Continuous Deployment:** Version-based Docker images are deployed to **Amazon ECR**, and ECS task definitions are updated automatically

## API Endpoints

### Health Check

```http
GET /v1/
```

Returns service status and metadata.

### Fragments

```http
POST /v1/fragments    # Create a new fragment
GET /v1/fragments     # List all user fragments
GET /v1/fragments/:id # Retrieve fragment data
GET /v1/fragments/:id/info  # Retrieve fragment metadata
PUT /v1/fragments/:id # Update existing fragment
DELETE /v1/fragments/:id  # Delete a fragment
```

## Format Support

| Type      | Extensions                               | Description                    |
| --------- | ---------------------------------------- | ------------------------------ |
| **Text**  | `.txt`, `.md`, `.html`, `.csv`           | Plain text and structured text |
| **JSON**  | `.json`, `.yaml`, `.yml`                 | Data exchange formats          |
| **Image** | `.png`, `.jpg`, `.webp`, `.avif`, `.gif` | Various image formats          |

## Getting Started

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/industrial-iot-data-fragment-service.git
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

```bash
cp .env.example .env
# Update .env with AWS credentials and Cognito settings
```

4. **Start the service:**

```bash
npm run dev
```

## Development

* **Run tests:**

```bash
npm test
```

* **Run with coverage:**

```bash
npm run coverage
```

* **Run integration tests:**

```bash
npm run integration
```

## CI/CD Pipeline

The CI/CD pipeline is orchestrated with **GitHub Actions**:

* **Continuous Integration (CI):**

  * Triggered on code commits to GitHub
  * Executes unit tests, integration tests, and linter checks
  * Builds Docker containers and publishes to **DockerHub**

* **Continuous Deployment (CD):**

  * Activated by version tags
  * Deploys Docker images to **Amazon ECR**
  * ECS task definitions are updated and deployed in real-time

## Security Considerations

* Endpoints are protected via **JWT-based authentication**
* **AWS Cognito** enforces user isolation and role-based access
* Rate limiting and API monitoring are implemented for enhanced security

## Acknowledgments

This project is part of the **CCP555 Program**, built with best practices in cloud-native development and microservices architecture.
