
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-card/50 backdrop-blur-md border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-md overflow-hidden">
              <img 
                src="/newlogo.jpg" 
                alt="EchoMind Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-foreground">EchoMind</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EchoMind. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
