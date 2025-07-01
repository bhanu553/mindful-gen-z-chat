import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, Lightbulb, ShieldCheck, MessageSquare, UploadCloud, Brain, Crown } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PaymentModal from '@/components/ui/payment-modal';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isPremium } = useAuth();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Unlock Your Inner Potential with AI-Powered Emotional Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            EchoMind provides personalized therapy and emotional guidance using advanced AI algorithms. Start your journey towards a happier, healthier you today.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/therapy">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white">
                Explore Therapy Modes
              </Button>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Features for 
              <span className="text-gradient"> Emotional Growth</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the tools and resources to support your mental wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Personalized Therapy */}
            <Card className="gradient-card p-6 border-2 border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Personalized Therapy</CardTitle>
                <CardDescription className="text-muted-foreground">AI-driven therapy tailored to your needs.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Customized treatment plans</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>Real-time progress tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3" />
                    <span>24/7 access to support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Mood Tracking */}
            <Card className="gradient-card p-6 border-2 border-border/50 hover:border-green-500/50 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Mood Tracking</CardTitle>
                <CardDescription className="text-muted-foreground">Monitor your emotional state and identify patterns.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Daily mood logging</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Insights into emotional trends</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Personalized recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Secure Uploads */}
            <Card className="gradient-card p-6 border-2 border-border/50 hover:border-yellow-500/50 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Secure Uploads</CardTitle>
                <CardDescription className="text-muted-foreground">Share your thoughts and feelings in a safe environment.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>Encrypted file storage</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>Anonymous data processing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-yellow-500 mr-3" />
                    <span>Privacy-focused design</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Path to 
              <span className="text-gradient"> Emotional Wellness</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your journey with our free plan or unlock advanced features with Premium
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Link to="/pricing/free" className="group">
              <Card className="gradient-card p-8 border-2 border-border/50 hover:border-primary/50 transition-all duration-300 group-hover:scale-105 cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Free Plan</CardTitle>
                  <div className="text-3xl font-bold mb-2">$0</div>
                  <p className="text-muted-foreground">Forever free</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>50 messages per day</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>5 uploads per day</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Basic emotional support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Core therapy modes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            {/* Premium Plan */}
            <Link to="/pricing/premium" className="group">
              <Card className="gradient-card p-8 border-2 border-primary/50 hover:border-primary transition-all duration-300 group-hover:scale-105 cursor-pointer relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-3 py-1 rounded-full font-semibold">
                    POPULAR
                  </span>
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Premium Plan</CardTitle>
                  <div className="text-3xl font-bold mb-2">$19</div>
                  <p className="text-muted-foreground">per month</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3" />
                      <span>300 messages per day</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3" />
                      <span>25 uploads per day</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3" />
                      <span>Export conversations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Emotional Wellbeing?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Join EchoMind today and start your personalized journey towards a happier, healthier you.
          </p>
          <div className="flex justify-center space-x-4">
            {user ? (
              <>
                {isPremium ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" onClick={() => setPaymentModalOpen(true)}>
                    Upgrade to Premium
                  </Button>
                )}
              </>
            ) : (
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white">
                  Sign In to Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <PaymentModal 
        open={paymentModalOpen} 
        onOpenChange={setPaymentModalOpen} 
      />
    </div>
  );
};

export default Index;
