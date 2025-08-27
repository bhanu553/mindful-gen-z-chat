
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
                We collect the following categories of information, which may include personal data as defined by applicable law:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Personal Information:</strong> Name, email address, account identifiers, billing information.</li>
                <li><strong>Conversation Data:</strong> Therapy chat sessions, messages, and other interactions with the AI or third-party professionals.</li>
                <li><strong>Usage Data:</strong> Features accessed, time spent, clickstream, preferences, engagement metrics.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, operating system, device identifiers, cookies, and metadata.</li>
                <li><strong>Derived & Anonymized Data:</strong> Aggregated insights, statistical outputs, or models generated from user data.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We process your information for the following lawful bases and purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Contractual Necessity:</strong> Providing services, processing payments, authenticating access.</li>
                <li><strong>Legitimate Interests:</strong> Improving AI models, analyzing emotional patterns, ensuring security, fraud prevention, service analytics.</li>
                <li><strong>Legal Obligations:</strong> Compliance with tax, anti-fraud, and regulatory requirements.</li>
                <li><strong>Consent (where required):</strong> For marketing or optional features.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We may also use anonymized or aggregated data for research, development, commercial partnerships, and other business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use trusted third-party processors, including but not limited to:
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 mb-2"><strong>Supabase:</strong> Database & authentication</p>
                <p className="text-blue-800 mb-2"><strong>OpenAI:</strong> Language processing for conversations</p>
                <p className="text-blue-800"><strong>PayPal:</strong> Payment processing</p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Each provider maintains its own privacy standards. By using the Platform, you consent to data transfer to and processing by such providers, which may be located outside your country of residence.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage & Retention</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Account Data:</strong> Retained until account deletion.</li>
                <li><strong>Conversation History:</strong> Retained for up to two (2) years unless earlier deletion is requested.</li>
                <li><strong>Usage Analytics & Anonymized Data:</strong> May be retained indefinitely.</li>
                <li><strong>Legal/Compliance Records:</strong> Retained as required by applicable law.</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  <strong>Force Majeure Clause:</strong> The Company shall not be liable for breaches or losses resulting from events beyond its reasonable control (including cyberattacks, power failures, natural disasters, or third-party service outages).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Privacy Rights (GDPR / CCPA / Global)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may, subject to verification, exercise certain rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Access:</strong> Obtain a copy of personal data.</li>
                <li><strong>Rectification:</strong> Correct inaccuracies.</li>
                <li><strong>Deletion:</strong> Request erasure (subject to legal/operational limits).</li>
                <li><strong>Portability:</strong> Request machine-readable format.</li>
                <li><strong>Restriction/Objection:</strong> Limit certain processing where applicable law grants this right.</li>
              </ul>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-gray-800 font-medium mb-2"><strong>Process:</strong></p>
                <p className="text-gray-700 text-sm">
                  To exercise rights, you must submit a written request with government-issued identification and a sworn statement of identity. 
                  Requests may require notarization in certain jurisdictions.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The Company reserves the right to decline requests where permitted by law, including where requests are excessive, unfounded, or compromise security or trade secrets.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies & Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Session management and login persistence.</li>
                <li>Preferences and personalization.</li>
                <li>Analytics and performance measurement.</li>
                <li>Security and fraud detection.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Users may control cookies via browser settings, but disabling may impair functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement commercially reasonable safeguards, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>End-to-end encryption for sensitive data.</li>
                <li>Regular monitoring, audits, and penetration testing.</li>
                <li>Role-based access control.</li>
                <li>Hosting in secure third-party data centers.</li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800 font-medium">
                  <strong>Disclaimer:</strong> No method of transmission or storage is 100% secure, and the Company disclaims liability for unauthorized access, loss, or disclosure not caused by its gross negligence.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your data may be transferred to and processed in countries outside your residence, including the United States. 
                By using the Platform, you consent to such transfers, even where the destination jurisdiction does not provide equivalent legal protections.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform is not intended for individuals under the age of 16 (or the minimum age required in your jurisdiction). 
                We do not knowingly collect data from children. If we learn we have collected such data, we will delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For privacy-related inquiries or rights requests, contact:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">📧 Data Protection Officer</p>
                <p className="text-gray-700">
                  Email: <a href="mailto:ucchishths@gmail.com" className="text-primary hover:underline">
                    ucchishths@gmail.com
                  </a>
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  We aim to respond within thirty (30) days, subject to lawful extensions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may revise this Privacy Policy from time to time. Updates will be posted here with a new "Last updated" date. 
                Continued use after updates constitutes acceptance of the revised Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
