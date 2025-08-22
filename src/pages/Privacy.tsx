
import Navigation from '@/components/ui/navigation';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect the following types of information to provide and improve our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Personal Information:</strong> Name, email address, and profile information</li>
                <li><strong>Conversation Data:</strong> Your therapy chat sessions, messages, and interactions with our AI</li>
                <li><strong>Usage Data:</strong> How you use our service, features accessed, time spent, and preferences</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Providing personalized AI therapy and emotional support</li>
                <li>Analyzing your emotional patterns and providing insights</li>
                <li>Improving our AI models and service quality</li>
                <li>Sending important service updates and notifications</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Ensuring security and preventing fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the following trusted third-party services to operate EchoMind:
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 mb-2"><strong>Supabase:</strong> Database and authentication services</p>
                <p className="text-blue-800 mb-2"><strong>OpenAI:</strong> AI language processing for therapy conversations</p>
                <p className="text-blue-800"><strong>PayPal:</strong> Payment processing for premium subscriptions</p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                These services have their own privacy policies and security measures. We ensure they meet our 
                standards for data protection and user privacy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your data is stored securely using industry-standard encryption and security measures. We retain 
                your information for as long as necessary to provide our service and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Account Data:</strong> Retained until account deletion</li>
                <li><strong>Conversation History:</strong> Retained for up to 2 years or until deletion requested</li>
                <li><strong>Usage Analytics:</strong> Anonymized data may be retained indefinitely for service improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Privacy Rights (GDPR/CCPA)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Withdraw consent for data processing</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us at the email address provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content and features</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings, but disabling them may affect service functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement comprehensive security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>End-to-end encryption for sensitive data</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data centers and infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For any privacy-related questions, concerns, or data deletion requests, please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">Data Protection Officer</p>
                <p className="text-gray-700">
                  Email: <a href="mailto:ucchishths@gmail.com" className="text-primary hover:underline">
                    ucchishths@gmail.com
                  </a>
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  We will respond to all requests within 30 days as required by applicable privacy laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal 
                requirements. When we do, we will post the updated policy on this page and notify users of 
                significant changes via email or in-app notification.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
