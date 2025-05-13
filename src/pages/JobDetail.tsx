
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Calendar, DollarSign, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { JobType } from '@/types';
import { formatDate } from '@/lib/utils';
import { CommentsList } from '@/components/Comments/CommentsList';
import { Skeleton } from '@/components/ui/skeleton';

const JobDetail = () => {
  // Hooks de React Router para obtener el ID de la propuesta y navegación
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  // Hooks de contexto para acceder a datos y funcionalidades
  const { getJobById, addComment, jobs, refreshJobs } = useJobs(); 
  const { currentUser } = useAuth(); // Información del usuario actual
  const { createPrivateChat } = useChat(); // Funcionalidades de chat
  const { getUserById } = useData(); // Para obtener datos de usuarios
  
  // Estados locales para el formulario de comentarios
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState<JobType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  console.log("JobDetail: jobId =", jobId);
  console.log("JobDetail: jobs disponibles =", jobs?.length || 0);
  
  // Cargar trabajo cuando se monta el componente
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) {
        setError("ID de trabajo no proporcionado");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Intentar obtener el trabajo del caché local primero
        const jobData = getJobById(jobId);
        
        if (jobData) {
          console.log("Trabajo encontrado localmente:", jobData);
          console.log("Fecha de creación:", jobData.createdAt);
          setJob(jobData);
        } else {
          console.error("Trabajo no encontrado");
          setError("No se pudo encontrar la propuesta solicitada");
        }
      } catch (error) {
        console.error("Error al cargar trabajo:", error);
        setError("Error al cargar los detalles de la propuesta");
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información de la propuesta"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobDetails();
  }, [jobId, getJobById, jobs]);

  // Obtener información del propietario de la propuesta
  const jobOwner = job ? getUserById(job.userId) : undefined;
  
  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
              <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <div className="mt-6">
                      <Skeleton className="h-4 w-40" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-32 mt-4" />
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Si hay un error, mostrar el mensaje de error
  if (error) {
    return (
      <MainLayout>
        <div className="container-custom">
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-red-500 mb-4 rounded-full bg-red-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">{error}</h2>
                <p className="text-gray-600 mt-2">No se pudo cargar la información solicitada.</p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Button onClick={() => navigate('/jobs')}>
                    Ver todas las propuestas
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Intentar nuevamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // Si no se encuentra la propuesta, mostrar mensaje de error
  if (!job) {
    return (
      <MainLayout>
        <div className="container-custom">
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-amber-500 mb-4 rounded-full bg-amber-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Propuesta no encontrada</h2>
                <p className="text-gray-600 mt-2">La propuesta que estás buscando no existe o ha sido eliminada.</p>
                <Button className="mt-6" onClick={() => navigate('/jobs')}>
                  Ver todas las propuestas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  /**
   * Función para manejar el botón de contacto
   */
  const handleContactClick = async () => {
    if (!currentUser || !job) return;
    
    try {
      await createPrivateChat(job.userId);
      navigate('/chats');
      toast({
        title: "Chat iniciado",
        description: `Has iniciado una conversación con ${jobOwner?.name || 'usuario'}`
      });
    } catch (error) {
      console.error("Error al iniciar chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el chat. Inténtalo de nuevo."
      });
    }
  };

  /**
   * Función para enviar un nuevo comentario a la propuesta
   */
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser || !job) return;
    
    setIsSubmittingComment(true);
    try {
      // Llamar a la función para añadir el comentario a la propuesta
      const newComment = await addComment(job.id, commentText);
      setCommentText(''); // Limpiar el campo de comentario
      
      // Actualizar el estado local del trabajo para incluir el nuevo comentario
      if (newComment && job) {
        const updatedComments = [...(job.comments || []), newComment];
        setJob({
          ...job,
          comments: updatedComments
        });
        
        // También actualizar la lista completa de trabajos para mantener la coherencia
        await refreshJobs();
      }
      
      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado correctamente"
      });
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el comentario"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Renderizado del componente
  return (
    <MainLayout>
      <div className="container-custom">
        <div className="space-y-6">
          {/* Cabecera con título y acciones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-gray-600 mt-1">
                Publicado por {jobOwner?.name || 'Usuario'} • {formatDate(job.createdAt)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Badge que muestra el estado de la propuesta */}
              <Badge className={`
                ${job.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                  job.status === 'in progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                  'bg-gray-100 text-gray-800 hover:bg-gray-200'}
              `}>
                {job.status === 'open' ? 'Abierto' : 
                 job.status === 'in progress' ? 'En progreso' : 
                 'Completado'}
              </Badge>
            </div>
          </div>
          
          {/* Layout principal con contenido y sidebar */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna principal (2/3 del ancho) */}
            <div className="md:col-span-2 space-y-6">
              {/* Tarjeta de descripción de la propuesta */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  
                  {/* Sección de habilidades requeridas */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Habilidades requeridas</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Tarjeta de comentarios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comentarios</CardTitle>
                  <CardDescription>
                    Deja un comentario sobre esta propuesta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Formulario para añadir un nuevo comentario */}
                  {currentUser && (
                    <div className="space-y-4 mb-8">
                      <Textarea
                        placeholder="Escribe tu comentario aquí..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button 
                        onClick={handleSubmitComment} 
                        disabled={isSubmittingComment || !commentText.trim()}
                        className="bg-wfc-purple hover:bg-wfc-purple-medium"
                      >
                        {isSubmittingComment ? 'Enviando...' : 'Enviar comentario'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Lista de comentarios existentes */}
                  <div className="mt-6">
                    <Separator className="mb-6" />
                    <CommentsList 
                      comments={job.comments} 
                      jobId={job.id}
                      loading={isLoadingComments}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar (1/3 del ancho) */}
            <div className="space-y-6">
              {/* Tarjeta con detalles de la propuesta */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles de la propuesta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Presupuesto */}
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <h4 className="text-sm text-gray-600">Presupuesto</h4>
                      <p className="font-medium">${job.budget}</p>
                    </div>
                  </div>
                  {/* Fecha de publicación */}
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <h4 className="text-sm text-gray-600">Fecha de publicación</h4>
                      <p className="font-medium">{formatDate(job.createdAt)}</p>
                    </div>
                  </div>
                  {/* Categoría */}
                  <div className="flex items-center">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 mr-2">
                      {job.category}
                    </Badge>
                    <span className="text-sm text-gray-600">Categoría</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tarjeta con información del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información básica del cliente */}
                  {jobOwner && (
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={jobOwner.photoURL || ''} alt={jobOwner.name} />
                        <AvatarFallback className="bg-wfc-purple-medium text-white">
                          {jobOwner.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{jobOwner.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Botón de contacto (solo para usuarios autenticados que no son el dueño) */}
                  {currentUser && jobOwner && currentUser.id !== job.userId && (
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-wfc-purple text-wfc-purple hover:bg-wfc-purple/10"
                      onClick={handleContactClick}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                  )}
                  
                  {/* Botón para ver perfil completo */}
                  {jobOwner && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/users/${job.userId}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Ver perfil
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
