import React, { useEffect, useState } from 'react';
import MotorMateApp from './MotorMateApp';
import './App.css';
import MotorMateAppMobile from './MotorMateAppMobile';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

function App() {

  const isMobile = useIsMobile();

  if (isMobile) {
    return <MotorMateAppMobile />;
  }

  return <MotorMateApp />;
}

export default App;
