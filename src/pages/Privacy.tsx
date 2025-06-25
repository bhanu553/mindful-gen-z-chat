
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';

const Privacy = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p>
                We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and authentication data</li>
                <li><strong>Therapy Chat Data:</strong> Conversations, uploaded images, and emotional tracking data</li>
                <li><strong>Usage Data:</strong> Login times, feature usage, and platform analytics</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Data</h2>
              <p>
                Your data is used to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide personalized AI therapy responses through OpenAI's GPT models</li>
                <li>Store and sync your conversation history across devices</li>
                <li>Generate emotional insights and progress tracking</li>
                <li>Improve our AI models and service quality</li>
                <li>Process payments and manage subscriptions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Third-Party Services</h2>
              <p>
                We use the following trusted services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Supabase:</strong> Database storage, authentication, and file storage</li>
                <li><strong>OpenAI:</strong> AI conversation processing (data is not stored by OpenAI)</li>
                <li><strong>PayPal:</strong> Payment processing for subscriptions</li>
                <li><strong>Google OAuth:</strong> Authentication services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Retention</h2>
              <p>
                We retain your data as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account data: Until account deletion</li>
                <li>Conversation history: Until manually deleted or account closure</li>
                <li>Analytics data: 24 months maximum</li>
                <li>Payment records: 7 years for legal compliance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights (GDPR/CCPA)</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your data ("right to be forgotten")</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of data processing for marketing</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Sessions</h2>
              <p>
                We use essential cookies and local storage for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication and session management</li>
                <li>Saving user preferences and settings</li>
                <li>Analytics and performance monitoring</li>
              </ul>
              <p>
                You can control cookies through your browser settings, though this may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Security</h2>
              <p>
                We implement industry-standard security measures including encryption at rest and in transit, 
                secure authentication, and regular security audits. However, no system is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact for Data Requests</h2>
              <p>
                For any privacy concerns, data deletion requests, or to exercise your rights, 
                contact us at: <strong>ucchishths@gmail.com</strong>
              </p>
              <p>
                We will respond to legitimate requests within 30 days.
              </p>
            </section>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-8">
              <p className="text-sm text-green-800">
                <strong>Last Updated:</strong> December 2024<br />
                <strong>Next Review:</strong> June 2025
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
