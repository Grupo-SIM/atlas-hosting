"use client";

import Lottie from "lottie-react";
import serverData from "../../../../public/Server.json";

export default function ServerAnimation() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Lottie
        animationData={serverData}
        className="h-full w-full"
        loop={true}
      />
    </div>
  );
}
