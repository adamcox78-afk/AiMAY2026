import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/scenes";

export default function Footer() {
  return (
    <footer className="relative bg-[#faf7f1] px-6 pb-12 pt-4 text-[#3d362a]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 border-t border-[#231d14]/10 pt-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-lg tracking-[0.18em] text-[#231d14]">
            BOCA CENTER
            <span className="ml-2 font-body text-[0.6rem] uppercase tracking-eyebrow text-[#8a6d3b]">
              for Healthy Living
            </span>
          </p>
          <p className="mt-2 text-sm font-light text-[#3d362a]/70">
            Boca Raton, FL ·{" "}
            <a href={PHONE_TEL} className="underline-offset-4 hover:underline">
              {PHONE_DISPLAY}
            </a>
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs uppercase tracking-[0.16em] text-[#3d362a]/70">
            <li><a className="hover:text-[#231d14]" href="#scene-4">Hormones</a></li>
            <li><a className="hover:text-[#231d14]" href="#scene-5">Weight Loss</a></li>
            <li><a className="hover:text-[#231d14]" href="#scene-6">Longevity</a></li>
            <li><a className="hover:text-[#231d14]" href="#scene-7">Regenerative</a></li>
            <li><a className="hover:text-[#231d14]" href="#scene-9">Dr. Matilsky</a></li>
          </ul>
        </nav>
      </div>
      <p className="mt-8 text-center text-xs font-light text-[#3d362a]/50">
        © {new Date().getFullYear()} Boca Center for Healthy Living. All rights
        reserved.
      </p>
    </footer>
  );
}
