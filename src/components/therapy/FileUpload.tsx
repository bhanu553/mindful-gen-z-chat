
import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadSuccess?: (fileUrl: string) => void;
  className?: string;
}

const FileUpload = ({ onUploadSuccess, className }: FileUploadProps) => {
  const { user, isPremium } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const checkDailyUploadCount = async () => {
    if (isPremium) return true; // No limit for premium users
    
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const { data: files, error } = await supabase.storage
      .from('uploads')
      .list(`${user?.id}`, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error('Storage list error:', error);
      return false;
    }

    const todayCount = (files || []).filter((f) => {
      const created = f.created_at ? new Date(f.created_at) : null;
      return created !== null && created >= start && created <= end;
    }).length;

    return todayCount < 5;

    
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or JPEG image.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    // Check upload limit for free users
    const canUpload = await checkDailyUploadCount();
    if (!canUpload) {
      alert('You have reached your daily upload limit (5 files). Upgrade to Premium for unlimited uploads.');
      return;
    }

    setUploading(true);
    
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Metadata persistence to database removed: using Storage only to avoid type errors with missing 'uploads' table.

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      onUploadSuccess?.(publicData.publicUrl);
      setUploadCount(prev => prev + 1);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      <button 
        className={cn(
          "p-2 rounded-full transition-colors flex items-center justify-center",
          uploading 
            ? "bg-secondary/50 cursor-not-allowed animate-pulse" 
            : "bg-secondary hover:bg-secondary/80 hover:shadow-md"
        )}
        disabled={uploading}
        title={isPremium ? "Upload image" : `Upload image (${5 - uploadCount} remaining today)`}
      >
        {uploading ? (
          <Upload className="w-5 h-5 text-muted-foreground animate-bounce" />
        ) : (
          <Plus className="w-5 h-5 text-foreground" />
        )}
      </button>
    </div>
  );
};

export default FileUpload;
