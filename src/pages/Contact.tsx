
import Navigation from '@/components/ui/navigation';
import { Mail, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-full">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              For any questions, issues, or requests, feel free to contact us at:
            </p>
            
            <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-6 rounded-lg border border-primary/20">
              <a 
                href="mailto:ucchishths@gmail.com" 
                className="text-xl font-semibold text-primary hover:text-purple-600 transition-colors"
              >
                ucchishths@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Contact Form</h2>
            </div>
            <p className="text-gray-600 italic">
              A contact form will be available here soon for your convenience.
            </p>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>We typically respond within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
