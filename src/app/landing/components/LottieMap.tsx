"use client";

import Lottie from "lottie-react";
import worldMapData from "../../../../public/Homepage -map dark blue 1.json";

export default function LottieMap() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Lottie
        animationData={worldMapData}
        loop={true}
        className="w-full h-full"
      />
    </div>
  );
}
