import React from 'react';
// @ts-ignore
import StudentImg from '../assets/images/regenerated_image_1782112076483.png';
// @ts-ignore
import WalletImg from '../assets/images/regenerated_image_1782112078528.png';

export const WalletIllustration: React.FC<{ className?: string; imgClassName?: string; src?: string }> = ({ 
  className = 'w-[173px] h-[116px]',
  imgClassName = 'object-cover object-center',
  src
}) => {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <img 
        src={src || WalletImg} 
        alt="Wallet with coins and card" 
        className={`w-full h-full rounded-[24px] shadow-md ${imgClassName}`}
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/400x300/2d8eff/ffffff?font=montserrat&text=Please+upload+your%0Aimage+to+the+public%0Afolder+as+'wallet.jpg'";
        }}
      />
    </div>
  );
};

export const StudentIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-64' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src={StudentImg} 
        alt="Student with laptop" 
        className="w-full h-full object-contain scale-110 drop-shadow-xl mix-blend-multiply"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/600x600/f8f9fa/6d28d9?font=montserrat&text=Please+upload+your%0Aimage+to+the+public%0Afolder+as+'student.jpg'";
        }}
      />
    </div>
  );
};
