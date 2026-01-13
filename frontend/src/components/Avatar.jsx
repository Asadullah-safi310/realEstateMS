import { User } from 'lucide-react';
import { getImageUrl } from '../utils/mediaUtils';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizeMap = {
    xs: { container: 'w-6 h-6', text: 'text-xs', icon: 14 },
    sm: { container: 'w-8 h-8', text: 'text-sm', icon: 18 },
    md: { container: 'w-10 h-10', text: 'text-base', icon: 20 },
    lg: { container: 'w-16 h-16', text: 'text-lg', icon: 32 },
    xl: { container: 'w-20 h-20', text: 'text-2xl', icon: 40 },
    '2xl': { container: 'w-32 h-32', text: 'text-4xl', icon: 64 },
  };

  const sizeClasses = sizeMap[size] || sizeMap.md;

  const profilePictureUrl = user?.profile_picture ? getImageUrl(user.profile_picture) : null;
  const initials = user?.full_name?.charAt(0)?.toUpperCase() || '';

  return (
    <div
      className={`${sizeClasses.container} rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden ${className}`}
    >
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={user.full_name}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className={sizeClasses.text}>{initials}</span>
      ) : (
        <User size={sizeClasses.icon} />
      )}
    </div>
  );
};

export default Avatar;
