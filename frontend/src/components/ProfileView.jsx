import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Calendar,
  Award,
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
  Globe,
  MapPin,
  Clock
} from 'lucide-react';

const ProfileView = ({ onProfileUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/profiles/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        toast.error('Profile not found');
        navigate('/profiles');
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/profiles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Profile deleted successfully');
        onProfileUpdate?.();
        navigate('/profiles');
      } else {
        throw new Error('Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    } finally {
      setDeleting(false);
    }
  };

  const SocialLink = ({ url, icon: Icon, label }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        data-testid={`social-link-${label.toLowerCase()}`}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The profile you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/profiles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" data-testid="back-btn">
          <Link to="/profiles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </Link>
        </Button>
        
        <div className="flex gap-2">
          <Button asChild data-testid="edit-profile-btn">
            <Link to={`/profile/${profile.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
            data-testid="delete-profile-btn"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card>
            <CardContent className="pt-6 text-center">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="profile-image w-32 h-32 mx-auto mb-4"
                  data-testid="profile-image"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              <h1 className="text-2xl font-bold mb-2" data-testid="profile-name">
                {profile.first_name} {profile.last_name}
              </h1>
              
              {profile.job_title && (
                <p className="text-muted-foreground mb-2 flex items-center justify-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {profile.job_title}
                </p>
              )}
              
              {profile.company && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Building className="h-4 w-4" />
                  {profile.company}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${profile.email}`}
                  className="text-sm hover:text-primary transition-colors"
                  data-testid="contact-email"
                >
                  {profile.email}
                </a>
              </div>
              
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${profile.phone}`}
                    className="text-sm hover:text-primary transition-colors"
                    data-testid="contact-phone"
                  >
                    {profile.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          {(profile.linkedin_url || profile.twitter_url || profile.github_url || profile.website_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SocialLink url={profile.linkedin_url} icon={Linkedin} label="LinkedIn" />
                <SocialLink url={profile.github_url} icon={Github} label="GitHub" />
                <SocialLink url={profile.twitter_url} icon={Twitter} label="Twitter" />
                <SocialLink url={profile.website_url} icon={Globe} label="Website" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="profile-bio">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.job_title && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <p className="font-medium" data-testid="job-title">{profile.job_title}</p>
                  </div>
                )}
                
                {profile.company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="font-medium" data-testid="company">{profile.company}</p>
                  </div>
                )}
                
                {profile.industry && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Industry</label>
                    <p className="font-medium" data-testid="industry">{profile.industry}</p>
                  </div>
                )}
                
                {profile.years_of_experience && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experience</label>
                    <p className="font-medium" data-testid="experience">
                      {profile.years_of_experience} {profile.years_of_experience === 1 ? 'year' : 'years'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" data-testid="skills-list">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <label className="font-medium">Created</label>
                  <p data-testid="created-date">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Last Updated</label>
                  <p data-testid="updated-date">
                    {new Date(profile.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;