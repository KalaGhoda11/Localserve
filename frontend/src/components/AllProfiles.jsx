import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Users, 
  User, 
  Mail, 
  Briefcase, 
  MapPin,
  Eye,
  Edit,
  UserPlus,
  Filter
} from 'lucide-react';

const AllProfiles = ({ profiles = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // Get all unique skills for filter
  const allSkills = [...new Set(profiles.flatMap(profile => profile.skills || []))];

  // Filter profiles based on search term and skill filter
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkill = !skillFilter || 
      (profile.skills && profile.skills.includes(skillFilter));

    return matchesSearch && matchesSkill;
  });

  const ProfileCard = ({ profile }) => (
    <Card className="profile-card group" data-testid={`profile-card-${profile.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="profile-image w-16 h-16"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {profile.first_name} {profile.last_name}
              </h3>
              {profile.job_title && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.job_title}
                </p>
              )}
              {profile.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button asChild size="sm" variant="outline">
              <Link to={`/profile/${profile.id}`} data-testid={`view-profile-${profile.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/profile/${profile.id}/edit`} data-testid={`edit-profile-${profile.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {profile.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              {profile.email}
            </div>
          )}
          
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {profile.bio}
            </p>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <p className="text-xs text-muted-foreground">
              Created {new Date(profile.created_at).toLocaleDateString()}
            </p>
            <Button asChild size="sm" data-testid={`view-full-profile-${profile.id}`}>
              <Link to={`/profile/${profile.id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="profiles-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">All Profiles</h1>
        <p className="text-muted-foreground">
          Browse and manage all created profiles
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search profiles by name, email, job title, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-profiles"
          />
        </div>
        
        {allSkills.length > 0 && (
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="skill-filter"
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground" data-testid="results-count">
          {filteredProfiles.length === profiles.length 
            ? `${profiles.length} ${profiles.length === 1 ? 'profile' : 'profiles'} total`
            : `${filteredProfiles.length} of ${profiles.length} profiles`
          }
        </p>
        <Button asChild data-testid="create-new-profile-btn">
          <Link to="/create-profile">
            <UserPlus className="h-4 w-4 mr-2" />
            Create New Profile
          </Link>
        </Button>
      </div>

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          {profiles.length === 0 ? (
            <div className="max-w-md mx-auto">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Profiles Yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first profile.
              </p>
              <Button asChild size="lg">
                <Link to="/create-profile">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create First Profile
                </Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSkillFilter('');
                }}
                data-testid="clear-filters-btn"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="profiles-grid">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProfiles;