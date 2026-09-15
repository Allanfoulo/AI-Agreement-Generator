
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/styles/studio.css';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
const url = import.meta.env.VITE_CONVEX_URL;
const convex = url ? new ConvexReactClient(url) : null;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {convex ? <ConvexProvider client={convex}><App /></ConvexProvider> : <p>Configure VITE_CONVEX_URL and start the Convex backend.</p>}
  </React.StrictMode>
);
