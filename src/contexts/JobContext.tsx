import { createContext, useContext, useState, useEffect } from 'react';
import { JobType, CommentType, ReplyType, UserType } from '@/types';
import { jobService } from '@/lib/jobService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface JobContextType {
  jobs: JobType[];
  userJobs: JobType[];
  filteredJobs: JobType[];
  setFilteredJobs: (jobs: JobType[]) => void;
  popularJobs: JobType[];
  getJobById: (id: string) => JobType | undefined;
  loading: boolean;
  addComment: (jobId: string, text: string) => Promise<CommentType | undefined>;
  addReply: (commentId: string, jobId: string, text: string) => Promise<ReplyType | undefined>;
  addReplyToComment: (jobId: string, commentId: string, text: string, user: UserType) => Promise<void>;
  refreshJobs: () => Promise<void>;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  savedJobs: JobType[];
  deleteComment: (commentId: string) => void;
  createJob: (jobData: Partial<JobType>) => Promise<JobType | null>;
  updateJob: (jobId: string, jobData: Partial<JobType>) => Promise<JobType | null>;
  deleteJob: (jobId: string) => Promise<boolean>;
}

const JobContext = createContext<JobContextType | null>(null);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }: { children: React.ReactNode }) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [userJobs, setUserJobs] = useState<JobType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [popularJobs, setPopularJobs] = useState<JobType[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth(); // Información del usuario actual
  const { toast } = useToast();

  useEffect(() => {
    refreshJobs();
  }, [currentUser]);

  const refreshJobs = async () => {
    setLoading(true);
    try {
      console.log("Refrescando trabajos...");
      const allJobs = await jobService.getAllJobs();
      console.log("Trabajos obtenidos:", allJobs.length);
      setJobs(allJobs);
      setFilteredJobs(allJobs);

      if (currentUser) {
        const userJobsData = await jobService.getJobsByUser(currentUser.id);
        setUserJobs(userJobsData);

        // In a real implementation, we would fetch saved jobs from the backend
        // This is a placeholder until that endpoint is implemented
        setSavedJobs([]);
      }

      // For popular jobs, we're showing the first 3 most recent jobs
      const popularJobsTemp = allJobs.slice(0, 3);
      setPopularJobs(popularJobsTemp);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los trabajos."
      });
      
      // Si hay un error, establecer trabajos vacíos para evitar errores subsecuentes
      setJobs([]);
      setFilteredJobs([]);
      setPopularJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const createJob = async (jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      const createdJob = await jobService.createJob(jobData);
      
      // Refresh jobs after creating a new one
      await refreshJobs();
      
      toast({
        title: "Propuesta creada",
        description: "La propuesta se ha creado correctamente."
      });
      
      return createdJob;
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear la propuesta."
      });
      return null;
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      const updatedJob = await jobService.updateJob(jobId, jobData);
      
      if (updatedJob) {
        // Update the jobs state
        setJobs(prevJobs => 
          prevJobs.map(job => job.id === jobId ? updatedJob : job)
        );
        
        // Update userJobs if necessary
        setUserJobs(prevJobs => 
          prevJobs.map(job => job.id === jobId ? updatedJob : job)
        );

        // Update filtered jobs if necessary
        setFilteredJobs(prevJobs => 
          prevJobs.map(job => job.id === jobId ? updatedJob : job)
        );
        
        toast({
          title: "Propuesta actualizada",
          description: "La propuesta se ha actualizado correctamente."
        });
      }
      
      return updatedJob;
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar la propuesta."
      });
      return null;
    }
  };

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      const success = await jobService.deleteJob(jobId);
      
      if (success) {
        // Remove the job from all job lists
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        setUserJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        setFilteredJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        
        toast({
          title: "Propuesta eliminada",
          description: "La propuesta ha sido eliminada correctamente."
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar la propuesta."
      });
      return false;
    }
  };

  const addComment = async (jobId: string, text: string): Promise<CommentType | undefined> => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para comentar."
      });
      return;
    }

    try {
      console.log("Añadiendo comentario al trabajo", jobId);
      
      // Crear un comentario temporal para mostrar inmediatamente en la UI
      const tempComment: CommentType = {
        id: `temp-${Date.now()}`,
        userId: currentUser.id,
        jobId,
        text,
        timestamp: Date.now(),
        userName: currentUser.name,
        userPhoto: currentUser.photoURL || '',
        replies: []
      };
      
      // Actualizar la UI inmediatamente con el comentario temporal
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === jobId) {
            const updatedComments = [...(job.comments || []), tempComment];
            return { ...job, comments: updatedComments };
          }
          return job;
        });
      });
      
      // Ahora intentar guardar en el backend
      const comment = await jobService.addComment(jobId, text);
      console.log("Comentario creado:", comment);
      
      // Si la llamada al backend es exitosa, reemplazar el comentario temporal con el real
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === jobId) {
            // Filtrar el comentario temporal y añadir el real
            const filteredComments = job.comments?.filter(c => c.id !== tempComment.id) || [];
            const updatedComments = [...filteredComments, comment];
            return { ...job, comments: updatedComments };
          }
          return job;
        });
      });
      
      toast({
        title: "Comentario publicado",
        description: "Tu comentario ha sido publicado correctamente."
      });
      
      return comment;
    } catch (error) {
      console.error("Error adding comment:", error);
      
      // Si hay un error, mantener el comentario temporal para la UX
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al publicar el comentario en el servidor, pero se muestra localmente."
      });
      
      // Devolver el comentario temporal como fallback
      return jobs.find(job => job.id === jobId)?.comments?.find(c => c.id.startsWith('temp-'));
    }
  };

  const addReply = async (commentId: string, jobId: string, text: string): Promise<ReplyType | undefined> => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para responder."
      });
      return;
    }

    try {
      // Crear una respuesta temporal para mostrar inmediatamente
      const tempReply: ReplyType = {
        id: `temp-reply-${Date.now()}`,
        userId: currentUser.id,
        commentId,
        text,
        content: text,
        timestamp: Date.now(),
        userName: currentUser.name,
        userPhoto: currentUser.photoURL || '',
      };
      
      // Actualizar la UI inmediatamente
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === jobId) {
            const updatedComments = job.comments?.map(comment => {
              if (comment.id === commentId) {
                const updatedReplies = [...(comment.replies || []), tempReply];
                return { ...comment, replies: updatedReplies };
              }
              return comment;
            });
            return { ...job, comments: updatedComments };
          }
          return job;
        });
      });
      
      // Ahora intentar guardar en el backend
      const reply = await jobService.addReply(commentId, text);
      
      // Actualizar con la respuesta real del backend
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === jobId) {
            const updatedComments = job.comments?.map(comment => {
              if (comment.id === commentId) {
                const filteredReplies = comment.replies?.filter(r => r.id !== tempReply.id) || [];
                const updatedReplies = [...filteredReplies, reply];
                return { ...comment, replies: updatedReplies };
              }
              return comment;
            });
            return { ...job, comments: updatedComments };
          }
          return job;
        });
      });
      
      toast({
        title: "Respuesta publicada",
        description: "Tu respuesta ha sido publicada correctamente."
      });
      
      return reply;
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al publicar la respuesta en el servidor, pero se muestra localmente."
      });
      
      // Mantener la respuesta temporal como fallback
      return tempReply;
    }
  };

  // Function for the CommentItem component to use
  const addReplyToComment = async (jobId: string, commentId: string, text: string, user: UserType) => {
    await addReply(commentId, jobId, text);
  };

  const deleteComment = async (commentId: string) => {
    try {
      await jobService.deleteComment(commentId);
      
      // Update the jobs state by removing the deleted comment
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          const updatedComments = job.comments?.filter(comment => comment.id !== commentId);
          return { ...job, comments: updatedComments };
        });
      });
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente."
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el comentario."
      });
    }
  };

  const saveJob = async (jobId: string) => {
    // This will be implemented when job saving functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de guardar trabajos será implementada próximamente."
    });
  };

  const unsaveJob = async (jobId: string) => {
    // This will be implemented when job saving functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de quitar trabajos guardados será implementada próximamente."
    });
  };

  const value: JobContextType = {
    jobs,
    userJobs,
    filteredJobs,
    setFilteredJobs,
    popularJobs,
    getJobById,
    loading,
    addComment,
    addReply,
    refreshJobs,
    saveJob,
    unsaveJob,
    savedJobs,
    deleteComment,
    createJob,
    updateJob,
    deleteJob,
    addReplyToComment
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
