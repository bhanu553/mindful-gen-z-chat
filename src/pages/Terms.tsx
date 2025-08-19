
import Navigation from '@/components/ui/navigation';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Service Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                EchoMind is an AI-powered emotional wellness platform that provides supportive conversations, 
                mood tracking, and personalized insights to help users navigate their emotional journey. Our 
                service uses advanced artificial intelligence to offer guidance and support for emotional well-being.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using EchoMind, you agree to be bound by these Terms and Conditions and our 
                Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Emotional Advice & Liability Disclaimer</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  IMPORTANT: EchoMind is NOT a substitute for professional medical or mental health care.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our AI provides general emotional support and guidance based on common therapeutic principles. 
                However, it cannot and should not replace professional therapy, counseling, or medical treatment.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are experiencing a mental health crisis, suicidal thoughts, or severe emotional distress, 
                please contact emergency services (911 in the US), a crisis hotline, or seek immediate professional help.
              </p>
              <p className="text-gray-700 leading-relaxed">
                EchoMind and its operators shall not be liable for any actions taken based on AI-generated advice 
                or for any outcomes resulting from the use of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Usage and Collection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect and process personal information including your name, email address, conversation data, 
                and usage patterns to provide and improve our service. This data is processed securely using 
                industry-standard encryption and security measures.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your conversation data may be used to improve our AI models and service quality, but will be 
                anonymized and aggregated to protect your privacy. We do not sell personal data to third parties.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For detailed information about our data practices, please review our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Subscription Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                EchoMind offers both free and pay-per-session tiers. Pay-per-session therapy is charged at 
                $5.99 per session with a maximum of 8 sessions per month, providing enhanced features including 
                advanced analytics, continuous therapeutic support, and personalized insights.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Pay-per-session charges are processed immediately upon session completion. There are no recurring 
                subscription fees. Users are limited to a maximum of 8 sessions per calendar month to maintain 
                therapeutic boundaries and proper pacing.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Refunds for individual sessions are provided on a case-by-case basis and at our discretion. 
                Refunds must be requested within 24 hours of session completion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. User Conduct and Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to use EchoMind responsibly and in accordance with applicable laws. You may not use our 
                service to harass others, distribute harmful content, or engage in illegal activities.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of your personal data and conversations. You have the right to access, 
                modify, or delete your data at any time by contacting us.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in 
                harmful behavior.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contact and Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms and Conditions are governed by the laws of the United States and the European Union's 
                General Data Protection Regulation (GDPR) where applicable.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these terms or our service, please contact us at:
                <br />
                <a href="mailto:ucchishths@gmail.com" className="text-primary hover:underline">
                  ucchishths@gmail.com
                </a>
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these terms will be resolved through binding arbitration or in the 
                courts of the jurisdiction where EchoMind is operated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms and Conditions from time to time. When we do, we will post the updated 
                terms on this page and update the "Last updated" date. Your continued use of EchoMind after any 
                changes constitutes acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
