import React from 'react';
import Spline from 'https://esm.sh/@splinetool/react-spline?external=react,react-dom';

export default function Hero3D() {
  return (
    <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
      <Spline scene="https://prod.spline.design/UGnf9D1Hp3OG8vSG/scene.splinecode" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
