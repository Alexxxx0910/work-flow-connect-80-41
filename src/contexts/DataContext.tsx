
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType, UserType } from '@/types';
import { userService } from '@/services/api';
import { JOB_CATEGORIES, SKILLS_LIST } from '@/lib/mockData';
import { toast } from '@/components/ui/use-toast';

export type { UserType };

export interface DataContextType {
  users: UserType[];
  getUserById: (userId: string) => UserType | undefined;
  getAllUsers: () => UserType[];
  loading: boolean;
  jobs: JobType[];
  jobCategories: string[];
  skillsList: string[];
  loadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobCategories, setJobCategories] = useState<string[]>(JOB_CATEGORIES);
  const [skillsList, setSkillsList] = useState<string[]>(SKILLS_LIST);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users from backend
      const userData = await userService.getAllUsers();
      
      // Transform backend user data to match our frontend UserType
      const transformedUsers: UserType[] = userData.map((user: any) => ({
        id: user.id.toString(),
        name: user.username || user.name || `Usuario ${user.id.substring(0, 4)}`, // Fallback to ensure we always have a name
        email: user.email,
        role: user.role || "freelancer", // Default role, could be different based on your backend
        photoURL: user.avatar || user.photoURL,
        joinedAt: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? user.skills : []
      }));
      
      console.log("Loaded users:", transformedUsers);
      setUsers(transformedUsers);
      
      // For categories and skills, we still use predefined lists
      // In a more complete implementation, these could come from the backend too
      setJobCategories(JOB_CATEGORIES);
      setSkillsList(SKILLS_LIST);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const getUserById = (userId: string) => {
    if (!userId) return undefined;
    return users.find(user => user.id === userId);
  };
  
  const getAllUsers = () => {
    return users;
  };

  return (
    <DataContext.Provider
      value={{
        users,
        getUserById,
        getAllUsers,
        loading,
        jobCategories,
        skillsList,
        jobs,
        loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
