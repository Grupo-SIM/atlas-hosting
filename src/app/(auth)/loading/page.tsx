import "./loading.css";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center text-shadow-amber-950/50">
      {/*  <span className="inline-block text-center leading-[96px] relative px-14 text-5xl before:content-[''] before:rounded-full before:block before:absolute before:w-4 before:h-4 before:bg-current before:top-0 before:animate-[load_1.1s_infinite_easeInOutCirc] after:content-[''] after:rounded-full after:block after:absolute after:w-4 after:h-4 after:bg-current after:top-auto after:animate-[load_1.1s_infinite_easeInOutCirc] after:bottom-0">
        Atlas Hosting
      </span> */}
      <span className="relative mx-auto my-[-50px] box-border block h-4 w-4 translate-y-[30px] animate-[animloader_2s_easeInOutCubic_infinite] rounded bg-current text-foreground shadow-[0_30px,0_-30px] before:absolute before:top-0 before:left-[30px] before:box-border before:h-4 before:w-4 before:animate-[animloader_2s_0.2s_easeInOutCubic_infinite] before:rounded before:bg-current before:text-foreground before:shadow-[0_30px,0_-30px] before:content-[''] after:absolute after:top-0 after:left-[60px] after:box-border after:h-4 after:w-4 after:animate-[animloader_2s_0.2s_easeInOutCubic_infinite] after:rounded after:bg-current after:text-foreground after:shadow-[0_30px,0_-30px] after:delay-[400ms] after:content-['']" />
    </div>
  );
}
