"use client";

import Lottie from "lottie-react";
import serverData from "../../../../public/Server.json";

export default function ServerAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Lottie
        animationData={serverData}
        loop={true}
        className="w-full h-full"
      />
    </div>
  );
}
