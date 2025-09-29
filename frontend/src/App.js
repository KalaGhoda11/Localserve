import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import ProfileCreation from "@/components/ProfileCreation";
import ProfileView from "@/components/ProfileView";
import ProfileEdit from "@/components/ProfileEdit";
import AllProfiles from "@/components/AllProfiles";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./App.css";

function App() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/profiles`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleProfileUpdate = () => {
    fetchProfiles(); // Refresh profiles list
  };

  return (
    <ThemeProvider>
      <div className="App min-h-screen bg-background text-foreground">
        <BrowserRouter>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard profiles={profiles} loading={loading} />} 
              />
              <Route 
                path="/create-profile" 
                element={<ProfileCreation onProfileCreated={handleProfileUpdate} />} 
              />
              <Route 
                path="/profiles" 
                element={<AllProfiles profiles={profiles} loading={loading} />} 
              />
              <Route 
                path="/profile/:id" 
                element={<ProfileView onProfileUpdate={handleProfileUpdate} />} 
              />
              <Route 
                path="/profile/:id/edit" 
                element={<ProfileEdit onProfileUpdate={handleProfileUpdate} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Toaster />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;