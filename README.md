# PowerCollectV3

An interactive table builder app with customizable columns and rows.

## Features

- Interactive data table with customizable columns and rows
- Status and priority badges for visual task management
- Responsive design using Tailwind CSS
- Dynamic row and column management
- Analytics tracking with Piwik Pro

## Live Demo

Visit the live application at: https://jblankenspoor.github.io/PowerCollectV3

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/jblankenspoor/PowerCollectV3.git
   cd PowerCollectV3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Analytics

This application uses Piwik Pro for analytics tracking. The integration is set up in `src/main.tsx`:

```typescript
import PiwikPro from '@piwikpro/react-piwik-pro';

/**
 * Initialize Piwik Pro analytics
 * @param {string} '3bde326f-e70c-4561-bd77-5de7a24b8637' - The container ID for tracking
 * @param {string} 'https://jacco.containers.piwik.pro' - The URL of the Piwik Pro instance
 */
PiwikPro.initialize('3bde326f-e70c-4561-bd77-5de7a24b8637', 'https://jacco.containers.piwik.pro');
```

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. Builds the project using Vite
2. Deploys the built files to the gh-pages branch
3. Makes the app available at https://jblankenspoor.github.io/PowerCollectV3

## Technologies

- React
- TypeScript
- Tailwind CSS
- Vite
- Piwik Pro Analytics
