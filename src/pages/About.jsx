import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

/* -------------------------------------------------
   Reusable Section component
   ------------------------------------------------- */
const Section = ({ title, children }) => (
  <div>
    <h4 className="font-bold text-[#0F4C81] mb-2 flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-[#58A1D3] rounded-full animate-pulse"></div>
      {title}
    </h4>
    <div className="text-gray-700 leading-relaxed">{children}</div>
  </div>
);

/* -------------------------------------------------
   Main page component
   ------------------------------------------------- */
const BarangayDayDoc = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/files/001_2020_BRGY_DAY.docx";
    link.download = "Barangay-Upper-Ichon-History.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
              Barangay Day Ordinance
            </h1>
            <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Official Ordinance No. 01, Series of 2020 — Establishing Upper Ichon
            Barangay Day
          </p>
        </div>
      </section>

      {/* Document Card – scrollable when needed */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <div
            className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/20 transition-all duration-1000 overflow-y-auto max-h-[80vh] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* OFFICIAL HEADER – BIG LOGO */}
            <div className="flex items-center justify-center gap-10 mb-12 px-4">
              <div className="flex-shrink-0">
                <img
                  src="/files/brgy.png"
                  alt="Barangay Upper Ichon Seal"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-gray-800">
                  Republic of the Philippines
                </p>
                <p className="text-sm font-medium text-gray-800">
                  Province of Southern Leyte
                </p>
                <p className="text-sm font-medium text-gray-800">
                  Municipality of Macrohon
                </p>
                <p className="text-base font-bold text-gray-900 mt-2">
                  Barangay Upper Ichon
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold uppercase text-[#0F4C81] tracking-wider">
                OFFICE OF THE SANGGUNIANG BARANGAY
              </h2>
              <h3 className="text-xl font-bold uppercase mt-4 text-[#0F4C81]">
                ORDINANCE NO. 01
              </h3>
              <p className="text-sm italic mt-2 text-gray-600">
                Series of 2020
              </p>
              <p className="mt-6 text-lg font-semibold italic text-[#0F4C81] max-w-4xl mx-auto">
                "AN ORDINANCE APPROVING THE BARANGAY DAY ORDINANCE OF BARANGAY
                UPPER ICHON"
              </p>
            </div>

            {/* ALL SECTIONS – TWO COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-sm leading-relaxed text-justify font-serif text-gray-700">
              {/* LEFT COLUMN */}
              <div className="space-y-8">
                <Section title="SECTION 1. TITLE.">
                  This Ordinance shall be known as{" "}
                  <strong>
                    "THE BARANGAY DAY ORDINANCE OF BARANGAY UPPER ICHON."
                  </strong>
                </Section>

                <Section title="SECTION 2. HISTORY OF THE BARANGAY.">
                  The name <strong>"LUMBANG"</strong> originated from a large{" "}
                  <em>"MACU TREE"</em> locally called <em>"LUMBANG"</em>. In the
                  early 1900s it was briefly renamed <strong>"KAMPLAT"</strong>{" "}
                  but reverted to <strong>"BARRIO LUMBANG"</strong>. It
                  separated from Barangay Ichon in the 1980s with the help of{" "}
                  <strong>MR. FRANCISCO HANOPOL</strong>, DILG Regional Director
                  (married to a local), and was officially renamed{" "}
                  <strong>"UPPER ICHON"</strong> in 1981.
                  <br />
                  <br />
                  Fiesta was originally on <strong>April 5</strong>, later moved
                  to <strong>April 23</strong>.
                  <br />
                  <br />
                  <strong>Past Leaders:</strong> Heronimo Barola (1st Teniente),
                  Marta Go, Zenaida D. Barola (OIC), Anicito Tan (3 terms),
                  Visitacion O. Napalan, Carlos Epiz, Raymundo Gonzales (died in
                  office, replaced by Randy Barola OIC), Carlos Epiz
                  (re-elected), and current{" "}
                  <strong>Punong Barangay Junnard O. Napalan</strong> (2nd
                  term).
                </Section>

                <Section title="SECTION 3. DECLARATION OF BARANGAY DAY.">
                  After community consultation, <strong>April 14</strong> is
                  declared <strong>"UPPER ICHON BARANGAY DAY"</strong>.
                </Section>

                <Section title="SECTION 4. PROPOSED BARANGAY DAY ACTIVITIES.">
                  <ul className="list-disc ml-6 space-y-1 mt-2">
                    <li>Barangay Day Program</li>
                    <li>Agriculture/Aquaculture Fair</li>
                    <li>Sports Tournament</li>
                    <li>Literary-Musical & Variety Shows</li>
                    <li>Tree/Bamboo/Mangrove Planting</li>
                    <li>Clean-up Activities</li>
                    <li>Talents Showcase</li>
                    <li>Palarong Pinoy / Parlor Games</li>
                    <li>Recognition of Board Passers</li>
                    <li>Outstanding Constituents Award</li>
                    <li>Commendation of Past Leaders</li>
                    <li>Other agreed-upon activities</li>
                  </ul>
                </Section>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8">
                <Section title="SECTION 5. FUNDING.">
                  An annual budget of <strong>not less than ₱50,000.00</strong>{" "}
                  shall be allocated for Barangay Day.
                </Section>

                <Section title="SECTION 6. REPEALING CLAUSE.">
                  Any conflicting ordinance, order, or rule is hereby modified
                  or repealed.
                </Section>

                <Section title="SECTION 7. SEPARABILITY CLAUSE.">
                  If any part is declared invalid, remaining provisions remain
                  in effect.
                </Section>

                <Section title="SECTION 8. EFFECTIVITY.">
                  This Ordinance takes effect{" "}
                  <strong>30 days after submission</strong> to the Sangguniang
                  Bayan.
                </Section>

                {/* APPROVED UNANIMOUSLY */}
                <div className="text-center mt-10">
                  <p className="font-bold uppercase text-[#0F4C81]">
                    APPROVED UNANIMOUSLY.
                  </p>
                </div>

                {/* SIGNATORIES */}
                <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-semibold text-center">
                  {[
                    "CARLITO G. TANTOY",
                    "LUIS G. TANTOY",
                    "LUDY T. GALDO",
                    "ROMULO D. MATURAN",
                    "CARLITO B. PERDOGAS",
                    "ROSE HAZEL M. MILITANTE",
                    "RICO V. AGAD",
                    "MARY ROSE MORALES",
                  ].map((name, i) => (
                    <p key={i}>
                      {name} <br />
                      <span className="font-normal text-gray-600">
                        {i === 7 ? "SK Chairwoman" : "Barangay Kagawad"}
                      </span>
                    </p>
                  ))}
                </div>

                <p className="text-center font-bold mt-6 text-[#0F4C81]">
                  JUNNARD O. NAPALAN <br />
                  <span className="font-normal text-gray-700">
                    Punong Barangay
                  </span>
                </p>

                <p className="mt-6 text-center text-xs text-gray-600">
                  ADOPTED this <strong>9th day of December, 2020</strong> at
                  Barangay Upper Ichon, Macrohon, Southern Leyte.
                </p>

                <p className="mt-6 text-right text-xs">
                  <strong>Certified Correct:</strong> <br />
                  <span className="underline">MARIVIC B. ECO</span> <br />
                  Barangay Secretary
                </p>
              </div>
            </div>

            {/* DOWNLOAD BUTTON */}
            <div className="flex justify-center mt-12">
              <button
                onClick={handleDownload}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
              >
                <FileText size={20} className="group-hover:animate-pulse" />
                Download Ordinance (DOCX)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ANIMATIONS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BarangayDayDoc;
