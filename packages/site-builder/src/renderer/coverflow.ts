/**
 * CSS do efeito `coverflow` do `SiCar` (`blocks/sim-lib.tsx`, prop `effect="coverflow"`): os slides ficam empilhados
 * (como no fade), o atual (`.on`) fica no centro, reto, e o anterior/próximo (`.is-prev`/`.is-next`) aparecem girados em
 * perspectiva, menores e com um degradê escuro. O `fx-runtime` (ramo `data-fade`) só troca essas classes; o HTML já sai
 * com elas, então o efeito aparece também sem JavaScript.
 *
 * Não está em `styles.ts` de propósito: o CSS base vai em **todo** site, e os templates que não usam o efeito têm de
 * continuar com o mesmo HTML exportado. Uma variante que queira o coverflow acrescenta `coverflowCss` ao próprio CSS
 * (`fundacao.ts` faz isso). `--cf-w` (largura do slide central, padrão 36%) e `--si-speed` vêm do bloco.
 */
const C = ".sb .si-car[data-effect=coverflow][data-fade]";

export const coverflowCss = `
${C} .si-car-view{perspective:1100px}
${C} .si-slide{position:relative;justify-self:center;width:var(--cf-w,36%);transform:scale(.7);transition:transform var(--si-speed,.3s) ease,opacity var(--si-speed,.3s) ease,visibility 0s linear var(--si-speed,.3s)}
${C} .si-slide.on{z-index:2;transform:none;transition:transform var(--si-speed,.3s) ease,opacity var(--si-speed,.3s) ease}
${C} .si-slide.is-prev,${C} .si-slide.is-next{z-index:1;opacity:1;visibility:visible;transition:transform var(--si-speed,.3s) ease,opacity var(--si-speed,.3s) ease}
${C} .si-slide.is-prev{transform:translateX(-74%) rotateY(32deg) scale(.85)}
${C} .si-slide.is-next{transform:translateX(74%) rotateY(-32deg) scale(.85)}
${C} .si-slide.is-prev::after,${C} .si-slide.is-next::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(90deg,#000000A6,#0000001F)}
${C} .si-slide.is-next::after{background:linear-gradient(270deg,#000000A6,#0000001F)}
@media (prefers-reduced-motion:reduce){${C} .si-slide{transition:none}}
`;
