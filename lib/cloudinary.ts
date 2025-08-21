export type CldOpts = {
    w?: number; h?: number;
    c?: "fill"|"fit"|"thumb"|"scale"|"crop";
    q?: number|"auto"; f?: "auto"|"jpg"|"png"|"webp"|"avif";
    dpr?: number|"auto"; g?: "auto"|"face"|"faces"|"center";
    r?: number|"max";
    extra?: string;
  };
  
  // selit transform dalam secure_url Cloudinary
  export function cld(url: string, opts: CldOpts) {
    if (!url) return url;
    const tx = [
      opts.f && `f_${opts.f}`,
      opts.q && `q_${opts.q}`,
      opts.dpr && `dpr_${opts.dpr}`,
      opts.c && `c_${opts.c}`,
      opts.g && `g_${opts.g}`,
      opts.r && `r_${opts.r}`,
      opts.w && `w_${opts.w}`,
      opts.h && `h_${opts.h}`,
      opts.extra,
    ].filter(Boolean).join(",");
  
    return url.replace("/upload/", `/upload/${tx}/`);
  }
  
  // presets
  export const coverHero = (url: string) =>
    cld(url, { f:"auto", q:"auto", dpr:"auto", c:"fill", w:1200, h:630 });
  
  export const coverCard = (url: string) =>
    cld(url, { f:"auto", q:"auto", c:"fill", w:800, h:450 });
  