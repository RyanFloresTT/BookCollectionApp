# BookCollection

Welcome to **BookCollection**! This is a personal project that showcases my skills in full-stack development, integrating various technologies to create a seamless and efficient application.

## Overview

BookCollection is a web application designed to help users manage their personal book collections. The application features a robust backend built with Go, a dynamic frontend developed with React, and is containerized using Docker for easy deployment and environment management.

## Features

- **Authentication**: Secure user authentication is handled by a single endpoint in the Go backend, which redirects to the third-party service Auth0 for a streamlined and secure login experience.
- **Book Management**: Users can add, view, and manage their book collections with ease.
- **Modern Frontend**: A responsive and interactive user interface built with React.
- **Containerization**: Docker is used to compose the backend and frontend services together, ensuring consistent environments and simplifying deployment.

## Technologies Used

- **Go**: Backend API and authentication endpoint.
- **Auth0**: Third-party service for secure user authentication.
- **React**: Frontend library for building user interfaces.
- **Docker**: Containerization tool for managing and deploying the application.

## Getting Started

To get started with BookCollection, follow these steps:
    
1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/BookCollection.git
    cd BookCollection
    ```

2. **Set up environment variables**:
    Create a `.env` file in the root directory and add the necessary environment variables for Auth0 and other configurations.

3. **Build and run the application using Docker**:
    ```sh
    docker-compose up --build
    ```

4. **Access the application**:
    Open your web browser and navigate to `http://localhost:5000` to start using BookCollection.

---

![CI/CD](https://github.com/RyanFloresTT/BookCollectionApp/actions/workflows/ci-cd.yml/badge.svg)
- Frontend Code Coverage: [![codecov](https://codecov.io/gh/RyanFloresTT/BookCollectionApp/branch/main/graph/badge.svg)](https://codecov.io/gh/RyanFloresTT/BookCollectionApp)

Thank you for checking out BookCollection! I hope this project demonstrates my ability to create and manage a full-stack application using modern technologies. If you have any questions or feedback, feel free to reach out.
