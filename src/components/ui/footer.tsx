
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card/80 backdrop-blur-md border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">EchoMind</span>
          </div>
          
          <nav className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 EchoMind. All rights reserved. Built with care for your emotional wellbeing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
