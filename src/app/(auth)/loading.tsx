import "./loading.css";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full text-shadow-amber-950/50">
      <span className="block w-4 h-4 shadow-[0_30px,0_-30px] rounded bg-current text-foreground relative translate-y-[30px] box-border my-[-50px] mx-auto before:content-[''] before:box-border before:w-4 before:h-4 before:shadow-[0_30px,0_-30px] before:rounded before:bg-current before:text-foreground before:absolute before:left-[30px] before:top-0 after:content-[''] after:box-border after:w-4 after:h-4 after:shadow-[0_30px,0_-30px] after:rounded after:bg-current after:text-foreground after:absolute after:left-[60px] after:top-0 animate-[animloader_2s_easeInOutCubic_infinite] after:delay-[400ms] before:animate-[animloader_2s_0.2s_easeInOutCubic_infinite] after:animate-[animloader_2s_0.2s_easeInOutCubic_infinite]" />
    </div>
  );
}
