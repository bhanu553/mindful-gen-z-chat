import { ArrowRight, Check, Heart, MessageSquare, Zap, Brain, Shield, Clock, Phone, AlertTriangle, Globe, Users, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';

const CrisisSupport = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full mb-6">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Crisis Support
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Immediate mental health support when you need it most
            </p>
          </div>

          {/* IMMEDIATE EMERGENCY */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">🏠 IMMEDIATE EMERGENCY</h2>
            </div>
            <p className="text-gray-300 mb-4">If you are in immediate physical danger or having a medical emergency:</p>
            <ul className="space-y-2 text-gray-300">
              <li>• Call 911 (United States)</li>
              <li>• Go to your nearest emergency room</li>
              <li>• Contact local emergency services in your country</li>
            </ul>
          </div>

          {/* SUICIDE & CRISIS SUPPORT */}
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <PhoneCall className="w-6 h-6 text-orange-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">🆘 SUICIDE & CRISIS SUPPORT</h2>
            </div>
            <p className="text-gray-300 mb-4">If you are having thoughts of suicide or self-harm:</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">United States - Primary Resources:</h3>
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🇺🇸 988 Suicide & Crisis Lifeline</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 988 (24/7, free, confidential)</li>
                    <li>• Chat: suicidepreventionlifeline.org</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🇺🇸 Crisis Text Line</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Text HOME to 741741 (24/7)</li>
                    <li>• Free crisis support via text message</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Specialized US Crisis Lines:</h3>
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🏳‍🌈 The Trevor Project (LGBTQ+ Youth)</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 1-866-488-7386 (24/7)</li>
                    <li>• Text START to 678-678</li>
                    <li>• Chat: thetrevorproject.org</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🩸 Self-Injury Outreach & Support</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 1-800-366-8288 (24/7)</li>
                    <li>• Text support and online resources</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🎖 Veterans Crisis Line</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 988, Press 1</li>
                    <li>• Text: 838255</li>
                    <li>• Chat: veteranscrisicline.net</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* INTERNATIONAL CRISIS RESOURCES */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Globe className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">🌐 INTERNATIONAL CRISIS RESOURCES</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Canada:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🇨🇦 Talk Suicide Canada</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 1-833-456-4566 (24/7)</li>
                    <li>• Text: 45645 (4pm-12am ET)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">United Kingdom:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🇬🇧 Samaritans</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 116 123 (24/7, free)</li>
                    <li>• Email: jo@samaritans.org</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Australia:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🇦🇺 Lifeline Australia</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 13 11 14 (24/7)</li>
                    <li>• Text: 0477 13 11 14</li>
                    <li>• Chat: lifeline.org.au</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">European Union:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🇪🇺 European Emergency Number</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 112 (General emergency)</li>
                  </ul>
                  <h4 className="font-semibold text-white mt-3">🇪🇺 Befrienders Worldwide</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Visit: befrienders.org for country-specific resources</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-white mb-3">Other Countries:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 text-gray-300">
                  <p>🇩🇪 Germany: 0800 111 0 111 (Telefonseelsorge)</p>
                  <p>🇫🇷 France: 3114 (National suicide prevention line)</p>
                  <p>🇮🇹 Italy: 800 86 00 22 (Telefono Amico)</p>
                  <p>🇪🇸 Spain: 717 003 717 (Teléfono de la Esperanza)</p>
                  <p>🇳🇱 Netherlands: 113 (Suicide prevention)</p>
                </div>
                <div className="space-y-1 text-gray-300">
                  <p>🇧🇪 Belgium: 1813 (Suicide prevention)</p>
                  <p>🇸🇪 Sweden: 020 22 00 60 (MIND Självmordslinjen)</p>
                  <p>🇳🇴 Norway: 815 33 300 (Mental Helse)</p>
                  <p>🇯🇵 Japan: 03-5774-0992 (TELL Lifeline)</p>
                  <p>🇰🇷 South Korea: 1393 (Suicide prevention hotline)</p>
                  <p>🇮🇳 India: 9152987821 (AASRA)</p>
                </div>
              </div>
            </div>
          </div>

          {/* DOMESTIC VIOLENCE & ABUSE */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">🏡 DOMESTIC VIOLENCE & ABUSE</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">United States:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🇺🇸 National Domestic Violence Hotline</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 1-800-799-7233 (24/7)</li>
                    <li>• Text START to 88788</li>
                    <li>• Chat: thehotline.org</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">International:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>🇬🇧 UK: 0808 2000 247 (National Domestic Abuse Helpline)</li>
                  <li>🇨🇦 Canada: 1-833-900-1010 (Assaulted Women's Helpline)</li>
                  <li>🇦🇺 Australia: 1800 737 732 (1800RESPECT)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SEXUAL ASSAULT SUPPORT */}
          <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-pink-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">👥 SEXUAL ASSAULT SUPPORT</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">United States:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🆘 RAINN National Sexual Assault Hotline</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 1-800-656-4673 (24/7)</li>
                    <li>• Chat: rainn.org</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">International:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>🇬🇧 UK: 0808 802 9999 (Rape Crisis England & Wales)</li>
                  <li>🇨🇦 Canada: Visit casac.ca for provincial resources</li>
                  <li>🇦🇺 Australia: 1800 737 732 (1800RESPECT)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* MENTAL HEALTH SUPPORT */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">🧠 MENTAL HEALTH SUPPORT</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">United States:</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white">🧠 NAMI National Helpline</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Call: 1-800-950-6264 (M-F, 10am-10pm ET)</li>
                      <li>• Information, support, and referrals</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">📞 SAMHSA National Helpline</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Call: 1-800-662-4357 (24/7)</li>
                      <li>• Treatment referral and information service</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Eating Disorders:</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">🍽 National Eating Disorders Association</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Call: 1-800-931-2237 (M-Th 9am-9pm, F 9am-5pm ET)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* PROFESSIONAL EMERGENCY SERVICES */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Phone className="w-6 h-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">🧑‍⚕ PROFESSIONAL EMERGENCY SERVICES</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Find Local Emergency Rooms:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>🇺🇸 US: hhs.gov/answers/health-care/where-can-i-find-emergency-room</li>
                  <li>🇬🇧 UK: Dial 111 for NHS non-emergency</li>
                  <li>🇨🇦 Canada: healthlinkbc.ca for local resources</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Mobile Crisis Response:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Many areas have mobile crisis teams</li>
                  <li>• Contact local emergency services for availability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* QUICK REFERENCE */}
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Phone className="w-6 h-6 text-gray-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">📞 QUICK REFERENCE</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3">US Emergency Numbers:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• 911 - Police, Fire, Medical Emergency</li>
                  <li>• 988 - Suicide & Crisis Lifeline</li>
                  <li>• 741741 - Crisis Text Line (Text HOME)</li>
                  <li>• 1-800-799-7233 - Domestic Violence Hotline</li>
                  <li>• 1-800-656-4673 - Sexual Assault Hotline</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">International Emergency:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• 112 - European Union Emergency Number</li>
                  <li>• 999 - UK Emergency Services</li>
                  <li>• 000 - Australia Emergency Services</li>
                  <li>• 911 - Canada Emergency Services</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisSupport; 