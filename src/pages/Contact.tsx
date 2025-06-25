
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Mail } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-6">
            Contact Us
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            For any questions, issues, or requests, feel free to contact us at:
          </p>
          
          <a 
            href="mailto:ucchishths@gmail.com"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
          >
            <Mail className="w-5 h-5" />
            <span>ucchishths@gmail.com</span>
          </a>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Future Contact Form
            </h3>
            <p className="text-gray-600 text-sm">
              We're working on a contact form for your convenience. 
              In the meantime, email is the best way to reach us.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
