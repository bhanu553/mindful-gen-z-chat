import React, { useState, useEffect } from 'react';
import { Brain, ChevronRight, ArrowLeft, Heart, Info, CheckCircle } from 'lucide-react';
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
  
  // Mental Health Status
  previous_therapy: boolean | null;
  therapy_types: string[];
  current_medication: boolean | null;
  mental_health_rating: string;
  current_struggles: string[];
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
  const [optimisticOnboarding, setOptimisticOnboarding] = useState(false); // NEW

  // Redirect if onboarding is already complete or optimistically set
  useEffect(() => {
    if (isOnboardingComplete === true || optimisticOnboarding) {
      console.log('Onboarding already complete, redirecting to therapy');
      navigate('/therapy');
    }
  }, [isOnboardingComplete, optimisticOnboarding, navigate]);

  const [formData, setFormData] = useState<OnboardingFormData>({
    full_name: '',
    email: user?.email || '',
    phone_number: '',
    age: '',
    gender: '',
    country: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    previous_therapy: null,
    therapy_types: [],
    current_medication: null,
    mental_health_rating: '',
    current_struggles: [],
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

    setIsSubmitting(true);

    try {
      console.log('Saving onboarding data for user:', user.id);
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number || null,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          country: formData.country || null,
          timezone: formData.timezone || null,
          previous_therapy: formData.previous_therapy,
          therapy_types: formData.therapy_types,
          current_medication: formData.current_medication,
          mental_health_rating: formData.mental_health_rating ? parseInt(formData.mental_health_rating) : null,
          current_struggles: formData.current_struggles,
          other_struggles: formData.other_struggles || null,
          self_harm_thoughts: formData.self_harm_thoughts,
          last_self_harm_occurrence: formData.last_self_harm_occurrence || null,
          current_crisis: formData.current_crisis,
          ai_substitute_consent: formData.ai_substitute_consent,
          data_processing_consent: formData.data_processing_consent,
          emergency_responsibility_consent: formData.emergency_responsibility_consent,
          calendar_reminders_consent: formData.calendar_reminders_consent,
          completed: true
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Onboarding data saved successfully');
      
      // Optimistically set onboarding as complete and redirect
      setOptimisticOnboarding(true);
      // Refresh the onboarding status to reflect the changes
      console.log('🔄 Refreshing onboarding status...');
      await refreshOnboardingStatus();
      
      toast({
        title: "Welcome to EchoMind!",
        description: "Your onboarding is complete. Let's begin your healing journey.",
      });

      // Instantly redirect to therapy after onboarding completion
      console.log('🚀 Redirecting to therapy after onboarding completion');
      navigate('/therapy');

    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
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

  const toggleArrayField = (field: 'therapy_types' | 'current_struggles', value: string) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => updateFormData('full_name', e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          placeholder="your.email@example.com"
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">Auto-filled from your account</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number (Optional)</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => updateFormData('phone_number', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData('age', e.target.value)}
            placeholder="25"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-Binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => updateFormData('country', e.target.value)}
            placeholder="United States"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => updateFormData('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      {formData.previous_therapy && (
        <div className="space-y-2">
          <Label>What type of therapy have you received? (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['CBT (Cognitive Behavioral)', 'DBT (Dialectical Behavioral)', 'Psychoanalytic', 'Humanistic', 'Family Therapy', 'Group Therapy', 'EMDR', 'Other'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`therapy-${type}`}
                  checked={formData.therapy_types.includes(type)}
                  onCheckedChange={() => toggleArrayField('therapy_types', type)}
                />
                <Label htmlFor={`therapy-${type}`} className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <Label>Select what you're currently struggling with:</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {['Anxiety', 'Depression', 'Relationship issues', 'Loneliness', 'Trauma', 'Identity confusion', 'Burnout', 'Self-esteem', 'Grief/loss', 'Financial stress'].map((struggle) => (
            <div key={struggle} className="flex items-center space-x-2">
              <Checkbox
                id={`struggle-${struggle}`}
                checked={formData.current_struggles.includes(struggle)}
                onCheckedChange={() => toggleArrayField('current_struggles', struggle)}
              />
              <Label htmlFor={`struggle-${struggle}`} className="text-sm">{struggle}</Label>
            </div>
          ))}
        </div>
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
        <RadioGroup value={formData.self_harm_thoughts?.toString()} onValueChange={(value) => updateFormData('self_harm_thoughts', value === 'true')}>
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
        return formData.full_name.trim() !== '';
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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EchoMind</h1>
          <p className="text-xl text-white italic">AI Therapy. Real Healing.</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === currentSection;
              const isCompleted = index < currentSection;

              return (
                <div key={index} className="flex items-center">
                  <div className={`flex flex-col items-center ${isActive || isCompleted ? 'text-blue-400' : 'text-white/60'}`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                      isActive ? 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/25' : 
                      isCompleted ? 'border-blue-400 bg-blue-400 text-white' : 
                      'border-white/30'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs text-center font-medium text-white">{section.title}</span>
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-blue-400' : 'bg-white/30'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-4xl mx-auto shadow-lg bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {sections[currentSection].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="onboarding-form">
            {renderSection()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentSection < sections.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isValidSection()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isValidSection() || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-pulse"
            >
              {isSubmitting ? 'Starting...' : 'Begin Your Healing'}
              <Heart className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;