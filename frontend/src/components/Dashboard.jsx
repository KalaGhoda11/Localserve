import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = ({ profiles = [], loading = false }) => {
  const totalProfiles = profiles.length;
  const recentProfiles = profiles
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  const topSkills = profiles
    .flatMap(profile => profile.skills || [])
    .reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  const topSkillsArray = Object.entries(topSkills)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Profiles',
      value: totalProfiles,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'This Month',
      value: profiles.filter(p => {
        const profileDate = new Date(p.created_at);
        const now = new Date();
        return profileDate.getMonth() === now.getMonth() && 
               profileDate.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Unique Skills',
      value: Object.keys(topSkills).length,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8" />
          Profile Plus Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage and showcase professional profiles with beautiful, modern interface.
          Create, edit, and explore profiles with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="btn-animated" data-testid="create-profile-cta">
          <Link to="/create-profile">
            <UserPlus className="mr-2 h-5 w-5" />
            Create New Profile
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" data-testid="view-all-profiles-cta">
          <Link to="/profiles">
            <Users className="mr-2 h-5 w-5" />
            View All Profiles
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Profiles & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Profiles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Profiles</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/profiles" data-testid="view-recent-profiles">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No profiles created yet</p>
                <Button asChild className="mt-4" size="sm">
                  <Link to="/create-profile">Create Your First Profile</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {profile.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={`${profile.first_name} ${profile.last_name}`}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile.job_title || 'No title specified'}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/profile/${profile.id}`} data-testid={`view-profile-${profile.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {topSkillsArray.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No skills data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSkillsArray.map(([skill, count], index) => (
                  <div key={skill} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{skill}</span>
                    </div>
                    <Badge variant="outline" data-testid={`skill-count-${skill}`}>
                      {count} {count === 1 ? 'profile' : 'profiles'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      {totalProfiles === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <div className="max-w-md mx-auto">
            <UserPlus className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Get Started!</h3>
            <p className="text-muted-foreground mb-6">
              Create your first profile to begin showcasing professional information.
            </p>
            <Button asChild size="lg" data-testid="get-started-btn">
              <Link to="/create-profile">
                Create Your First Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;