
import React from 'react';
import Header from './Header';
import { ChatBot } from '@/components/support/ChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <ChatBot />
    </div>
  );
};

export default Layout;
