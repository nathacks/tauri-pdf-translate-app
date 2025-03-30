
# Tauri + React + Typescript App

A lightweight desktop app built with Tauri to quickly translate PDF files into different languages.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Cargo](https://doc.rust-lang.org/cargo/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/intro#install-tauri-cli)
- [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))

## Getting Started

### 1. Install Dependencies

Clone the repository and install the necessary dependencies.

```bash
# Clone the repository
git clone https://github.com/nathacks/tauri-pdf-translate-app
cd tauri-pdf-translate-app

# Install frontend dependencies
npm install
```

### 2. Install Rust Dependencies

Install Rust dependencies required by Tauri.

```bash
# Install the Rust toolchain
rustup update

# Install required Tauri dependencies
cargo install tauri-cli
```

### 3. Run the Development Environment

To start the development server for React and Tauri:

```bash
# Start the React frontend
npm run dev

# In another terminal, run the Tauri app
npm run tauri dev
```

The app will open in a native window with React running as the frontend and Rust handling the backend.

### 4. Build for Production

Once you're ready to package your app for production:

```bash
# Build the React app
npm run build

# Package the app with Tauri
npm run tauri build
```

This will generate a production-ready binary for your platform.

## Project Structure

- `src-tauri/`: Contains the Rust backend and Tauri configuration.
- `src/`: Contains the React frontend code.

## License

This project is licensed under the MIT License.