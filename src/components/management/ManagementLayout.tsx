
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ManagementLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export function ManagementLayout({ 
  title, 
  description, 
  children, 
  onAddNew, 
  addNewLabel = "Add New" 
}: ManagementLayoutProps) {
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          {onAddNew && (
            <Button onClick={onAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {addNewLabel}
            </Button>
          )}
        </div>
        
        {children}
      </div>
    </Layout>
  );
}
