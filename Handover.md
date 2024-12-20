# LibreChat CourseTools: Handover Documentation

## Introduction
This documentation provides an overview of the enhanced system built on top of LibreChat, along with setup instructions, feature details, and a guide to adding new functionalities. The enhancements include roster management, course-specific chats, role-based features, and other tools to make LibreChat suitable for an educational environment.

---

## **System Setup**


### Prerequisites
- **Node.js:** Version 20+
- **MongoDB:** Local or cloud-based instance
- **Docker & Docker Compose:** Installed and configured
- **Git:** For version control

### Overview of Original LibreChat Configuration

LibreChat is a modular and highly configurable platform built with a combination of modern web technologies. The following sections outline its general structure and configuration:


#### General Configuration and Setup

- **Development Environment:**
  - `.devcontainer`: Configures the development container with Docker and VSCode settings, ensuring a unified environment for all developers.
  - `.dockerignore` and `.gitignore`: Specifies files and directories to exclude from Docker builds and Git tracking, respectively.
  - `.env.example`: Provides a template for configuring environment variables necessary for running LibreChat.
  - `.husky`: Manages Git hooks, such as pre-commit hooks, to enforce code quality.
  - `.vscode`: Includes editor-specific settings like debugging configurations in `launch.json`.

- **Linting and Code Standards:**
  - `.eslintrc.js`: Enforces JavaScript/TypeScript code quality standards.
  - Prettier and other configurations ensure consistent formatting.

- **Continuous Integration and Deployment:**
  - **.github**: Contains workflows for CI/CD, issue templates, and documentation such as `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
  - GitHub Actions workflows cover automated builds, tests, and deployments.

---

#### Backend Logic and API Structure

The backend architecture of LibreChat is designed to be scalable, extensible, and modular. It integrates multiple AI models and supports advanced functionalities like caching and user authentication.

- **API Directory Structure:**
  - **`/api`**: The core directory for the backend server logic.
    - **`/server`**:
      - **Controllers:** Define logic for handling specific endpoints (e.g., user authentication, roster management).
      - **Middleware:** Includes reusable middlewares for request validation, error handling, and access control.
      - **Routes:** Declares and organizes API routes for different modules.
    - **`/models`**: Contains Mongoose schemas for defining MongoDB collections, such as `User`, `Session`, and `Course`.
    - **`/cache`**: Implements caching using libraries like Keyv, which supports multiple backends including Redis.
    - **`/utils`**: Provides utility functions for cryptographic operations, data validation, and other reusable tasks.

- **Key Functionalities:**
  - **AI Integration:** Supports multiple AI models like OpenAI and Anthropic, enabling diverse capabilities.
  - **User Management:** Endpoints for registration, authentication, and session management.
  - **Data Layer:** Encapsulates database interactions with clean and maintainable logic.

---

#### Frontend Application

The frontend is built with React and follows best practices for maintainability and performance. It leverages modern libraries like `react-query` for state management and API interaction.

- **Client Directory Structure:**
  - **`/client/src`**: The main directory for React components, contexts, hooks, and utilities.
    - **Components:** Organized into reusable UI and functional components.
    - **Hooks:** Custom hooks for managing state and interacting with the backend.
    - **Contexts:** Provides centralized state management for authentication, UI settings, and more.
  - **`/client/public`**: Contains static assets such as images, fonts, and the `index.html` template.

- **Frontend Features:**
  - **Dynamic UI:** Built with TailwindCSS for a responsive and modern interface.
  - **React Query:** Used for API interactions, ensuring efficient data fetching, caching, and synchronization.
  - **Localization:** Multilingual support using JSON-based translations.

---

#### Data Layer: `/packages/data-provider`

The `data-provider` package serves as a modular, reusable data service layer for LibreChat. It abstracts API calls, enforces type safety, and standardizes data fetching logic. 

- **Directory Structure:**
  - **`/types`**: Defines reusable TypeScript interfaces and types, ensuring consistent and clear data structures across services.
  - **`/data-service`**: Encapsulates all API interaction logic, centralizing fetch calls for reuse in both the frontend and backend.
  - **`/react-query-service`**: Implements hooks and caching mechanisms using `react-query`, facilitating efficient state synchronization in React components.

- **Key Advantages:**
  - Encourages separation of concerns by decoupling API logic from components.
  - Enhances maintainability and scalability by consolidating API interactions.
  - Streamlines testing by isolating data-fetching logic into distinct modules.

- **Build Process:**
  - Run `npm run build` to compile the `data-provider` module into a distributable format.
  - Integrate the built package into the frontend or backend by importing its services and types.

---

#### Deployment and Docker Configuration

- **Docker Files:**
  - `Dockerfile` and `Dockerfile.multi` define the containerized environments for development and production.
  - `docker-compose.yml`: Facilitates orchestrating the frontend, backend, and MongoDB in a unified setup.

- **Kubernetes and Helm:**
  - `/charts` directory includes Helm templates for deploying LibreChat in Kubernetes environments.

---

#### Testing and Localization

- **Testing Frameworks:**
  - Jest and Playwright configurations ensure robust testing for both frontend and backend functionalities.

- **Localization:**
  - `/localization` includes translations for supporting multiple languages and enhancing global usability.

---

This documentation aims to provide a comprehensive understanding of LibreChat's architecture and configuration, with special emphasis on the data-provider layer and its role in streamlining API interactions.

---

### API Calls in Frontend

This section outlines the structure and process for managing API calls in our frontend application, focusing on maintaining a clean architecture and leveraging `react-query` for state synchronization.

#### Architecture

1. **Separation of Concerns:**
    - **Data Types:** Defined TypeScript interfaces and types in `data-provider/src/types` to ensure type safety and maintain clarity across the application.
    - **Data Services:** Centralized API calls in `data-provider/src/data-service`, which manages all interactions with the backend. This abstraction enhances reusability and simplifies debugging by consolidating network logic into a single layer.
    - **React Query Services:** Introduced `react-query` services located in `data-provider/src/react-query-service`. These services handle data fetching, caching, and updates, keeping components clean and focused on rendering UI and handling user interactions.

2. **Build Process:**
    - After making changes to the `data-provider` module, run `npm run build` to compile the module. This ensures all types and service functions are correctly packaged and ready for use in the main frontend.

#### Usage in Frontend

- **Importing Services:** Components in the main frontend application import the built services and hooks from `data-provider`.
- **Using Hooks:** Custom hooks provided by the `data-provider` are utilized in React components for API interactions. These hooks encapsulate the complexity of asynchronous operations and state management, reducing boilerplate code in components.

----

### Local Development Setup
1. **Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd librechat-coursetools
   ```

