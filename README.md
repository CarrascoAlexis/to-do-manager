# 📋 To-Do Manager

A modern, responsive task management application built with Vue 3, TypeScript, and Vite. This application provides a comprehensive solution for organizing and tracking tasks with features like status filtering, deadline management, and multiple theme support.

## 📖 Description

To-Do Manager is a full-featured task management application designed to help users organize their daily activities efficiently. The application offers an intuitive interface with a sidebar navigation system, allowing users to view tasks from different perspectives:

- **Home**: View all tasks with customizable status filters
- **Day Tasks**: Focus on tasks due today
- **Research**: Search and find tasks across your entire collection
- **Archived**: Access completed and archived tasks

Key features include:
- ✅ Create, edit, and delete tasks
- 📅 Set and track task deadlines with visual urgency indicators
- 🏷️ Organize tasks with tags (Work, Personal, Urgent, Low Priority)
- 🔍 Filter tasks by status (To Do, In Progress, Done, Cancelled)
- 🎨 8 beautiful themes (Light, Dark, Halloween, Christmas, France, Italy, Spain, LGBT)
- 📱 Fully responsive design for mobile, tablet, and desktop
- 💾 Persistent storage using browser localStorage
- 🌙 Dark mode support

## 🛠️ Technologies Used

### Core Framework & Build Tools
- **Vue 3.5.22** - Progressive JavaScript framework with Composition API
- **TypeScript 5.9.0** - Typed superset of JavaScript for improved code quality
- **Vite 7.1.11** - Next-generation frontend build tool for fast development

### Development Tools
- **vue-tsc 2.2.0** - TypeScript type checking for Vue components
- **vue-router 4.6.3** - Official router for Vue.js single-page applications
- **@vitejs/plugin-vue 5.2.1** - Official Vite plugin for Vue 3 support

### Code Quality
- **ESLint 9.17.0** - JavaScript and TypeScript linting
- **@vue/tsconfig** - Shared TypeScript configuration for Vue projects

### Styling
- **CSS Variables** - Dynamic theming system
- **Modular CSS** - Organized stylesheets for maintainability
- **Responsive Design** - Mobile-first approach with media queries

## 🚀 Project Initialization

### Prerequisites
- **Node.js** (version 16.x or higher)
- **npm** (version 7.x or higher) or **yarn**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/CarrascoAlexis/to-do-manager.git
   cd to-do-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run type-check
   ```

## 🎯 Launching the Project

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/` (or another port if 5173 is occupied).

### Production Build

Build the application for production:

```bash
npm run build
```

The optimized files will be generated in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Type Checking

Run TypeScript type checking without building:

```bash
npm run type-check
```

## 📁 Project Structure

```
to-do-manager/
├── public/              # Static assets
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable Vue components
│   │   ├── Sidebar.vue
│   │   ├── TaskCard.vue
│   │   └── TaskModal.vue
│   ├── views/          # Page components
│   │   ├── Home.vue
│   │   ├── DayTasks.vue
│   │   ├── Research.vue
│   │   └── Archived.vue
│   ├── router/         # Vue Router configuration
│   │   └── index.ts
│   ├── resources/      # Data models and utilities
│   │   └── tasks.ts
│   ├── styles/         # Global and component styles
│   │   ├── global.css
│   │   ├── themes.css
│   │   ├── app.css
│   │   ├── sidebar.css
│   │   ├── views.css
│   │   ├── task-card.css
│   │   └── task-modal.css
│   ├── App.vue         # Root component
│   └── main.ts         # Application entry point
├── index.html          # HTML entry point
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md           # Project documentation
```

## 🎨 Features

### Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Status Tracking**: To Do, In Progress, Done, Cancelled, Archived
- **Deadline Management**: Set deadlines with visual urgency indicators
- **Tag System**: Categorize tasks with multiple tags

### User Interface
- **Responsive Design**: Optimized for all screen sizes
- **Theme System**: 8 beautiful themes to choose from
- **Modal Views**: Detailed task information in elegant modals
- **Filter System**: Filter tasks by status on the Home page
- **Search Functionality**: Find tasks quickly in the Research view

### Data Persistence
- **localStorage**: Tasks are automatically saved to browser storage
- **Import/Export**: Demo data script for testing

## 🧪 Testing the Application

1. **Load Demo Data**: Open the browser console and paste the content of `demo-data.js`
2. **Explore Features**:
   - Navigate between different views using the sidebar
   - Click on task cards to view details in a modal
   - Use filter buttons on the Home page
   - Try different themes from the sidebar
   - Test responsive design by resizing the browser window

## 👨‍💻 Author

**Alexis Carrasco**
- GitHub: [@CarrascoAlexis](https://github.com/CarrascoAlexis)
- Project: [to-do-manager](https://github.com/CarrascoAlexis/to-do-manager)

## 📄 License

This project is available for educational and personal use.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for Vue 3 development. Special thanks to the Vue.js and Vite communities for their excellent documentation and tools.
