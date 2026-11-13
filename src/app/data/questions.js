// These 12 questions are FIXED. They are not editable from the website.
export const sections = [
  {
    id: "personal",
    title: "Personal Information",
    subtitle: "Tell us a little about yourself.",
    questions: [
      { name: "full_name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { name: "age", label: "Age", type: "number", placeholder: "Enter your age", required: true, min: 1, max: 120 },
      { name: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other", "Prefer not to say"] },
      { name: "email", label: "Email Address", type: "email", placeholder: "example@email.com", required: true },
      { name: "phone", label: "Phone Number", type: "tel", placeholder: "Enter phone number", required: true },
      { name: "district", label: "District", type: "text", placeholder: "Enter your district", required: true },
    ],
  },
  {
    id: "education",
    title: "Educational Information",
    subtitle: "Tell us about your education.",
    questions: [
      { name: "qualification", label: "Educational Qualification", type: "select", required: true, options: ["SSC", "HSC", "Diploma", "Undergraduate", "Postgraduate", "Other"] },
      { name: "university", label: "University Name", type: "text", placeholder: "Enter university name", required: true },
      { name: "department", label: "Department", type: "text", placeholder: "Enter your department", required: true },
      { name: "academic_year", label: "Academic Year", type: "select", required: true, options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Other"] },
    ],
  },
  {
    id: "additional",
    title: "Additional Information",
    subtitle: "A few final questions.",
    questions: [
      { name: "occupation", label: "Current Occupation", type: "select", required: true, options: ["Student", "Employed", "Self-employed", "Unemployed", "Other"] },
      { name: "feedback", label: "Additional Feedback", type: "textarea", placeholder: "Write your feedback here (optional)", required: false },
    ],
  },
];

export const allQuestions = sections.flatMap((section) => section.questions);
