import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletIllustration, StudentIllustration } from '../components/Illustrations';
// @ts-ignore
import NewWalletImg from '../assets/images/regenerated_image_1782123514233.png';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically transition to login screen after 3 seconds
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-4">
      {/* Mobile viewport simulator frame (aligned height with rest of app) */}
      <div 
        className="w-full max-w-md min-h-screen md:min-h-[812px] md:max-h-[812px] bg-[#9bb8cb] overflow-hidden flex flex-col relative md:rounded-[40px] md:shadow-2xl border border-gray-100"
      >
        
        {/* Upper Soft Steel-Blue Section */}
        <div id="welcome-upper" className="w-full pt-[16vh] md:pt-[130px] px-8 flex flex-col relative z-10">
          <div className="flex-1">
            <h1 className="text-[26px] font-sans font-normal text-black tracking-normal leading-snug">
              Student Expense and
            </h1>
            <h2 className="text-[28px] font-medium text-[#4b4be2] border-[#3131b6] tracking-normal leading-tight mt-0.5">
              Budget Tracker
            </h2>
          </div>
          
          <div className="mt-8 relative w-full flex justify-between items-start">
            <p className="text-[17px] font-normal text-black leading-snug tracking-wide pt-2">
              Track plan save<br/>Achieve your goals!
            </p>
            {/* Wallet illustration container placed near the bottom right */}
            <div 
              className="flex-shrink-0 origin-right transition-transform -mr-2 shadow-xl shadow-[#4b4be2]/20 rounded-[24px]"
            >
              <WalletIllustration 
                src={NewWalletImg}
                className="w-[173px] h-[116px] rounded-[24px]" 
              />
            </div>
          </div>
        </div>

        {/* Lower Section (White back) */}
        <div id="welcome-lower" className="flex-1 w-full bg-white flex flex-col justify-end items-center relative z-0 mt-8 md:mt-12 pb-4">
          
          {/* Main Student Illustration placed at the bottom */}
          <div className="w-full flex justify-center items-end mb-4">
            <StudentIllustration className="w-[456px] h-[406px]" />
          </div>
          
          {/* Invisible accessibility buttons */}
          <div className="sr-only">
            <button onClick={() => navigate('/login')}>Login / Sign Up</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};
