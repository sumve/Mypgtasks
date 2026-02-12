import { X, Mail, User as UserIcon, Briefcase, Calendar, Phone, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import type { User } from '@/app/data/mock-data';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  if (!isOpen) return null;

  // Mock additional profile details for demonstration
  const profileDetails = {
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    joinDate: 'January 15, 2024',
    department: 'Operations',
    employeeId: user.id.padStart(4, '0'),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 className="text-xl font-semibold">Profile Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
              <Avatar className="size-24 mb-4">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold mb-1">{user.name}</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Briefcase className="size-4" />
                {user.role}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Personal Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="size-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email Address</div>
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="size-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                    <div className="text-sm font-medium">{profileDetails.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="size-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Location</div>
                    <div className="text-sm font-medium">{profileDetails.location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4 mt-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Employment Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="size-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Employee ID</div>
                    <div className="text-sm font-medium">EMP-{profileDetails.employeeId}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="size-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Department</div>
                    <div className="text-sm font-medium">{profileDetails.department}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="size-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Join Date</div>
                    <div className="text-sm font-medium">{profileDetails.joinDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
