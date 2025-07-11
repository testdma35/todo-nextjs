import 'todomvc-app-css/index.css';
import React from 'react';

export const metadata = {
  title: 'Todo App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
