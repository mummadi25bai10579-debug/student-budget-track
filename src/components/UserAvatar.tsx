import React from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  email?: string;
  className?: string;
  onClick?: () => void;
}

export const getInitials = (userName?: string, userEmail?: string): string => {
  const identifier = userName || userEmail || '';
  if (!identifier) return "?";
  
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    const localPart = trimmed.split('@')[0];
    return localPart.substring(0, 1).toUpperCase();
  }
  
  const parts = trimmed.split(/\s+/);
  return parts[0].substring(0, 1).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  email,
  className = "w-11 h-11 text-sm font-bold",
  onClick,
}) => {
  const initials = getInitials(name, email);
  
  // Use avatarUrl if provided
  if (avatarUrl && avatarUrl.trim() !== '') {
    return (
      <button
        onClick={onClick}
        disabled={!onClick}
        className={`${className} rounded-full overflow-hidden border-2 border-white bg-blue-100 shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 ${
          onClick ? "cursor-pointer hover:shadow-lg" : "cursor-default"
        }`}
        type="button"
      >
        <img
          src={avatarUrl}
          referrerPolicy="no-referrer"
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  // Render dynamic avatar using initials
  const gradients = [
    "from-blue-600 to-blue-400 text-white",      // Blue
    "from-teal-600 to-teal-450 text-white",      // Teal
    "from-purple-600 to-purple-400 text-white",  // Purple
    "from-pink-600 to-pink-400 text-white",      // Pink
    "from-amber-600 to-amber-400 text-white",    // Amber/Yellow
    "from-orange-600 to-orange-400 text-white",  // Orange
    "from-indigo-600 to-indigo-400 text-white",  // Indigo
  ];
  
  // Choose gradient deterministically based on initials code
  const charCodeSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradientClass = gradients[charCodeSum % gradients.length];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`${className} rounded-full bg-gradient-to-br ${gradientClass} border-2 border-white shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 ${
        onClick ? "cursor-pointer hover:shadow-lg" : "cursor-default"
      }`}
      type="button"
    >
      <span className="font-bold tracking-wider font-mono text-center leading-none">{initials}</span>
    </button>
  );
};
