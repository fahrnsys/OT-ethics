/* AOTA 2025 Occupational Therapy Code of Ethics: wording as published.
   Only the Principles, Core Values, and Standards of Conduct loaded here can be cited or looked up. */

const PRINCIPLES = {
  Beneficence: "Occupational therapy personnel shall demonstrate a concern for the well-being and safety of persons.",
  Nonmaleficence: "Occupational therapy personnel shall refrain from actions that cause harm.",
  Autonomy: "Occupational therapy personnel shall respect the right of the person to self-determination, privacy, confidentiality, and consent.",
  Justice: "Occupational therapy personnel shall promote equity, inclusion, and objectivity in the provision of occupational therapy services.",
  Veracity: "Occupational therapy personnel shall provide comprehensive, accurate, and objective information when representing the profession.",
  Fidelity: "Occupational therapy personnel shall treat service recipients (persons, groups, or populations), colleagues, and other professionals with respect, fairness, discretion, and integrity."
};

const VALUES = {
  Altruism: "indicates a demonstration of unselfish concern for the welfare of others.",
  Equity: "emphasizes fair and just treatment for all individuals, regardless of their identity, background, or circumstances.",
  Freedom: "indicates valuing each person’s right to exercise autonomy and demonstrate independence, initiative, and self-direction.",
  Justice: "indicates that occupational therapy personnel provide occupational therapy services for all persons in need of these services and maintain a goal-directed and objective relationship with recipients of service.",
  Dignity: "indicates the importance of valuing, promoting, and preserving the inherent worth and uniqueness of each person.",
  Truth: "indicates that occupational therapy personnel in all situations should be faithful to facts and reality.",
  Prudence: "indicates the ability to govern and discipline oneself through the use of reason.",
  Advocacy: "involves actively promoting the occupational rights of individuals, groups, and populations by ensuring access to essential resources, services, and opportunities for meaningful participation."
};

const SECTIONS = {
  1: "Professional Integrity, Responsibility, and Accountability",
  2: "Therapeutic Relationships",
  3: "Documentation, Reimbursement, and Financial Matters",
  4: "Service Delivery",
  5: "Professional Competence, Education, Supervision, and Training",
  6: "Communication"
};

