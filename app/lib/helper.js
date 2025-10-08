// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}

export function generateResumeHTML(values, fullName) {
  const { contactInfo, summary, skills, experience, education, projects, certificates } = values;

  const sectionTitle = (title) => `
    <h2 class="text-center text-sm font-bold tracking-wide border-b border-gray-400 pb-1 mb-2">${title}</h2>
  `;

  const sectionList = (items) =>
    items
      .map(
        (i) => `
      <div class="mb-1">
        <p class="font-semibold text-xs">${i.title}</p>
        <p class="text-[11px] text-gray-600">${i.organization}</p>
        <p class="text-[10px] text-gray-500">${i.startDate} - ${i.endDate || "Present"}</p>
        <p class="text-[11px] mt-1 whitespace-pre-line">${i.description}</p>
      </div>
    `
      )
      .join("");

  return `
    <div class="text-center">
      <h1 class="text-lg font-bold uppercase tracking-wider">${fullName}</h1>
      <p class="text-[11px] text-gray-600">${contactInfo.email} | ${contactInfo.mobile} | ${
    contactInfo.linkedin || ""
  }</p>
    </div>

    <div class="mt-3 text-[12px]">
      ${sectionTitle("SKILLS SUMMARY")}
      <p class="text-[11px]">${skills}</p>

      ${sectionTitle("WORK EXPERIENCE")}
      ${experience?.length ? sectionList(experience) : ""}

      ${sectionTitle("PROJECTS")}
      ${projects?.length ? sectionList(projects) : ""}

      ${sectionTitle("EDUCATION")}
      ${education?.length ? sectionList(education) : ""}

      ${sectionTitle("CERTIFICATES")}
      ${certificates?.length ? sectionList(certificates) : ""}
    </div>
  `;
}
