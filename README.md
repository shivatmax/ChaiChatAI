# 🌈 ChitChat AI

ChitChat AI is an open-source interactive chat application that allows users to create and converse with AI friends. It's built with Next.js, React, and Supabase, offering a fun and engaging way to explore AI-powered conversations. 🤖💬

## ✨ Features

- **🎨 Create AI Friends**: Design unique AI companions with distinct personalities and knowledge bases.
- **💬 Dynamic Chat Interface**: Engage in real-time conversations with your AI friends.
- **🔀 Multiple Chat Sessions**: Manage and switch between different conversation sessions effortlessly.
- **👤 User Profiles**: Customize your own profile to enhance the chat experience.
- **📊 Conversation Insights**: Gain valuable insights from your chats with AI friends.
- **📱 Responsive Design**: Enjoy a seamless experience across desktop and mobile devices.
- **🚀 First-Time User Experience**: Guided tour for new users to explore the app's features.

## 🚀 Getting Started

### Prerequisites

- 📦 Node.js (v14 or later)
- 🧶 npm or yarn or bun
- 🗄️ Supabase account

### Installation

1. Fork the repository and clone it:

   ```bash
   git clone https://github.com/your-username/chitchat-ai.git
   ```

2. Navigate to the project directory:

   ```bash
   cd chitchat-ai
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```env
   NEXT_PUBLIC_SUPABASE_PROJECT_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_API_KEY=your_supabase_api_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_UNIFY_BASE_URL=your_unify_base_url
   NEXT_PUBLIC_UNIFY_API_KEY=your_unify_api_key
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

   or

   ```bash
   yarn dev
   ```

   or

   ```bash
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. 🎉

## 🏗️ Project Structure

- `src/app`: Main application code
  - 🧩 `components`: React components
  - 🎣 `hooks`: Custom React hooks
  - 🔌 `integrations`: Integration with external services (e.g., Supabase)
  - 📄 `pages`: Next.js pages
  - 🛠️ `services`: Business logic and API calls
  - 📝 `types`: TypeScript type definitions
  - 🔧 `utils`: Utility functions

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - ⚛️ React framework
- [React](https://reactjs.org/) - 🖥️ UI library
- [Supabase](https://supabase.io/) - 🗃️ Backend as a Service
- [Framer Motion](https://www.framer.com/motion/) - 🎭 Animation library
- [Tailwind CSS](https://tailwindcss.com/) - 🎨 CSS framework
- [OpenAI API](https://openai.com/api/) - 🧠 AI language model
- [Together AI](https://www.together.ai/) - 🤖 AI services

## 🤝 Contributing

We welcome contributions from the community! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 📜

## 🙏 Acknowledgments

- 🧠 OpenAI for their powerful language models
- ⚛️ The Next.js and React communities for their excellent documentation and support
- 👥 All contributors who have helped shape this project

## 🌟 Support the Project

If you find ChitChat AI helpful, please consider giving it a star on GitHub. It helps the project gain visibility and encourages further development!