/* id: [Principle or null, text] */
const STD = {
  "1A": [null, "Comply with AOTA policies, AOTA Official Documents, and current federal or state laws that apply to the profession of occupational therapy."],
  "1B": ["Fidelity", "Abide by policies, procedures, and protocols when serving or acting on behalf of a professional organization or employer to fully and accurately represent the organization’s official and authorized positions."],
  "1C": ["Justice", "Inform employers, employees, colleagues, students, and researchers of applicable policies, laws, and AOTA Official Documents."],
  "1D": ["Justice", "Provide transparency through all written communications and provide relevant disclosures when participating in business arrangements."],
  "1E": ["Justice", "Do not engage in illegal actions, whether directly or indirectly, that harm partners in occupational therapy practice."],
  "1F": ["Fidelity", "Do not engage in actions that reduce the public’s trust in occupational therapy."],
  "1G": ["Justice", "Report potential or known unethical or illegal actions in practice, education, or research to appropriate authorities."],
  "1I": ["Nonmaleficence", "Do not exploit human, financial, or material resources, or any relationship established as an occupational therapy practitioner, educator, or researcher, to further one’s own physical, emotional, financial, political, or business interest."],
  "1J": ["Fidelity", "Do not engage in conflicts of interest or conflicts of commitment in employment, volunteer roles, or research."],
  "2A": ["Nonmaleficence", "Do not engage in actions that inflict or threaten to inflict injury or harm (physical, psychosocial, or existential) to recipients of occupational therapy services, students, research participants, colleagues, and employees."],
  "2B": ["Autonomy", "Establish a collaborative relationship with recipients of service that honors and promotes shared decision-making, service recipient autonomy, culture or identity, and service recipient well-being."],
  "2C": ["Justice", "Practice cultural humility and challenge inequitable power dynamics within therapeutic and professional relationships that jeopardize inclusion, collaboration, and diversity of thought."],
  "2D": ["Autonomy", "Do not threaten, manipulate, coerce, or deceive service recipients or care partners to promote compliance with occupational therapy recommendations."],
  "2H": ["Fidelity", "Proactively examine, identify, and work to remedy any conflict, whether interpersonal, workplace, or internal (e.g., self-identified conflict of values) that puts at risk the opportunity for service recipients, students, or research participants to access safe, competent, and unbiased occupational therapy services, education, or research."],
  "2I": ["Nonmaleficence", "Do not abandon the service recipient, and attempt to facilitate appropriate transitions when unable to provide competent services for any reason."],
  "3A": ["Justice", "Bill and collect fees justly and legally in a manner that is fair, reasonable, and commensurate with services delivered."],
  "3B": ["Justice", "Ensure that documentation for reimbursement purposes is done in accordance with applicable laws, guidelines, and regulations."],
  "3C": ["Veracity", "Record and report in an accurate and timely manner and in accordance with applicable regulations all information related to professional or academic documentation and activities."],
  "3D": ["Nonmaleficence", "Do not follow arbitrary directives that compromise the rights or well-being of others, including unrealistic productivity expectations; fabrication, falsification, or plagiarism of documentation; or inaccurate coding."],
  "4B": ["Beneficence", "Provide appropriate evaluation and a plan of intervention for recipients of occupational therapy services specific to their needs."],
  "4C": ["Beneficence", "Use, to the extent possible, evaluation, planning, intervention techniques, assessments, and therapeutic equipment that are evidence based, current, and within the recognized scope of occupational therapy practice."],
  "4D": ["Autonomy", "Obtain informed consent (written, verbal, electronic, or implied) after disclosing appropriate information and answering any questions posed by the recipient of service, qualified family member or caregiver, or research participant to ensure voluntary participation."],
  "4E": ["Autonomy", "Fully disclose the benefits, risks, and potential outcomes of any intervention, the occupational therapy personnel who will be providing the intervention, and any reasonable alternatives to the proposed intervention."],
  "4F": ["Veracity", "Describe the type and duration of occupational therapy services accurately in professional contracts, including the duties and responsibilities of all involved parties."],
  "4G": ["Autonomy", "Respect the service recipient’s right to refuse occupational therapy services temporarily or permanently, even when that refusal has the potential to result in poor outcomes."],
  "4H": ["Beneficence", "Provide occupational therapy services, including education and training, that are within each practitioner’s level of competence and scope of practice."],
  "4I": ["Beneficence", "Reevaluate and reassess recipients of service in a timely manner to determine whether goals are being achieved and whether intervention plans should be revised."],
  "4J": ["Beneficence", "Terminate occupational therapy services in collaboration with the service recipient or responsible party when the services are no longer beneficial."],
  "4K": ["Beneficence", "Refer to other providers when indicated by the needs of the service recipient."],
  "4L": ["Justice", "Provide information and resources to address barriers to access for persons in need of occupational therapy services."],
  "4M": ["Justice", "Report systems and policies that are discriminatory or unfairly limit or prevent access to occupational therapy."],
  "5A": ["Veracity", "Keep and maintain required credentials for the occupational therapy services provided in all work settings, including academic, research, physical, and virtual settings."],
  "5B": ["Veracity", "Represent credentials, qualifications, education, experience, training, roles, duties, competence, contributions, and findings accurately in all forms of communication."],
  "5C": ["Beneficence", "Take steps (e.g., professional development, research, supervision, training) to ensure proficiency, use careful judgment, and weigh potential for harm when generally recognized standards do not exist in emerging technology or areas of practice."],
  "5D": ["Beneficence", "Maintain competence through ongoing participation in professional development relevant to one’s practice area."],
  "5E": ["Fidelity", "Take action to resolve incompetent, disruptive, unethical, illegal, or impaired practice in self or others."],
  "5F": ["Beneficence", "Ensure that all duties delegated to other occupational therapy personnel are congruent with their credentials, qualifications, experience, competencies, and scope of practice with respect to service delivery, supervision, fieldwork education, and research."],
  "5G": ["Justice", "Provide appropriate supervision in accordance with AOTA Official Documents and relevant laws, regulations, policies, procedures, standards, and guidelines."],
  "5H": ["Veracity", "Be honest, fair, accurate, respectful, and timely in gathering and reporting fact-based information regarding employee job performance and student performance."],
  "6A": ["Autonomy", "Maintain the confidentiality of all verbal, written, electronic, augmentative, and nonverbal communications in compliance with applicable laws, including all aspects of privacy laws and exceptions thereto (e.g., Health Insurance Portability and Accountability Act, Family Educational Rights and Privacy Act)."],
  "6C": ["Fidelity", "Preserve, respect, and safeguard private information about employees, colleagues, and students unless otherwise mandated or permitted by relevant laws."],
  "6D": ["Autonomy", "Use responsible conduct, respect, and discretion when engaging in social media, including but not limited to refraining from posting protected health or other identifying information and clarifying whether one is acting in a professional or an individual capacity."],
  "6E": ["Autonomy", "Facilitate comprehension, and foster understanding, by addressing barriers to communication (e.g., aphasia; differences in language, literacy, health literacy, or culture) with the recipient of service (or responsible party), student, or research participant, by clarifying and analyzing any issues while providing supporting justifications or educational material."],
  "6F": ["Veracity", "Avoid participating in any form of communication that contains false, fraudulent, deceptive, misleading, or unfair statements or claims. Practitioners must refrain from commenting when there is insufficient knowledge, uncertainty, or a lack of consensus about a certain topic."],
  "6G": ["Veracity", "Identify and fully disclose to all appropriate persons any errors or adverse events that compromise the safety of service recipients."],
  "6J": ["Fidelity", "In one’s professional capacity, avoid hostile communication that is threatening, discriminatory, derogatory, biased, and intimidating."],
  "6K": ["Fidelity", "Engage in collaborative actions and communication as a member of interprofessional teams to facilitate quality care and safety for service recipients."]
};

/* Where the Code stops. Shown in the Boundaries panel and cited when a scenario turns on law, payer rules, or policy. */
const BEYOND_NOTE = "The Code is not exhaustive. It defers to applicable laws and policies, so payer rules, privacy law, licensure requirements, and whistleblower protections are checked with your compliance office, your state board, or legal counsel. For hard calls, the Code points to ethics committees, organizational ethics officers or consultants, and the AOTA Ethics Commission.";

if (typeof module === "object" && module.exports) module.exports = { PRINCIPLES, VALUES, SECTIONS, STD, BEYOND_NOTE };
