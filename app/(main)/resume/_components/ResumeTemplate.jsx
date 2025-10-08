// components/resume/ResumeTemplate.jsx
"use client";

import React from "react";

const SectionHeader = ({ children }) => (
  <div className="w-full border-t border-[#6e6e6e] my-3" aria-hidden="true">
    <div className="-mt-3 text-center">
      <span className="px-3 bg-white text-[12.5px] tracking-wider font-semibold text-[#222] uppercase">
        {children}
      </span>
    </div>
  </div>
);

const Dot = () => <span className="mx-2 text-[#888]">•</span>;

const EducationItem = ({ school, degree, gpa, location, period }) => (
  <div className="flex justify-between text-[12px] leading-snug">
    <div>
      <div className="font-semibold text-[#111]">{school}</div>
      {degree && (
        <div className="text-[#333]">
          {degree}
          {gpa ? `; GPA: ${gpa}` : ""}
        </div>
      )}
    </div>
    <div className="text-right text-[#333]">
      {location && <div>{location}</div>}
      {period && <div>{period}</div>}
    </div>
  </div>
);

const Bullet = ({ children }) => (
  <li className="list-disc ml-4 marker:text-[#333] text-[12px] leading-[1.35rem] text-[#1a1a1a]">
    {children}
  </li>
);

const ExperienceItem = ({ company, title, period, bullets, link }) => (
  <div className="mb-2">
    <div className="flex justify-between text-[12px] leading-tight">
      <div className="font-semibold text-[#111]">
        {company}
        {link ? (
          <>
            {" "}
            |{" "}
            <a
              href={link}
              className="text-[#1a5cff] underline"
              target="_blank"
              rel="noreferrer"
            >
              LINK
            </a>
          </>
        ) : null}
      </div>
      <div className="text-[#333]">{period}</div>
    </div>
    {title && (
      <div className="text-[12px] text-[#333] mb-1">{title}</div>
    )}
    <ul className="mt-1">
      {(bullets || []).map((b, i) => (
        <Bullet key={i}>{b}</Bullet>
      ))}
    </ul>
  </div>
);

const ProjectItem = ({ title, link, period, bullets }) => (
  <div className="mb-2">
    <div className="flex justify-between text-[12px] leading-tight">
      <div className="font-semibold text-[#111]">
        {title}{" "}
        {link ? (
          <>
            |{" "}
            <a
              href={link}
              className="text-[#1a5cff] underline"
              target="_blank"
              rel="noreferrer"
            >
              LINK
            </a>
          </>
        ) : null}
      </div>
      <div className="text-[#333]">{period}</div>
    </div>
    <ul className="mt-1">
      {(bullets || []).map((b, i) => (
        <Bullet key={i}>{b}</Bullet>
      ))}
    </ul>
  </div>
);

const CertificateItem = ({ title, link, period, bullets }) => (
  <div className="mb-2">
    <div className="flex justify-between text-[12px] leading-tight">
      <div className="font-semibold text-[#111]">
        {title}{" "}
        {link ? (
          <>
            |{" "}
            <a
              href={link}
              className="text-[#1a5cff] underline"
              target="_blank"
              rel="noreferrer"
            >
              CERTIFICATE
            </a>
          </>
        ) : null}
      </div>
      <div className="text-[#333]">{period}</div>
    </div>
    <ul className="mt-1">
      {(bullets || []).map((b, i) => (
        <Bullet key={i}>{b}</Bullet>
      ))}
    </ul>
  </div>
);

export default function ResumeTemplate({ data, fullName }) {
  const {
    contactInfo = {},
    education = [],
    skillsSummary = {
      languages: "",
      frameworks: "",
      tools: "",
      platforms: "",
      softSkills: "",
    },
    experience = [],
    projects = [],
    certificates = [],
  } = data || {};

  return (
    <div
      id="resume-pdf"
      className="mx-auto bg-white text-black px-8 py-6"
      style={{
        width: "794px", // A4 width at 96 DPI
        minHeight: "1123px",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[18px] font-extrabold tracking-wide text-[#111]">
            {fullName || "FULL NAME"}
          </div>
          <div className="text-[12px] text-[#1a5cff] underline flex gap-3">
            {contactInfo.linkedin && (
              <a href={contactInfo.linkedin} target="_blank" rel="noreferrer">
                Linkedin
              </a>
            )}
            {contactInfo.github && (
              <a href={contactInfo.github} target="_blank" rel="noreferrer">
                GitHub/ Behance
              </a>
            )}
          </div>
        </div>
        <div className="text-right text-[12px]">
          <div className="text-[#333]">Email:</div>
          <div className="text-[#111]">{contactInfo.email || ""}</div>
          <div className="text-[#333] mt-1">Mobile:</div>
          <div className="text-[#111]">{contactInfo.mobile || ""}</div>
        </div>
      </div>

      {/* Education */}
      <SectionHeader>EDUCATION</SectionHeader>
      <div className="space-y-2">
        {education.map((e, idx) => (
          <EducationItem
            key={idx}
            school={e.institution}
            degree={e.degree}
            gpa={e.gpa}
            location={e.location}
            period={e.period}
          />
        ))}
      </div>

      {/* Skills Summary */}
      <SectionHeader>SKILLS SUMMARY</SectionHeader>
      <div className="grid grid-cols-2 gap-y-1 text-[12px]">
        <div className="flex">
          <div className="font-semibold min-w-[92px] text-[#111]">Languages:</div>
          <div className="text-[#1a1a1a]">{skillsSummary.languages}</div>
        </div>
        <div className="flex">
          <div className="font-semibold min-w-[92px] text-[#111]">Frameworks:</div>
          <div className="text-[#1a1a1a]">{skillsSummary.frameworks}</div>
        </div>
        <div className="flex">
          <div className="font-semibold min-w-[92px] text-[#111]">Tools:</div>
          <div className="text-[#1a1a1a]">{skillsSummary.tools}</div>
        </div>
        <div className="flex">
          <div className="font-semibold min-w-[92px] text-[#111]">Platforms:</div>
          <div className="text-[#1a1a1a]">{skillsSummary.platforms}</div>
        </div>
        <div className="flex col-span-2">
          <div className="font-semibold min-w-[92px] text-[#111]">Soft Skills:</div>
          <div className="text-[#1a1a1a]">{skillsSummary.softSkills}</div>
        </div>
      </div>

      {/* Work Experience */}
      <SectionHeader>WORK EXPERIENCE</SectionHeader>
      <div className="space-y-3">
        {experience.map((exp, idx) => (
          <ExperienceItem
            key={idx}
            company={exp.organization}
            title={exp.title}
            link={exp.link}
            period={exp.period}
            bullets={(exp.description || "").split("\n").filter(Boolean)}
          />
        ))}
      </div>

      {/* Projects */}
      <SectionHeader>PROJECTS</SectionHeader>
      <div className="space-y-3">
        {projects.map((p, idx) => (
          <ProjectItem
            key={idx}
            title={p.title}
            link={p.link}
            period={p.period}
            bullets={(p.description || "").split("\n").filter(Boolean)}
          />
        ))}
      </div>

      {/* Certificates */}
      <SectionHeader>CERTIFICATES</SectionHeader>
      <div className="space-y-3">
        {certificates.map((c, idx) => (
          <CertificateItem
            key={idx}
            title={c.title}
            link={c.link}
            period={c.period}
            bullets={(c.description || "").split("\n").filter(Boolean)}
          />
        ))}
      </div>
    </div>
  );
}
