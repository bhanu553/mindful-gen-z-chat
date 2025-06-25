
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';

const Terms = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">
            Terms & Conditions
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Service Overview</h2>
              <p>
                EchoMind provides AI-powered emotional support and therapy guidance through our web platform. 
                Our service is designed to assist users in processing emotions, developing coping strategies, 
                and supporting mental wellness through conversational AI technology.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Emotional Advice & Liability Disclaimer</h2>
              <p>
                <strong>IMPORTANT:</strong> EchoMind is NOT a replacement for professional mental health services. 
                Our AI provides general emotional support and should not be considered medical advice, diagnosis, 
                or treatment. If you are experiencing a mental health crisis, please contact emergency services 
                or a qualified mental health professional immediately.
              </p>
              <p>
                We are not liable for any decisions made based on AI-generated advice. Users assume full 
                responsibility for their mental health care and treatment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Usage and Collection</h2>
              <p>
                We collect and store conversation data, user preferences, and account information to provide 
                and improve our services. All data is encrypted and stored securely through Supabase. 
                Conversation data may be processed by OpenAI's GPT models for response generation.
              </p>
              <p>
                By using EchoMind, you consent to the collection and processing of your data as outlined 
                in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Subscription Terms</h2>
              <p>
                Premium subscriptions are billed monthly at $19/month. Subscriptions automatically renew 
                unless cancelled. You may cancel at any time through your account settings or by contacting 
                support. Refunds are provided on a case-by-case basis within 30 days of purchase.
              </p>
              <p>
                Free accounts have limited functionality including message limits and restricted features. 
                Premium accounts receive unlimited access to all features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. User Conduct and Rights</h2>
              <p>
                Users must be at least 18 years old to use EchoMind. You agree to use the service responsibly 
                and not for illegal activities. We reserve the right to suspend accounts for misuse.
              </p>
              <p>
                You retain ownership of your conversation data and may request deletion at any time. 
                We respect your privacy rights under GDPR and CCPA regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contact and Governing Law</h2>
              <p>
                These terms are governed by the laws of the United States. For questions about these terms, 
                contact us at ucchishths@gmail.com.
              </p>
              <p>
                These terms may be updated periodically. Continued use of the service constitutes acceptance 
                of updated terms.
              </p>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <p className="text-sm text-blue-800">
                <strong>Last Updated:</strong> December 2024
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
