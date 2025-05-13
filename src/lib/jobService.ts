
import { JobType, CommentType, ReplyType } from '@/types';
import { UserType } from '@/types';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const jobService = {
  getAllJobs: async (): Promise<JobType[]> => {
    try {
      console.log(`Fetching jobs from: ${API_URL}/jobs`);
      const response = await axios.get(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Jobs response:", response.data);
      
      if (response.data.success) {
        // Asegurarnos de que todos los trabajos tienen un array de comentarios, aunque sea vacío
        const jobsWithComments = response.data.jobs.map((job: JobType) => {
          return {
            ...job,
            comments: job.comments || []
          };
        });
        return jobsWithComments;
      }
      return [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Mostrar un toast con el error
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al obtener las propuestas: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      
      // Como fallback, intentar usar datos locales si hay disponibles
      const cachedJobs = localStorage.getItem('cachedJobs');
      if (cachedJobs) {
        console.log("Usando trabajos en caché");
        return JSON.parse(cachedJobs);
      }
      
      throw error;
    }
  },
  
  getJobById: async (id: string): Promise<JobType | null> => {
    try {
      console.log(`Fetching job with ID: ${id}`);
      const response = await axios.get(`${API_URL}/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Job response:", response.data);
      
      if (response.data.success) {
        return response.data.job;
      }
      return null;
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al obtener la propuesta: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  getJobsByUser: async (userId: string): Promise<JobType[]> => {
    try {
      // For now, we'll filter all jobs by user ID
      const allJobs = await jobService.getAllJobs();
      return allJobs.filter(job => job.userId === userId);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al obtener las propuestas del usuario: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  createJob: async (jobData: Partial<JobType>): Promise<JobType> => {
    try {
      console.log("Creating job with data:", jobData);
      // Validar que los datos requeridos estén presentes
      if (!jobData.title || !jobData.description || !jobData.category || jobData.budget === undefined) {
        const errorMsg = "Datos incompletos para crear la propuesta";
        console.error(errorMsg, jobData);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      const response = await axios.post(`${API_URL}/jobs`, jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Create job response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Propuesta creada correctamente"
        });
        return response.data.job;
      }
      
      const errorMsg = response.data.message || "Error al crear la propuesta";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg
      });
      throw new Error(errorMsg);
    } catch (error) {
      console.error("Error creating job:", error);
      
      let errorMessage = "Error al crear la propuesta";
      if (axios.isAxiosError(error) && error.response?.data?.details) {
        errorMessage += `: ${error.response.data.message || error.response.data.details}`;
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (axios.isAxiosError(error)) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
      throw error;
    }
  },
  
  updateJob: async (id: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      console.log(`Updating job with ID: ${id}`, jobData);
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Update job response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Propuesta actualizada correctamente"
        });
        return response.data.job;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: response.data.message || "Error al actualizar la propuesta"
      });
      return null;
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al actualizar la propuesta: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  deleteJob: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting job with ID: ${id}`);
      const response = await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Delete job response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Propuesta eliminada correctamente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Error al eliminar la propuesta"
        });
      }
      
      return response.data.success;
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al eliminar la propuesta: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },

  addComment: async (jobId: string, text: string): Promise<CommentType> => {
    try {
      console.log(`Adding comment to job ${jobId}: ${text}`);
      
      // In a real implementation, this would be a backend call
      const response = await axios.post(`${API_URL}/jobs/${jobId}/comments`, {
        text
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        console.log("Comentario creado en el backend:", response.data.comment);
        return response.data.comment;
      }
      
      // Si el backend responde pero no con éxito, usamos el fallback
      console.warn("El backend respondió sin éxito, usando fallback local");
      
      // Temporary client-side fallback until backend is fully implemented
      const token = localStorage.getItem('token');
      const userInfo = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      const newComment: CommentType = {
        id: uuidv4(),
        userId: userInfo?.userId || userInfo?.id || 'unknown',
        jobId,
        text,
        content: text,
        timestamp: Date.now(),
        userName: userInfo?.name || 'Usuario',
        userPhoto: userInfo?.photoURL || '',
        replies: []
      };
      
      console.log("Comentario fallback creado:", newComment);
      
      // Guardar en localStorage como caché temporal
      try {
        const cachedJobs = localStorage.getItem('cachedJobs');
        if (cachedJobs) {
          const jobs = JSON.parse(cachedJobs);
          const updatedJobs = jobs.map((job: JobType) => {
            if (job.id === jobId) {
              const comments = [...(job.comments || []), newComment];
              return { ...job, comments };
            }
            return job;
          });
          localStorage.setItem('cachedJobs', JSON.stringify(updatedJobs));
        }
      } catch (e) {
        console.error("Error al guardar en caché el comentario:", e);
      }
      
      return newComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      
      // Fallback si hay un error con el backend
      const token = localStorage.getItem('token');
      const userInfo = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      const newComment: CommentType = {
        id: uuidv4(),
        userId: userInfo?.userId || userInfo?.id || 'unknown',
        jobId,
        text,
        content: text,
        timestamp: Date.now(),
        userName: userInfo?.name || 'Usuario',
        userPhoto: userInfo?.photoURL || '',
        replies: []
      };
      
      console.log("Comentario creado como fallback (error):", newComment);
      
      return newComment;
    }
  },

  addReply: async (commentId: string, text: string): Promise<ReplyType> => {
    try {
      console.log(`Adding reply to comment ${commentId}: ${text}`);
      
      // In a real implementation, this would be a backend call
      const response = await axios.post(`${API_URL}/comments/${commentId}/replies`, {
        text
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.reply;
      }
      
      // Temporary client-side fallback until backend is fully implemented
      // This should be removed once the backend is working
      const token = localStorage.getItem('token');
      const userInfo = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      const newReply: ReplyType = {
        id: uuidv4(),
        userId: userInfo?.userId || 'unknown',
        commentId,
        text,
        content: text,
        timestamp: Date.now(),
        userName: userInfo?.name || 'Usuario',
        userPhoto: userInfo?.photoURL || '',
      };
      
      return newReply;
    } catch (error) {
      console.error("Error adding reply:", error);
      
      // Temporary client-side fallback until backend is fully implemented
      const token = localStorage.getItem('token');
      const userInfo = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      const newReply: ReplyType = {
        id: uuidv4(),
        userId: userInfo?.userId || 'unknown',
        commentId,
        text,
        content: text,
        timestamp: Date.now(),
        userName: userInfo?.name || 'Usuario',
        userPhoto: userInfo?.photoURL || '',
      };
      
      return newReply;
    }
  },

  deleteComment: async (commentId: string): Promise<boolean> => {
    try {
      console.log(`Deleting comment ${commentId}`);
      
      // In a real implementation, this would be a backend call
      const response = await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data.success;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }
};

export const userService = {
  getUserById: async (id: string): Promise<UserType | null> => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }
};
