<p align="center">
  <a href="https://github.com/ArjunChavan219/LibreChat-CourseTools">
    <img src="client/public/assets/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://github.com/ArjunChavan219/LibreChat-CourseTools">LibreChat CourseTools</a>
  </h1>
</p>

<p align="center">
  <a href="https://discord.librechat.ai"> 
    <img
      src="https://img.shields.io/discord/1086345563026489514?label=&logo=discord&style=for-the-badge&logoWidth=20&logoColor=white&labelColor=000000&color=blueviolet">
  </a>
  <a href="https://www.youtube.com/@LibreChat"> 
    <img
      src="https://img.shields.io/badge/YOUTUBE-red.svg?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
</p>

---

# 📃 About LibreChat CourseTools

**LibreChat CourseTools** is a customized version of the LibreChat platform, designed to enhance its capabilities for course management in educational settings. This version integrates tools for **professors, students, and teaching assistants (TAs)**, enabling:

- **Roster Management**: Add, update, and remove students and TAs within courses.
- **Role-Based Chat Access**: 
  - Professors can view and manage course chats.
  - TAs can assist students and manage rosters.
  - Students can engage in course-specific chats.
- **Seamless Authentication**: The system automatically assigns users to respective roles (Professor/Student/TA) based on their profiles.
- **Enhanced Modals and Forms**: Custom modals for adding courses, students, and TAs with a professional and accessible UI.

This fork builds upon the core features of LibreChat, with a focus on education-based enhancements while retaining the ability to integrate with popular AI models like OpenAI, Claude, and more.

---

# 📂 Features

- 🛠️ **Course Management Tools**
  - Professors can create courses with descriptions and IDs.
  - Teaching Assistants can manage rosters and participate in course chats.
  - Students can join courses and access chats based on enrollment.

- 💬 **Enhanced Chat Functionalities**
  - Course-specific chats for students, TAs, and professors.
  - Course-based chat rendering using `AuthContext`.

- 🎨 **Custom Professional UI**
  - Redesigned modals, tables, and layouts for managing rosters and courses.

- 📖 **Documentation & Deployment**
  - Local development setup and Docker-based deployment for seamless integration.

---

# 🚀 Deployment Instructions
## 🔒 Controlled Registration and Role Assignment

To ensure secure and managed access to the platform:

- **Invite-Only Registration**: 
  - Users must have an invite link to register.
  - Invited users are automatically added to the system as **Students** (default user role).

- **Admin Account Creation**:
  - To register as a **Professor (Admin)**, an **Admin Token** is required.
  - The Admin Token can be configured dynamically in the `.env` file under the key `ADMIN_TOKEN`.
  
### Configuration Example

Update your `.env` file:

```plaintext
# Admin Token for professor account creation
ADMIN_TOKEN=your-secure-admin-token
```

### Workflow

1. **Students**:
   - Register using an invite link provided by the course admin or system.
   - Automatically assigned the role `Student`.

2. **Professors (Admins)**:
   - During registration, provide the `ADMIN_TOKEN` in the url to create a **Professor** account.
   - Without the valid token, the user cannot register as a Professor.
   - Refer to .env.example file for more context.

This ensures role-based access control and prevents unauthorized account creation.


## Development

The project is divided into three layers:
1. **Data Layer**: `/data-provider`
   ```bash
   cd packages/data-provider
   npm run build
   ```
2. **Frontend**: `/client`
   ```bash
   cd client
   npm run dev
   ```
3. **Backend**: `/api` (But executed from root)
   ```bash
   npm run backend:dev
   ```

Visit `http://localhost:3090` for the local instance.

## Docker Deployment

1. Build the image:
   ```bash
   docker build -t librechat-local -f Dockerfile.multi .
   ```

2. Start the containers:
   ```bash
   docker-compose up --build -d
   ```

3. To reset volumes and start fresh:
   ```bash
   docker-compose down -v
   docker-compose up --build -d
   ```

3. Visit `http://localhost:3080` to access the platform.

---

# 🛠️ Development Highlights

- **Authentication**:
  - Integrated `AuthContext` to handle user roles dynamically (Student, Professor, TA).
  - Reused the existing routing logic with tailored component rendering.

- **Course Management**:
  - Developed APIs to manage courses, rosters, and role-specific operations.
  - Populated MongoDB collections for professors, students, and TAs, with associations using Mongoose.

- **UI Enhancements**:
  - Redesigned professional modals and forms for an intuitive user experience.
  - Focused on accessibility and responsiveness for educators and learners.

---

# 🌐 Resources

- **Original LibreChat**: [LibreChat Repo](https://github.com/danny-avila/LibreChat)
- **Documentation**: [LibreChat Docs](https://docs.librechat.ai)
- **Forked Repository**: [LibreChat-CourseTools](https://github.com/ArjunChavan219/LibreChat-CourseTools)

---

# 📝 Contributions

Contributions are welcome! If you have ideas for further enhancing the CourseTools features, feel free to:
- Open an issue
- Fork the repo and send a pull request

---

# 💖 Acknowledgments

This project is built on top of the open-source LibreChat platform.