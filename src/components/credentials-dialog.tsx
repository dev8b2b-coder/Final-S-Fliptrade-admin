import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, Check, Mail, Lock, UserCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CredentialsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
  name: string;
}

export function CredentialsDialog({ isOpen, onClose, email, password, name }: CredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  const copyToClipboard = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field === 'email' ? 'Email' : 'Password'} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Staff Member Created Successfully!</DialogTitle>
              <DialogDescription>Share these login credentials with {name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>{name}</strong> has been added to the system. Please share the credentials below securely.
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              Email Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={email}
                readOnly
                className="bg-gray-50"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(email, 'email')}
                className="shrink-0"
              >
                {copiedField === 'email' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              Temporary Password
            </Label>
            <div className="flex gap-2">
              <Input
                id="password"
                value={password}
                readOnly
                className="bg-gray-50 font-mono"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(password, 'password')}
                className="shrink-0"
              >
                {copiedField === 'password' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>Important:</strong> The staff member should change their password after the first login for security purposes.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
