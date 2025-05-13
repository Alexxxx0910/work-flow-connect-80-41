
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobType } from "@/types";

interface EditJobFormProps {
  job: JobType;
  onSubmit: (data: Partial<JobType>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditJobForm = ({ job, onSubmit, onCancel, isSubmitting }: EditJobFormProps) => {
  const [formData, setFormData] = useState({
    title: job.title || '',
    description: job.description || '',
    budget: job.budget || 0,
    category: job.category || '',
    status: job.status || 'open',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      budget: Number(formData.budget),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Presupuesto</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            min={0}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Desarrollo Web</SelectItem>
              <SelectItem value="mobile">Desarrollo Móvil</SelectItem>
              <SelectItem value="design">Diseño</SelectItem>
              <SelectItem value="writing">Redacción</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value as "open" | "in progress" | "completed")}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in progress">En progreso</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-wfc-purple hover:bg-wfc-purple-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
};

export default EditJobForm;
