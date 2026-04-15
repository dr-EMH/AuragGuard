import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, Phone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EmergencyContact } from '@/types';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void;
  onRemove: (id: string) => void;
}

export function EmergencyContacts({ contacts, onAdd, onRemove }: EmergencyContactsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });

  const handleAdd = () => {
    onAdd(newContact);
    setNewContact({ name: '', phone: '', email: '' });
    setIsAdding(false);
  };

  return (
    <Card className="glass-card border-none rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-brand-primary/5 border-b border-brand-border">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-brand-primary">Safety Network</CardTitle>
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full hover:bg-white/10 h-8 w-8"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className={cn("w-4 h-4 transition-transform", isAdding && "rotate-45")} />
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {isAdding && (
          <div className="p-4 rounded-2xl bg-white/5 border border-brand-border space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-brand-text-dim">Name</Label>
              <Input 
                value={newContact.name}
                onChange={e => setNewContact({...newContact, name: e.target.value})}
                className="bg-brand-bg border-brand-border h-10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-brand-text-dim">Phone</Label>
              <Input 
                value={newContact.phone}
                onChange={e => setNewContact({...newContact, phone: e.target.value})}
                className="bg-brand-bg border-brand-border h-10 rounded-xl"
              />
            </div>
            <Button className="w-full brand-gradient text-black font-bold rounded-xl h-10" onClick={handleAdd}>
              Save Contact
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-brand-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-[10px] text-brand-text-dim flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" />
                    {contact.phone}
                  </p>
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-brand-danger hover:bg-brand-danger/10 h-8 w-8"
                onClick={() => onRemove(contact.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {contacts.length === 0 && !isAdding && (
            <p className="text-center text-brand-text-dim py-8 italic text-xs">
              No emergency contacts added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';
