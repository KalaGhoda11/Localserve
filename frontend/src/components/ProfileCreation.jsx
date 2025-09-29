import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Briefcase, 
  Building, 
  Award, 
  Hash,
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  Globe,
  Camera,
  Plus,
  X,
  Loader2
} from 'lucide-react';

const ProfileCreation = ({ onProfileCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    job_title: '',
    company: '',
    industry: '',
    years_of_experience: '',
    skills: [],
    linkedin_url: '',
    twitter_url: '',
    github_url: '',
    website_url: '',
    profile_image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profile_image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null
      };

      const response = await fetch(`${BACKEND_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const newProfile = await response.json();
        toast.success('Profile created successfully!');
        onProfileCreated?.();
        navigate(`/profile/${newProfile.id}`);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Create New Profile</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a beautiful professional profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="profile-image w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                  data-testid="profile-image-input"
                />
                <Label
                  htmlFor="profile-image"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                data-testid="first-name-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                data-testid="last-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                data-testid="phone-input"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                data-testid="bio-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                name="job_title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.job_title}
                onChange={handleInputChange}
                data-testid="job-title-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                placeholder="e.g. Tech Corp Inc."
                value={formData.company}
                onChange={handleInputChange}
                data-testid="company-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                placeholder="e.g. Technology"
                value={formData.industry}
                onChange={handleInputChange}
                data-testid="industry-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                name="years_of_experience"
                type="number"
                placeholder="e.g. 5"
                value={formData.years_of_experience}
                onChange={handleInputChange}
                data-testid="experience-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g. React, Python, Design)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  data-testid="skill-input"
                />
                <Button 
                  type="button" 
                  onClick={addSkill}
                  data-testid="add-skill-btn"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                        data-testid={`remove-skill-${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                data-testid="linkedin-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="github_url"
                name="github_url"
                placeholder="https://github.com/username"
                value={formData.github_url}
                onChange={handleInputChange}
                data-testid="github-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </Label>
              <Input
                id="twitter_url"
                name="twitter_url"
                placeholder="https://twitter.com/username"
                value={formData.twitter_url}
                onChange={handleInputChange}
                data-testid="twitter-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website_url"
                name="website_url"
                placeholder="https://your-website.com"
                value={formData.website_url}
                onChange={handleInputChange}
                data-testid="website-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            data-testid="cancel-btn"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="btn-animated"
            data-testid="create-profile-btn"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Create Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCreation;