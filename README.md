# Weather App

A modern, feature-rich weather application built with React, TypeScript, and Vite. This application provides real-time weather information, alerts, and an interactive weather map with a clean, responsive user interface.

## Features

- **Real-time Weather Data**: Get current weather conditions and forecasts
- **Weather Alerts**: Stay informed about important weather events
- **Interactive Weather Map**: Visualize weather patterns and conditions
- **AI Weather Assistant**: Get personalized weather insights
- **Authentication**: Secure user authentication using Supabase
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - Vite (Build tool)
  - Shadcn UI Components
  - TailwindCSS (Styling)

- **Backend**:
  - Supabase (Backend as a Service)
  - Edge Functions for API integrations

- **Maps & Visualization**:
  - Mapbox integration for weather maps

## Project Structure

```typescript
src/
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   ├── WeatherAlerts
│   ├── WeatherAssistant
│   ├── WeatherMap
│   └── WeatherWidgets
├── contexts/          # React context providers
├── hooks/            # Custom React hooks
├── integrations/     # External service integrations
│   └── supabase/
├── lib/              # Utility functions
└── pages/            # Application pages
```

## Getting Started

1. **Prerequisites**
   - Node.js (Latest LTS version)
   - npm package manager

2. **Installation**

   ```bash
   # Clone the repository
   git clone https://github.com/Kennettechnologies/simplified-weather-app.git
   
   # Install dependencies
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add necessary environment variables (Supabase and Mapbox credentials)

4. **Development**

   ```bash
   # Start development server
   npm run dev
   ```

5. **Building for Production**

   ```bash
   # Create production build
   bun run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Components

### Core Components

1. **WeatherWidgets**
   - Displays current weather conditions
   - Shows temperature, humidity, wind speed, etc.

2. **WeatherAlerts**
   - Real-time weather alerts and warnings
   - Customizable alert preferences

3. **WeatherMap**
   - Interactive weather map using Mapbox
   - Various weather layers and visualizations

4. **WeatherAssistant**
   - AI-powered weather insights
   - Personalized weather recommendations

### Authentication & Authorization

- Protected routes using `ProtectedRoute` component
- Supabase authentication integration
- User settings and preferences management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Weather data providers
- Mapbox for map integration
- Supabase for backend services
- Shadcn UI for component library

## Getting Started

1. **Prerequisites**
   - Node.js (Latest LTS version)
   - Bun package manager

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/Kennettechnologies/simplified-weather-app.git
   
   # Install dependencies
   bun install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add necessary environment variables (Supabase and Mapbox credentials)

4. **Development**
   ```bash
   # Start development server
   npm run dev
   ```

5. **Building for Production**
   ```bash
   # Create production build
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Components

### Core Components

1. **WeatherWidgets**
   - Displays current weather conditions
   - Shows temperature, humidity, wind speed, etc.

2. **WeatherAlerts**
   - Real-time weather alerts and warnings
   - Customizable alert preferences

3. **WeatherMap**
   - Interactive weather map using Mapbox
   - Various weather layers and visualizations

4. **WeatherAssistant**
   - AI-powered weather insights
   - Personalized weather recommendations

### Authentication & Authorization

- Protected routes using `ProtectedRoute` component
- Supabase authentication integration
- User settings and preferences management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Weather data providers
- Mapbox for map integration
- Supabase for backend services
- Shadcn UI for component library
