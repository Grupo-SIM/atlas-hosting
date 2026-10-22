"use client";

import Lottie from "lottie-react";
import worldMapData from "../../../../public/Homepage -map dark blue 1.json";

export default function LottieMap() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Lottie
        animationData={worldMapData}
        className="h-full w-full"
        loop={true}
      />
    </div>
  );
}