2. **Set up the Environment:**
   - Copy `.env.example` to `.env` and configure the following:
     ```env
     HOST=localhost
     PORT=3080
     MONGO_URI=mongodb://localhost:27017
     ADMIN_TOKEN=admintoken123
     DOMAIN_CLIENT=http://localhost:3080
     DOMAIN_SERVER=http://localhost:3080
     ```

3. **Run the Services:**
   - Initial Installation:
     ```bash
     npm install
     ```

   - Data Provider:
     ```bash
     cd package/data-provider
     npm install
     npm run build
     ```
   - Frontend:
     ```bash
     cd client
     npm install
     npm run dev
     ```
   - Backend:
     ```bash
     cd api
     npm install
     cd ..
     npm run backend:dev
     ```

### Docker Setup
1. **Build the Docker Image:**
   ```bash
   docker build -t librechat-enhanced -f Dockerfile.multi .
   ```
2. **Run Docker Compose:**
   - Comment out the MongoDB link in `.env` if using Docker MongoDB.
   ```bash
   docker-compose up -d
   ```
3. **Stop Docker Services:**
   ```bash
   docker-compose down -v
   ```

Access the application at: `http://localhost:3080`

---

## **Features Overview**

### **1. Role-Based Features**
- **Students:**
  - View enrolled courses and chats.
- **TAs and Professors:**
  - Manage rosters, add/remove students, and view student-specific chats.

### **2. Roster Management**
- Add, edit, or remove students and TAs from a course.
- Filter and search rosters by name, email, or role.

### **3. Course Management**
- Professors can create and manage courses.
- Generate unique invite links for course registration.

### **4. Course-Specific Chat**
- Students and TAs can select a course to view its specific chat history.
- Professors can oversee all chats.

---

## **To add a New Feature: Observer Role**
The **Observer** role allows users to view chats without participating or modifying rosters.

### **Backend Changes**
1. **Update User Schema:**
   Add a new role in the `User` model:
   ```javascript
   const userSchema = new mongoose.Schema({
     name: String,
     email: String,
     role: {
       type: String,
       enum: ['Student', 'Professor', 'TA', 'Observer'],
       default: 'Student',
     },
     profileId: mongoose.Schema.Types.ObjectId,
   });
   ```

2. **Modify Roster API:**
   Update the `/api/courses/:id/roster` endpoint to include observers:
   ```javascript
   const course = await Course.findById(req.params.id)
     .populate('students')
     .populate('tas')
     .populate('observers');
   res.json(course);
   ```

3. **Observer Permissions:**
   Ensure observers have read-only access to chats by adding middleware:
   ```javascript
   const observerMiddleware = (req, res, next) => {
     if (req.user.role !== 'Observer') return res.status(403).send('Access Denied');
     next();
   };
   ```

### **Frontend Changes**
1. **Add Observer Role to Dropdowns:**
   Update the role dropdown in the roster management UI:
   ```tsx
   <select value={role} onChange={(e) => setRole(e.target.value)}>
     <option value="Student">Student</option>
     <option value="TA">TA</option>
     <option value="Observer">Observer</option>
   </select>
   ```

2. **Display Observer Chats:**
   Add a section in the dashboard for observers to view course chats:
   ```tsx
   {user.role === 'Observer' && (
     <div>
       <h2>Observed Chats</h2>
       <ChatList courseId={selectedCourseId} />
     </div>
   )}
   ```

### **Testing the Feature**
1. **Add an Observer:**
   - Use the roster management UI to assign a user the "Observer" role.

2. **Validate Permissions:**
   - Ensure the observer can only view chats and not make changes to rosters or messages.

---

## **Contributing**
1. **Fork the Repository:**
   ```bash
   git clone <your-fork-url>
   ```
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Run Tests:**
   ```bash
   npm test
   ```
4. **Submit a Pull Request:**
   Ensure you write clear commit messages and provide a detailed PR description.

---

## **Troubleshooting**
- **MongoDB Connection Error:**
  - Verify `MONGO_URI` in `.env`.
  - Ensure the database is running.
- **Environment Variables Not Loaded:**
  - Check the `.env` file syntax.
  - Restart the server.
- **Docker Issues:**
  - Use `docker-compose down -v` to reset volumes.

---

This document should serve as a reference for understanding, maintaining, and extending the enhanced LibreChat system.
