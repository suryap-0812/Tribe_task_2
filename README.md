# TribeTask

TribeTask is a comprehensive productivity and task management application designed to help you organize your work, collaborate with tribes, and track your progress.

## 🚀 Features

-   **Dashboard**: Get a high-level overview of your tasks and productivity.
-   **Task Management**: Create, track, and manage tasks with ease.
-   **Tribes**: Join or create tribes to collaborate with others (Community/Group features).
-   **Focus Sessions**: Built-in tools to help you stay focused and productive.
-   **Analytics**: Visualize your performance and task completion trends.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS
-   **Backend/Database**: Node.js, MongoDB Atlas
-   **Routing**: React Router DOM (v6)
-   **Icons**: Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd tribetask
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    -   Create a `.env` file in the root directory.
    -   Add your MongoDB connection string:
        ```env
        MONGODB_URI=your_mongodb_connection_string
        ```

4.  **Run the Application**:
    -   **Frontend**:
        ```bash
        npm run dev
        ```
    -   **Backend Connection Test**:
        ```bash
        npm run server
        ```

## 🚢 Deployment

This project allows for easy deployment on **Vercel** for the frontend.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add the `MONGODB_URI` environment variable in the Vercel project settings.
4.  Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
