import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, ArrowLeft, Heart, Info, CheckCircle, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import timezones from '@/lib/timezones'; // We'll create this file for the timezone list

interface OnboardingFormData {
  // Personal Details
  full_name: string;
  email: string;
  phone_number: string;
  age: string;
  gender: string;
  country: string;
  timezone: string;
  primary_focus: string; // NEW
  
  // Mental Health Status
  previous_therapy: boolean | null;
  current_medication: boolean | null;
  mental_health_rating: string;
  other_struggles: string;
  
  // Safety Check
  self_harm_thoughts: boolean | null;
  last_self_harm_occurrence: string;
  current_crisis: boolean | null;
  
  // Consent
  ai_substitute_consent: boolean;
  data_processing_consent: boolean;
  emergency_responsibility_consent: boolean;
  calendar_reminders_consent: boolean;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnboardingComplete, refresh: refreshOnboardingStatus } = useOnboardingStatus();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false); // NEW

  const [formData, setFormData] = useState<OnboardingFormData>({
    full_name: '',
    email: user?.email || '',
    phone_number: '',
    age: '',
    gender: '',
    country: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    primary_focus: '',
    previous_therapy: null,
    current_medication: null,
    mental_health_rating: '',
    other_struggles: '',
    self_harm_thoughts: null,
    last_self_harm_occurrence: '',
    current_crisis: null,
    ai_substitute_consent: false,
    data_processing_consent: false,
    emergency_responsibility_consent: false,
    calendar_reminders_consent: false,
  });

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const sections = [
    { title: 'Personal Details', icon: Heart },
    { title: 'Mental Health Status', icon: Brain },
    { title: 'Safety & Crisis Check', icon: Info },
    { title: 'Consent & Agreements', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your onboarding.",
        variant: "destructive"
      });
      return;
    }

    // Validate required consents
    if (!formData.ai_substitute_consent || !formData.data_processing_consent || !formData.emergency_responsibility_consent) {
      toast({
        title: "Consent Required",
        description: "Please accept all required agreements to continue.",
        variant: "destructive"
      });
      return;
    }
    // Validate age
    if (!formData.age || parseInt(formData.age) < 18) {
      toast({
        title: "Age Requirement",
        description: "You must be at least 18 years old to use EchoMind.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate primary_focus
    if (!formData.primary_focus) {
      toast({
        title: "Primary Focus Required",
        description: "Please select what brings you to therapy today.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Saving onboarding data for user:', user.id);
      console.log('Form data being saved:', formData);
      
      // Create a clean data object with only the fields we know exist
      const onboardingData = {
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        country: formData.country || null,
        timezone: formData.timezone || null,
        primary_focus: formData.primary_focus,
        previous_therapy: formData.previous_therapy,
        current_medication: formData.current_medication,
        mental_health_rating: formData.mental_health_rating ? parseInt(formData.mental_health_rating) : null,
        other_struggles: formData.other_struggles || null,
        self_harm_thoughts: formData.self_harm_thoughts,
        last_self_harm_occurrence: formData.last_self_harm_occurrence || null,
        current_crisis: formData.current_crisis,
        ai_substitute_consent: formData.ai_substitute_consent,
        data_processing_consent: formData.data_processing_consent,
        emergency_responsibility_consent: formData.emergency_responsibility_consent,
        calendar_reminders_consent: formData.calendar_reminders_consent,
        completed: true
      };
      
      console.log('Clean onboarding data:', onboardingData);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .upsert(onboardingData)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('✅ Onboarding data saved successfully:', data);

      console.log('Onboarding data saved successfully');
      
      // Generate AI analysis and save it after onboarding is saved
      try {
        const analysisResponse = await fetch('/api/onboarding-complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id })
        });
        if (!analysisResponse.ok) {
          throw new Error(`API error: ${analysisResponse.status} ${analysisResponse.statusText}`);
        }
        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          console.log('✅ AI analysis generated and saved successfully');
        } else {
          console.log('⚠️ AI analysis not generated, but continuing');
        }
      } catch (analysisError) {
        console.error('❌ Error generating AI analysis:', analysisError);
        // Continue anyway - the analysis can be generated later
      }
      
      // Set completion flag and show success toast
      setJustCompleted(true);
      
      // Refresh onboarding status to update the hook
      await refreshOnboardingStatus();
      
      // Small delay to ensure database update is reflected
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Welcome to EchoMind!",
        description: "Your onboarding is complete. Let's begin your healing journey.",
      });
      // Redirect to therapy page after a 1-second delay (unconditional)
      setTimeout(() => {
        window.location.href = '/therapy';
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error saving onboarding:', error);
      console.error('Error stack:', error.stack);
      
      let errorMessage = "Failed to save your information. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-white/90">Full Name *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => updateFormData('full_name', e.target.value)}
          placeholder="Enter your full name"
          className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/90">Email Address</Label>
        <Input
          id="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          placeholder="your.email@example.com"
          disabled
          className="bg-white/5 border-white/10 text-white/70 placeholder-white/40"
        />
        <p className="text-sm text-white/60">Auto-filled from your account</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number" className="text-white/90">Phone Number (Optional)</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => updateFormData('phone_number', e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age" className="text-white/90">Age <span className="text-red-400">*</span></Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="120"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="25"
            required
            className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400"
          />
          {formData.age && parseInt(formData.age) < 18 && (
            <p className="text-sm text-red-400">You must be at least 18 years old to use EchoMind.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-white/90">Gender (Optional)</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData('gender', value)}
          >
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-white/90">Timezone *</Label>
        <Select
          value={formData.timezone}
          onValueChange={(value) => updateFormData('timezone', value)}
          required
        >
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white placeholder-white/60 focus:ring-blue-400 focus:border-blue-400">
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700 max-h-60 overflow-y-auto">
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_focus" className="text-white font-medium">What brings you to therapy today? <span className="text-red-400">*</span></Label>
        <Select
          value={formData.primary_focus}
          onValueChange={(value) => updateFormData('primary_focus', value)}
        >
          <SelectTrigger className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
            <SelectValue placeholder="Select your primary focus" />
          </SelectTrigger>
          <SelectContent className="mobile-dropdown-scroll">
            <SelectItem value="anxiety">Anxiety & Panic – Feeling overwhelmed, panic attacks, constant worry</SelectItem>
            <SelectItem value="depression">Depression & Low Mood – Sadness, hopelessness, emotional numbness</SelectItem>
            <SelectItem value="trauma">Trauma & Past Experiences – Childhood issues, traumatic events, flashbacks</SelectItem>
            <SelectItem value="relationship">Relationship Struggles – Breakups, attachment issues, communication problems</SelectItem>
            <SelectItem value="self-worth">Self-Worth & Confidence – Low self-esteem, inner criticism, identity confusion</SelectItem>
            <SelectItem value="stress">Stress & Burnout – Work pressure, life overwhelm, exhaustion</SelectItem>
            <SelectItem value="life-changes">Life Changes & Transitions – Career decisions, major life shifts, finding purpose</SelectItem>
            <SelectItem value="grief">Grief & Loss – Death of loved one, relationship endings, life changes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderMentalHealthStatus = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Have you attended therapy before?</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This helps us understand your familiarity with therapeutic processes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup value={formData.previous_therapy?.toString()} onValueChange={(value) => updateFormData('previous_therapy', value === 'true')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="therapy-yes" />
            <Label htmlFor="therapy-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="therapy-no" />
            <Label htmlFor="therapy-no">No</Label>
          </div>
        </RadioGroup>
      </div>



      <div className="space-y-3">
        <Label>Are you currently on medication for any mental health issue?</Label>
        <RadioGroup value={formData.current_medication?.toString()} onValueChange={(value) => updateFormData('current_medication', value === 'true')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="medication-yes" />
            <Label htmlFor="medication-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="medication-no" />
            <Label htmlFor="medication-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mental_health_rating">Rate your current mental health (1-10 scale)</Label>
        <Select value={formData.mental_health_rating} onValueChange={(value) => updateFormData('mental_health_rating', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select rating" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(10)].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} - {i + 1 <= 3 ? 'Poor' : i + 1 <= 6 ? 'Fair' : i + 1 <= 8 ? 'Good' : 'Excellent'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>



      <div className="space-y-2">
        <Label htmlFor="other_struggles">Other struggles (please specify)</Label>
        <Textarea
          id="other_struggles"
          value={formData.other_struggles}
          onChange={(e) => updateFormData('other_struggles', e.target.value)}
          placeholder="Describe any other challenges you're facing..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderSafetyCheck = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Safety Assessment</h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">These questions help us ensure you receive appropriate support.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Have you ever had thoughts of harming yourself or others?</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This information helps us provide appropriate care and resources</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup value={formData.self_harm_thoughts === null ? undefined : formData.self_harm_thoughts.toString()} onValueChange={(value) => updateFormData('self_harm_thoughts', value === 'true')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="self-harm-yes" />
            <Label htmlFor="self-harm-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="self-harm-no" />
            <Label htmlFor="self-harm-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.self_harm_thoughts && (
        <div className="space-y-2">
          <Label htmlFor="last_occurrence">When was the last occurrence?</Label>
          <Input
            id="last_occurrence"
            value={formData.last_self_harm_occurrence}
            onChange={(e) => updateFormData('last_self_harm_occurrence', e.target.value)}
            placeholder="e.g., Last week, few months ago, etc."
          />
        </div>
      )}

      <div className="space-y-3">
        <Label>Are you currently in a crisis or suicidal state?</Label>
        <RadioGroup value={formData.current_crisis?.toString()} onValueChange={(value) => updateFormData('current_crisis', value === 'true')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="crisis-yes" />
            <Label htmlFor="crisis-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="crisis-no" />
            <Label htmlFor="crisis-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Emergency Help</h4>
        <p className="text-sm text-red-700 dark:text-red-200 mb-3">
          If you're in danger or feeling suicidal, please contact a crisis helpline immediately:
        </p>
        <ul className="text-sm text-red-700 dark:text-red-200 space-y-1">
          <li>• US: 988 (Suicide & Crisis Lifeline)</li>
          <li>• UK: 116 123 (Samaritans)</li>
          <li>• Canada: 1-833-456-4566</li>
          <li>• Emergency: 911 or your local emergency number</li>
        </ul>
      </div>
    </div>
  );

  const renderConsent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="ai-substitute"
            checked={formData.ai_substitute_consent}
            onCheckedChange={(checked) => updateFormData('ai_substitute_consent', checked)}
          />
          <div>
            <Label htmlFor="ai-substitute" className="text-sm font-medium">
              I understand that EchoMind AI is not a substitute for licensed clinical therapy. *
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              EchoMind provides AI-powered support but cannot replace professional mental health treatment.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="data-processing"
            checked={formData.data_processing_consent}
            onCheckedChange={(checked) => updateFormData('data_processing_consent', checked)}
          />
          <div>
            <Label htmlFor="data-processing" className="text-sm font-medium">
              I give consent to AI-guided therapeutic processing of my shared data for personalized sessions. *
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Your data will be used to personalize your therapy sessions and improve your experience.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="emergency-responsibility"
            checked={formData.emergency_responsibility_consent}
            onCheckedChange={(checked) => updateFormData('emergency_responsibility_consent', checked)}
          />
          <div>
            <Label htmlFor="emergency-responsibility" className="text-sm font-medium">
              I understand that EchoMind is not responsible for emergency situations and I will seek help offline when needed. *
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              In crisis situations, please contact emergency services or crisis helplines immediately.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="calendar-reminders"
            checked={formData.calendar_reminders_consent}
            onCheckedChange={(checked) => updateFormData('calendar_reminders_consent', checked)}
          />
          <div>
            <Label htmlFor="calendar-reminders" className="text-sm font-medium">
              I agree to receive therapy session reminders on my Gmail calendar.
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Receive helpful reminders for your therapy sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          By completing this form, you acknowledge that you have read and understood our{' '}
          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0: return renderPersonalDetails();
      case 1: return renderMentalHealthStatus();
      case 2: return renderSafetyCheck();
      case 3: return renderConsent();
      default: return null;
    }
  };

  const isValidSection = () => {
    switch (currentSection) {
      case 0:
        return formData.full_name.trim() !== '' && 
               formData.age && 
               parseInt(formData.age) >= 18;
      case 1:
        return formData.previous_therapy !== null && formData.current_medication !== null;
      case 2:
        return formData.self_harm_thoughts !== null && formData.current_crisis !== null;
      case 3:
        return formData.ai_substitute_consent && formData.data_processing_consent && formData.emergency_responsibility_consent;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat onboarding-bg"
        style={{
          backgroundImage: 'url("/lovable-uploads/onboardingimage.jpg")',
        }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div> {/* Overlay for readability */}
  
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400/80 to-purple-500/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow-lg">EchoMind</h1>
          <p className="text-xl text-white italic text-shadow-md">AI Therapy. Real Healing.</p>
        </div>
  
                {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === currentSection;
              const isCompleted = index < currentSection;

              return (
                <div key={index} className="flex flex-col items-center justify-center w-full">
                  <div className={`flex flex-col items-center progress-step w-full ${isActive ? 'active' : ''} ${isActive || isCompleted ? 'text-blue-300' : 'text-white/60'}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center mb-2 mx-auto ${
                      isActive ? 'border-blue-300 bg-blue-300/20 shadow-lg shadow-blue-300/25' : 
                      isCompleted ? 'border-blue-300 bg-blue-300 text-white' : 
                      'border-white/30 bg-white/10'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <span className="text-xs md:text-sm font-medium text-shadow-sm text-center leading-tight px-1 w-full">{section.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
  
        {/* Form Content */}
        <Card className="max-w-4xl mx-auto shadow-2xl bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {sections[currentSection].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="onboarding-form onboarding-section">
            {renderSection()}
          </CardContent>
        </Card>
  
        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
  
          {currentSection < sections.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isValidSection()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white shadow-lg"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isValidSection() || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500/80 to-teal-600/80 hover:from-green-600/90 hover:to-teal-700/90 text-white shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;