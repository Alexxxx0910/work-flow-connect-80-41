
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MessageType } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface ChatMobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  messages: MessageType[];
  isGroup?: boolean;
  children?: React.ReactNode;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatMobileSheet = ({
  isOpen,
  onClose,
  title,
  messages,
  isGroup = false,
  children,
  onEditMessage,
  onDeleteMessage
}: ChatMobileSheetProps) => {
  const { currentUser } = useAuth();
  const { getUserById } = useData();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Verificar que currentUser tenga un ID válido
  console.log("Current User ID:", currentUser?.id);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="sm:max-w-md w-full p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <SheetTitle>{title}</SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isCurrentUser = currentUser && message.senderId === currentUser.id;
                // Debug information
                console.log(`Message ${index}: senderId=${message.senderId}, currentUserId=${currentUser?.id}, isCurrentUser=${isCurrentUser}`);
                
                const isSystemMessage = message.senderId === "system";
                const sender = isSystemMessage ? null : getUserById(message.senderId);
                const isDeleted = message.deleted;
                
                const showDateSeparator = index === 0 || 
                  new Date(message.timestamp).toDateString() !== 
                  new Date(messages[index - 1].timestamp).toDateString();
                
                return (
                  <React.Fragment key={message.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    )}
                    
                    {isSystemMessage ? (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 flex items-center">
                          <Info className="h-3 w-3 mr-1" />
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group mb-2`}>
                        {/* Avatar para mensajes recibidos solamente */}
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 self-end flex-shrink-0">
                            <AvatarImage src={sender?.photoURL} />
                            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                              {sender?.name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="max-w-[70%]">
                          {/* Nombre del remitente para chats grupales */}
                          {!isCurrentUser && isGroup && (
                            <div className="text-xs text-gray-500 ml-1 mb-1">
                              {sender?.name || 'Usuario'}
                            </div>
                          )}
                          
                          {/* Burbuja de mensaje con diferentes colores para enviados/recibidos */}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isDeleted
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 italic'
                              : isCurrentUser 
                                ? 'bg-[#9b87f5] text-white rounded-br-none' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          } relative group`}>
                            <p className="break-words">{message.content}</p>
                            
                            {/* Opciones de mensaje (editar/eliminar) para mensajes propios no eliminados */}
                            {isCurrentUser && !isDeleted && onEditMessage && onDeleteMessage && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 p-0 absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="h-4 w-4 text-white" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="flex flex-col space-y-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="flex justify-start px-2"
                                      onClick={() => onEditMessage(message.id, message.content)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="flex justify-start text-red-500 hover:text-red-600 px-2"
                                      onClick={() => onDeleteMessage(message.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          
                          {/* Marca de tiempo del mensaje */}
                          <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        
                        {/* Avatar para mensajes enviados solamente */}
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8 ml-2 self-end flex-shrink-0">
                            <AvatarImage src={currentUser.photoURL} />
                            <AvatarFallback className="bg-[#9b87f5] text-white text-xs">
                              {currentUser.name?.charAt(0).toUpperCase() || 'Y'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500">No hay mensajes aún</p>
                <p className="text-sm text-gray-400 mt-2">Envía un mensaje para iniciar la conversación</p>
              </div>
            )}
          </div>
          {children && (
            <div className="p-4 border-t">
              {children}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMobileSheet;
