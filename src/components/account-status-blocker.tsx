import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AccountStatusBlockerProps {
  status: 'deactivated' | 'deleted';
  onContactSupport?: () => void;
}

export function AccountStatusBlocker({ status, onContactSupport }: AccountStatusBlockerProps) {
  const isDeactivated = status === 'deactivated';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
          isDeactivated ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          {isDeactivated ? (
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isDeactivated ? 'Account Temporarily Deactivated' : 'Account Deleted'}
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {isDeactivated ? (
            <>
              Your account has been temporarily deactivated by the administrator. 
              You cannot perform any actions at this time.
              <br /><br />
              Please contact support to reactivate your account.
            </>
          ) : (
            <>
              Your account has been permanently deleted by the administrator.
              <br /><br />
              If you believe this is a mistake, please contact support for assistance.
            </>
          )}
        </p>

        <div className="space-y-3">
          <Button
            onClick={onContactSupport}
            className="w-full bg-[#6a40ec] hover:bg-[#5a2fd9] text-white"
          >
            Contact Administrator
          </Button>
          
          <p className="text-sm text-gray-500">
            You will be logged out automatically
          </p>
        </div>
      </div>
    </div>
  );
}
