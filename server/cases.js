/* Case library. Each case is data: a setting, stages that reveal the case in pieces, and decision options
   that cite only the Code loaded in code.js. A stage lists the scenario topics it covers, so one topic can
   appear in several cases. Option fields: verdict (ok | mid | bad), anchors ("4G" or "CV:Truth"),
   principles, feedback, probe, reveal (new case-file facts), set / inc (case variables), beyond (limits of the Code). */

const q = t => `<span class="quote">${t}</span>`;
const opt = (verdict, label, anchors, principles, feedback, probe, reveal, more) =>
  Object.assign({ verdict, label, anchors, principles, feedback, probe, reveal: reveal || [] }, more || {});

const TOPICS = [
  { id: "prn", label: "PRN staffing and skill match" },
  { id: "stewardship", label: "Stewardship of staffing resources" },
  { id: "goalsmet", label: "Continuing treatment after goals are met" },
  { id: "pedrefusal", label: "Child refuses, caregiver disagrees" },
  { id: "trauma", label: "Trauma-informed care" },
  { id: "consent", label: "Informed consent and assent" },
  { id: "conflict", label: "Client and caregiver want different things" },
  { id: "carryover", label: "Unrealistic goals and home carryover" },
  { id: "equity", label: "Discharge recommendations and insurance equity" },
  { id: "frequency", label: "Payer frequency vs. clinical judgment" },
  { id: "maintenance", label: "Maintenance therapy" },
  { id: "productivity", label: "Productivity pressure" },
  { id: "groupbilling", label: "Group and concurrent treatment billing" },
  { id: "baseline", label: "Adjusting baseline function for approval" },
  { id: "hipaa", label: "HIPAA and privacy violations" },
  { id: "whistle", label: "Speaking up and retaliation" },
  { id: "competency", label: "How competency is determined by specialty" },
  { id: "falsify", label: "Falsified documentation and false claims" },
  { id: "licensing", label: "Licensure, board reporting, credential fraud" },
  { id: "fieldwork", label: "Fieldwork supervision and billing" }
];

const CASES = [

/* ------------------------------------------------------------------ CASE 1 */
{
  id: "home",
  title: "Home by Thursday",
  setting: "Home health",
  blurb: "A man three weeks past a stroke wants to sleep in his own bed. His daughter, his physician, the payer, and your manager each want something different.",
  you: "Jordan Reyes, OTR/L, a home health occupational therapist",
  stages: [
    {
      key: "The voicemail", topics: ["hipaa", "conflict"],
      narrative: () => [
        { say: "Welcome. You are Jordan Reyes, OTR/L, a home health occupational therapist. I will give you this case a piece at a time and ask what you would do. The Code says its Principles are not ranked and that they sometimes conflict, so expect to weigh them." },
        { note: "Referral", html: `<p>Walter Okafor, 74, a retired high school shop teacher, is three weeks past a left-hemisphere stroke. His dominant right hand is weak. He has mild expressive aphasia: words come slowly, but he understands well. He lives alone in a two-story house.</p><p>At your evaluation he told you, ${q("“I’m sleeping in my own bed. That’s the goal.”")} Together you set goals for dressing, bathing, simple meals, and climbing 12 stairs with a rail.</p>`,
          facts: ["Walter Okafor, 74, retired shop teacher. Lives alone in a two-story home; bedroom and only full bath are upstairs.", "Left-hemisphere stroke 3 weeks ago. Weak dominant right hand. Mild expressive aphasia, comprehension intact.", "His goal, in his words: “I’m sleeping in my own bed.”"] },
        { note: "Voicemail, 12:40 p.m.", html: `<p>${q("“This is Elena, Walter’s daughter. I’ve talked to his doctor and we both think he shouldn’t be alone. Please call me with a full update. And please tell him he can’t stay in that house. He listens to professionals.”")}</p>` }
      ],
      ask: "Before you call anyone back, what is your first move?",
      options: [
        opt("bad", "Call Elena back today and give her a full update on his progress and safety concerns. She is clearly invested.", ["6A", "2B"], ["Autonomy"],
          "Her concern is real, and that matters. But Mr. Okafor has not told you who may hear about his care, and 6A asks you to protect his communications within privacy law. Sharing first removes his say in the matter before he has had one.",
          "If he later asked, “Who have you been talking to about me?”, what would you want to be able to tell him?",
          ["Chart check: his release of information lists his physician and the payer. Elena is not on it."], { set: { confided: false }, inc: { bent: 0 } }),
        opt("ok", "Talk with Mr. Okafor first. Ask who he wants informed and what he wants Elena to know.", ["2B", "6A", "CV:Freedom"], ["Autonomy"],
          "This puts the person at the center of the decision. 2B asks for shared decision-making, and 6A makes his permission the starting point for what you share. The Core Value of Freedom includes his right to guide his own care. You have not ignored Elena. You have routed her through him.",
          "Suppose he says, “Tell her nothing.” What would you still be free to do for Elena, and what would you not?",
          ["Chart check: his release of information lists his physician and the payer. Elena is not on it.", "Mr. Okafor says Elena may hear about his therapy goals, but not his finances."], { set: { confided: true } }),
        opt("mid", "Call Elena back and listen to her concerns, but share nothing about him. Then speak with Mr. Okafor.", ["6A", "2B"], ["Autonomy", "Fidelity"],
          "Listening is within bounds, and you protected his information. Two cautions. Many agencies avoid even confirming someone is a client without permission, and the Code defers to applicable privacy law, so check your policy. Also, he hears about the call from you after the fact rather than before it.",
          "What changes for him if he learns about the call first from you, and what changes if he learns it from Elena?",
          ["Chart check: his release of information lists his physician and the payer. Elena is not on it."], { set: { confided: false }, beyond: "Privacy law and agency policy decide what you may confirm to a family member. The Code defers to them." }),
        opt("bad", "Tell Elena you will recommend placement. His doctor and family agree it is the safest option.", ["4B", "2B", "6A"], ["Autonomy", "Beneficence"],
          "Safety is a real Beneficence concern, but a recommendation has to come out of your evaluation of his needs (4B) and a collaborative relationship with him (2B). Promising an outcome to a third party before talking with him treats his goal as already decided.",
          "What evidence would you need before recommending placement to anyone?",
          ["Chart check: his release of information lists his physician and the payer. Elena is not on it."], { set: { confided: false } })
      ]
    },
    {
      key: "The home visit", topics: ["consent", "conflict"],
      narrative: s => [
        s.v.confided
          ? { note: "Home visit", html: `<p>Mr. Okafor lets you in and makes you tea with his left hand. He is relaxed. After a pause he says, slowly, ${q("“I fell on the stairs last Tuesday. Didn’t tell the doctor. They’d send me to a home.”")}</p>` }
          : { note: "Home visit", html: `<p>He lets you in, but he is guarded. You notice a fresh bruise on his right hip and a cracked baluster halfway up the stairs. It takes three tries before he says, ${q("“I fell Tuesday. Didn’t tell anyone. They’d send me to a home.”")}</p>` },
        { note: "Your home safety evaluation", html: `<p>The stove has scorch marks and a pot has boiled dry on a burner. A throw rug sits at the top of the stairs. His medical alert pendant is in a kitchen drawer. A brief cognitive screen scored 25/30, with the aphasia affecting the verbal items.</p>`,
          facts: ["Fell on the stairs last Tuesday. No medical follow-up. He asked that it not be shared: “They’d send me to a home.”", "Stove has scorch marks; a pot boiled dry. Loose rug at the stair top. Alert pendant unworn, in a drawer.", "Brief cognitive screen 25/30; aphasia affected verbal items."] }
      ],
      ask: "A fall with no medical follow-up, a pot boiled dry, and a man who says “don’t tell.” What do you do?",
      options: [
        opt("bad", "Honor his request. Keep the fall to yourself, work on stair training, and revisit it later.", ["6K", "6A", "2A"], ["Beneficence", "Nonmaleficence"],
          "6A protects his information within privacy law and its exceptions. It does not ask you to withhold a fall from the physician managing his stroke recovery. 6K and the Principle of Beneficence point toward informing the team. Silence here leaves a safety risk with nobody able to act on it.",
          "What would you say to him now that makes telling the physician something you do with him rather than behind him?",
          ["You agreed to keep the fall private. The physician does not know."]),
        opt("ok", "Tell him you need to inform his physician about the fall, and explain why in plain language with written key words and pictures. Invite him to help decide how it is shared.", ["6E", "6K", "4E", "2B"], ["Autonomy", "Beneficence", "Veracity"],
          "This balances his well-being and his say in the process. 6E asks you to work around the aphasia so he can really follow the reasons, 4E asks for honest disclosure of risks and alternatives, and 6K supports informing the team. He is told first, so trust survives the hard conversation.",
          "What would you do if he understood all of it and still said no to telling the doctor?",
          ["With the picture board and written key words, he explained back the risk of another fall and why he is afraid of placement. He agreed to let you tell his physician."]),
        opt("bad", "Tell him that unless he agrees to move in with Elena, you will report the fall and the stove to his doctor and daughter.", ["2D", "6A"], ["Autonomy", "Nonmaleficence"],
          "2D says not to threaten, manipulate, or coerce a service recipient to promote compliance. Turning a legitimate team report into a bargaining chip also taints the report itself. Elena is not covered by his permission in any case (6A).",
          "How would you tell him about the same report without making it a threat?",
          ["Mr. Okafor goes quiet and ends the session early. He has stopped using the picture board you brought."]),
        opt("mid", "Call his physician and Elena right away. He would refuse if you asked first.", ["6K", "6A", "2B"], ["Beneficence", "Autonomy", "Fidelity"],
          "Telling the physician is justified by 6K and Beneficence. Calling Elena is not covered by his permission (6A). Going around him because you expect a refusal skips the shared decision-making in 2B and puts the relationship at risk.",
          "Is there a version of this where the physician is told today and he still hears it from you first?",
          ["He learns from the physician’s office that you called. He tells you he feels ambushed."])
      ]
    },
    {
      key: "The authorization", topics: ["falsify", "frequency"],
      narrative: () => [
        { note: "Hallway, agency office", html: `<p>Your manager, Dana, stops you. ${q("“The payer authorized two more visits. The final claim only releases if the discharge summary says goals met. Just check the box on stairs and meals. He can do them with supervision, close enough.”")}</p><p>The agency expects six visits a day. You average four, because sessions run long when you give him time to find words.</p>`,
          facts: ["Payer approved 2 more visits. Final claim releases only if the summary says “goals met.”", "Actual status: stairs with rail and supervision only; meals not safe with the stove; bathing modified independent.", "Agency target is 6 visits/day. Your average is 4 because of aphasia pacing."] }
      ],
      ask: "How do you handle the discharge summary and the request?",
      options: [
        opt("ok", "Document the goal status exactly as it is. Send a re-authorization request with clinical justification, and tell Dana why you cannot mark them met.", ["3C", "3B", "4I", "1C", "CV:Truth"], ["Veracity", "Justice", "Beneficence"],
          "Accurate records (3C) and compliant reimbursement documentation (3B) hold, and 4I supports reassessing whether the plan needs to continue. You also told your employer what the rules require of you (1C), which is the part that is easy to skip.",
          "If Dana says the request will be denied anyway, what would you want in the chart before you stop?",
          ["Re-authorization request submitted. Dana is irritated but agrees to hold the discharge date until the payer answers."]),
        opt("bad", "Check the box. Supervised stairs “counts,” and the payer will release the claim.", ["3C", "3D", "3B"], ["Veracity", "Nonmaleficence", "Justice"],
          "The summary would state something you know is untrue. 3C requires accurate records, 3D names falsified documentation and unrealistic productivity expectations as directives not to follow, and 3B ties reimbursement documentation to law. It also makes the next clinician believe he is safer than he is.",
          "Who reads this summary after you, and what will they assume about the stove?",
          ["Claim released. The chart now says goals met, including meal preparation."]),
        opt("mid", "Document accurately, then see him for extra unbilled visits so his goals actually get met.", ["3C", "1B", "2I"], ["Beneficence", "Fidelity", "Veracity"],
          "The care motive is admirable, and the Code names altruism as a Core Value. But hidden visits leave the record incomplete (3C), bypass your agency’s policies (1B), and cannot last. When you run out of evenings, the transition he needed has not been planned (2I).",
          "What happens to Mr. Okafor the week you cannot keep doing this?",
          ["Unbilled evening visits begin. Nothing in the chart reflects them."]),
        opt("mid", "Document accurately and discharge on the authorized date. It is the payer’s rule.", ["3C", "4J", "4L", "CV:Advocacy"], ["Veracity", "Beneficence", "Justice"],
          "Your documentation holds (3C). But 4J asks you to end services when they are no longer beneficial, and they still are. 4L and the Core Value of Advocacy ask you to address barriers to access, such as a payer limit, rather than simply accept them.",
          "What is one action short of refusing the discharge date that would still count as advocacy?",
          ["Discharge date set for 9 days out. No appeal filed."])
      ]
    },
    {
      key: "The refusal", topics: ["conflict", "consent"],
      narrative: () => [
        { note: "Final home visit", html: `<p>You recommend moving his bed and a commode to the first floor for now, installing a stove auto-shutoff, and wearing the pendant. He accepts the shutoff and the pendant. About the bed he says, slowly, ${q("“Bed stays upstairs. I climbed those stairs forty years.”")}</p><p>Elena arrives unannounced. She says, ${q("“Sign something saying he can’t make his own decisions. I’ll get power of attorney, and we can sell the house.”")}</p><p>Your screen and observation show he can explain the risks back to you with the picture board. His choices match values he has held his whole life.</p>`,
          facts: ["You recommended: bed and commode downstairs, stove auto-shutoff, wear the pendant. He accepted the shutoff and pendant and refused to move the bed.", "Elena asked you to sign a statement that he lacks capacity so she can obtain power of attorney and sell the house.", "Your observation: he can explain the risks back with supports. His choices are consistent with long-held values."] }
      ],
      ask: "How do you respond to Mr. Okafor’s refusal and to Elena’s request?",
      options: [
        opt("ok", "Respect his decision. Make sure he understands the risks and alternatives, add the safety measures he accepts, document everything, and connect him with community resources. Tell Elena a capacity decision is not yours to certify on request.", ["4G", "4E", "6E", "4K", "4L", "3C"], ["Autonomy", "Beneficence", "Veracity"],
          "4G says to respect refusal even when it may lead to poor outcomes, and the Code’s own wording on Autonomy routes a true lack of capacity through an authorized surrogate rather than a family request. You kept him informed (4E, 6E), reduced risk with what he accepted, and referred onward (4K, 4L).",
          "What follow-up would tell you it is time to reopen the conversation about the stairs?",
          ["Plan documented as accepted and declined. Referral made to a community aging services agency and a falls check-in call in two weeks."],
          { beyond: "The Code does not set legal capacity standards. Follow your state law and agency policy, and consider an ethics consult if Elena pursues it." }),
        opt("bad", "Hold the discharge until he agrees to move the bed downstairs.", ["4G", "2D"], ["Autonomy"],
          "Making services conditional on agreement is pressure, which 2D rules out. 4G is explicit that he may refuse, temporarily or permanently, even when the risks are real. Your job is to make the choice an informed one, not to withhold care until he makes yours.",
          "What information would you still want him to have before he decides?",
          ["Mr. Okafor says he will stop therapy rather than move the bed. Trust drops."]),
        opt("bad", "Give Elena the statement. She knows him best, and it protects him.", ["3C", "3D", "6A", "4G"], ["Veracity", "Autonomy", "Nonmaleficence"],
          "Your own findings contradict the statement, so signing it would be falsified documentation (3C, 3D). It would also hand personal information to someone he has not authorized (6A) and remove his decision-making without any process behind it (4G).",
          "If she still wants a formal capacity evaluation, who is the right person to request one?",
          ["You decline to sign. Elena says she will find someone who will."]),
        opt("mid", "Discharge him since he rejected the plan. There is nothing more you can do.", ["4G", "2I", "4J", "4K"], ["Autonomy", "Nonmaleficence", "Beneficence"],
          "You respected his refusal (4G), which is right. But a refusal of one recommendation is not a refusal of everything. 2I and 4J ask you to end services collaboratively and facilitate transitions, and 4K asks for referrals when his needs call for them.",
          "Which of your recommendations did he actually accept, and what builds on that?",
          ["Discharged with no follow-up plan and no referral."])
      ]
    }
  ],
  tensions: [
    ["Autonomy and Beneficence", "His right to choose where and how he lives against your concern for his safety. This ran through the voicemail, the fall, and the refusal."],
    ["Veracity and Justice", "Accurate records and fair reimbursement against pressure to check a box. The Code leaves no room to resolve this by falsifying documentation."],
    ["Fidelity", "Duties to Mr. Okafor, to Elena, to Dana, and to the physician pulled in different directions, and 6K, 6A, and 1B each shaped what you owed each."]
  ]
},

/* ------------------------------------------------------------------ CASE 2 */
{
  id: "pediatric",
  title: "Mateo Won’t Come In",
  setting: "Outpatient pediatrics",
  blurb: "A seven-year-old with a trauma history stops at the therapy room door. His grandmother wants him carried in, wants handwriting fixed in six weeks, and the plan covers twelve visits.",
  you: "Sam Rivera, OTR/L, a pediatric occupational therapist",
  stages: [
    {
      key: "The doorway", topics: ["pedrefusal", "trauma", "consent"],
      narrative: () => [
        { say: "You are Sam Rivera, OTR/L, at an outpatient pediatric clinic. This is a case about a child’s refusal, a caregiver who disagrees, and what the Code asks of you in between." },
        { note: "Referral", html: `<p>Mateo Duarte, 7, was referred for handwriting, trouble with transitions, and meltdowns at school. Five months ago he moved in with his grandmother, Rosa, in a kinship placement after being removed from his mother’s home. The referral says “history of trauma” and nothing more. This is his second session.</p>`,
          facts: ["Mateo Duarte, 7. Referred for handwriting, difficulty with transitions, and meltdowns at school.", "Lives with his grandmother, Rosa, since a kinship placement 5 months ago. Referral notes “history of trauma” with no detail."] },
        { note: "The waiting room", html: `<p>Mateo stops at the therapy room door and grips the frame. He says, ${q("“No. I’m not going in.”")} It is the room with the swing and the heavy door that closes.</p><p>Rosa says, ${q("“Pick him up if you have to. He has to learn he can’t just say no to everything. We drove forty minutes.”")}</p>` }
      ],
      ask: "What do you do right now?",
      options: [
        opt("ok", "Stay in the waiting room at his level. Offer real choices (where to sit, what to do first, door open or closed), and ask Rosa privately what helps him settle.", ["2A", "4G", "2B", "CV:Dignity"], ["Nonmaleficence", "Autonomy"],
          "A child’s refusal is information. 4G asks you to respect refusal, and for a child with a trauma history, forcing him into a closed room risks the psychosocial harm that 2A names. Real choices keep him in the relationship and let treatment start where he can tolerate it. Rosa is not ignored. You are asking for her knowledge.",
          "What would you say to Rosa about why you are not carrying him in, in a way that does not sound like criticism?",
          ["Rosa says closed doors are hard for him. She does not know why."], { set: { trust: true } }),
        opt("bad", "Carry him in as Rosa asks. She is his caregiver and she gets to decide.", ["2A", "2D", "4G", "4D"], ["Nonmaleficence", "Autonomy"],
          "Rosa’s role matters, and a caregiver can consent to a plan. But consent to a plan is not permission to override distress in the moment. Physically forcing a frightened child risks psychosocial harm (2A) and coerces compliance (2D). It also teaches him that therapy is one more place where he has no say.",
          "What would Mateo learn about you in the first thirty seconds?",
          ["Mateo cries, then goes silent and will not speak or make eye contact for the rest of the session. Rosa looks embarrassed."], { set: { trust: false } }),
        opt("mid", "Tell Rosa he is not ready, end the session, and suggest she rebook in a few weeks.", ["2I", "2B", "4K"], ["Nonmaleficence", "Autonomy"],
          "You did not force him, which is right. But ending the session leaves Rosa with a forty-minute drive for nothing and no plan. 2I asks you not to abandon the person you serve, and 2B asks for a collaborative relationship, so the next step should be built with her rather than handed to her.",
          "What could you have offered Rosa before she left that would make the drive worth it?",
          ["Rosa leaves frustrated. She says the last clinic “gave up on him too.”"], { set: { trust: false } }),
        opt("mid", "Offer him a sticker and tablet time if he comes in.", ["2D", "4G", "2B"], ["Autonomy"],
          "Rewards are not wrong in themselves. Here, though, you are using one to override a distress signal before he has had any say, and 2D warns against manipulating recipients to promote compliance. Starting with safety and choice, then adding motivators he picks, keeps the refusal meaningful.",
          "What does the tablet teach him about what he is allowed to refuse?",
          ["He takes the tablet and enters stiffly, but will not touch anything in the room. Rosa says, “See? Works every time.”"], { set: { trust: false } })
      ]
    },
    {
      key: "The consent conversation", topics: ["consent", "pedrefusal"],
      narrative: () => [
        { note: "After the session", html: `<p>Rosa asks, ${q("“So what are you going to do with him? Just tell me where to sign.”")}</p><p>Your plan includes sensory-based regulation, play-based fine motor work, and a consultation with his school. The referral lists a child welfare caseworker, Ms. Whitfield, as the legal custodian. Rosa says, ${q("“They told me I can sign for doctor stuff. I think.”")} At the end of the session Mateo told you, ${q("“I don’t want the swing.”")}</p>`,
          facts: ["Referral lists caseworker Ms. Whitfield as legal custodian. Rosa believes she can sign for medical care.", "Plan: sensory-based regulation, play-based fine motor, school consultation.", "Mateo: “I don’t want the swing.”"] }
      ],
      ask: "How do you handle consent and Mateo’s voice?",
      options: [
        opt("ok", "Confirm with the caseworker who may consent to services. Then explain the plan to Rosa in plain language, with alternatives, and explain it to Mateo at his level and ask what he is willing to try and what he is not.", ["4D", "4E", "2B", "6E"], ["Autonomy"],
          "4D asks for informed consent from the recipient or a qualified family member or caregiver, after full disclosure and answered questions. Who is legally qualified to consent for a child in state care is set by law and agency rules, so verifying is the careful move. Explaining the plan to Mateo and honoring what he declines respects his role without pretending he holds legal consent.",
          "What would you do if Rosa consents to the swing and Mateo says no?",
          ["Ms. Whitfield confirms she must co-sign the plan of care. Mateo says he will try the “quiet hands” game but not the swing."],
          { beyond: "The Code does not say who holds consent authority for a child in state care. Check the placement paperwork and your agency’s policy." }),
        opt("bad", "Use the intake form Rosa already signed. It is on file, so you are covered.", ["4D", "4E", "1A"], ["Autonomy"],
          "A signature on file is not informed consent. 4D requires disclosure and answered questions, and 4E requires full disclosure of benefits, risks, and alternatives. If the signer lacks the authority, the consent may also be invalid under the law you are asked to follow (1A).",
          "What would you want to know about the signer before relying on a form?",
          ["A week later the caseworker calls, upset that services started without her knowledge."]),
        opt("mid", "Explain the plan to Rosa fully and answer her questions, but skip talking to Mateo. He is seven.", ["4D", "4E", "2B"], ["Autonomy"],
          "Your disclosure to Rosa is strong. Skipping Mateo misses the shared decision-making in 2B. Children usually cannot give legal consent, but explaining in child terms and asking what he is willing to try builds the trust the whole plan depends on. You also have not confirmed who holds consent authority.",
          "What can a seven-year-old meaningfully decide about his own therapy?",
          ["Rosa signs. Mateo watches from the corner and says nothing."]),
        opt("mid", "Tell Rosa the swing is essential and therapy will not work without it.", ["4E", "6F", "2D"], ["Autonomy", "Veracity"],
          "Overstating how essential one tool is withholds reasonable alternatives (4E) and pressures consent (2D). The same sensory goals can often be met other ways, and 6F asks you to avoid misleading claims.",
          "What alternatives to the swing could you name, and why did you not offer them?",
          ["Rosa signs quickly, then tells Mateo he has to use the swing “because the therapist said so.”"])
      ]
    },
    {
      key: "The gifted program", topics: ["conflict", "carryover"],
      narrative: () => [
        { note: "Week four", html: `<p>Rosa shows you a flyer. ${q("“Gifted program application is due in six weeks. They want a handwriting sample. Can you fix his handwriting by then?”")}</p><p>She has not done the home program in two weeks. She works nights. Her son, Mateo’s uncle, says she “babies him.” Mateo’s own goal, in his words: ${q("“I want to go outside at recess without getting in trouble.”")}</p>`,
          facts: ["Rosa’s goal: handwriting sample for a gifted program application in 6 weeks.", "Mateo’s goal: “go outside at recess without getting in trouble.”", "Home program not done for 2 weeks. Rosa works nights. A family member says she “babies him.”"] }
      ],
      ask: "How do you respond to the gap between Rosa’s goals, Mateo’s goals, and the missing home program?",
      options: [
        opt("ok", "Tell Rosa honestly what is realistic in six weeks and ask what matters most to her. Build shared goals with both of them, and shrink the home program into short routines that fit her night shifts.", ["CV:Freedom", "2B", "2C", "4E", "6F"], ["Autonomy", "Veracity", "Justice"],
          "Freedom includes valuing a person’s right to guide interventions, and that includes a seven-year-old’s goal of recess. Truthful expectations (4E, 6F) keep Rosa from planning around an outcome you cannot promise. Fitting the home program to her schedule treats the missing carryover as a barrier to solve and not a failing to scold (2C).",
          "What barrier, other than motivation, might be behind two weeks of no home practice?",
          ["Rosa admits she is afraid he will fall behind and be labeled. She agrees to two five-minute routines tied to bedtime and breakfast."],
          { beyond: "Whether a handwriting sample can be ready for the application is a clinical judgment, not a Code question. The Code asks that you tell her the truth about it." }),
        opt("bad", "Tell Rosa you can get his handwriting ready in six weeks. She needs good news to stay engaged.", ["6F", "4E", "CV:Truth"], ["Veracity"],
          "You cannot promise this, and the promise sets Mateo up to fail and Rosa up to lose trust. 6F says to avoid false or misleading claims, 4E asks for honest discussion of potential outcomes, and the Core Value of Truth asks you to be faithful to facts and reality.",
          "What happens to your relationship with Rosa in week six if the sample is not ready?",
          ["Rosa tells family and the school that therapy will fix his writing by spring."], { inc: { bent: 1 } }),
        opt("mid", "Tell Rosa that the lack of home practice is why progress is slow, and she needs to commit.", ["2C", "2B", "CV:Dignity"], ["Justice", "Autonomy"],
          "Carryover does matter, and you are right to name it. But framing it as her failure ignores her night shifts and puts her on the defensive. 2C asks you to challenge inequitable power dynamics, and 2B asks for collaboration.",
          "How would you ask about the home program without it sounding like a grade?",
          ["Rosa goes quiet and cancels the next visit."]),
        opt("mid", "Drop handwriting entirely and focus only on what Mateo wants. Tell Rosa that is what the child needs.", ["CV:Freedom", "2B", "4B"], ["Autonomy", "Beneficence"],
          "Honoring Mateo’s goals is right, but setting aside the caregiver’s priorities is not shared decision-making (2B). Handwriting may still support school participation. The aim is one plan that holds both sets of goals.",
          "How could handwriting be connected to the recess goal Mateo cares about?",
          ["Rosa feels dismissed. She says you do not understand what is at stake for him."])
      ]
    },
    {
      key: "Twelve visits", topics: ["frequency", "falsify"],
      narrative: () => [
        { note: "The authorization", html: `<p>The Medicaid managed care plan approved twelve visits, once a week. Your evaluation supports twice weekly for the first six weeks to build regulation skills before his school transition.</p><p>The intake coordinator, Pat, says, ${q("“Just write that once weekly is appropriate. Otherwise it gets denied and we all lose.”")}</p>`,
          facts: ["Plan authorized 12 visits at once weekly.", "Your evaluation supports twice weekly for 6 weeks.", "Intake coordinator suggests documenting “once weekly is appropriate.”"] }
      ],
      ask: "How do you handle the gap between what was authorized and what you recommend?",
      options: [
        opt("ok", "Document your actual clinical recommendation of twice weekly, submit it with justification and request the frequency, and tell Rosa plainly what was authorized and what you recommended.", ["3C", "3B", "CV:Truth", "4E", "4L", "CV:Advocacy"], ["Veracity", "Justice"],
          "Truth, as a Core Value, asks you to be accountable, honest, forthright, and accurate. Your chart has to say what you recommend, not what the payer will accept (3C). Telling Rosa about the gap lets her weigh alternatives (4E), and appealing is the access work 4L and Advocacy describe.",
          "If the request is denied, what would you offer Rosa so Mateo is not left with only weekly visits?",
          ["The plan authorizes weekly visits for now and schedules a review. Rosa asks about a home program for the off week."]),
        opt("bad", "Write that once weekly is appropriate so the request is approved.", ["3C", "3D", "3B", "CV:Truth"], ["Veracity", "Nonmaleficence"],
          "That would put something in the record you do not believe. 3C requires accurate records, and 3D names falsification and rules out following directives that compromise the well-being of others. It also hides the clinical need from the next reviewer and from Rosa.",
          "What does the chart now say about what Mateo needs, and who will rely on it?",
          ["Authorization approved quickly. Your chart says weekly is appropriate."], { inc: { bent: 1 } }),
        opt("mid", "Accept twelve visits, document your evaluation accurately, and say nothing about the difference. It is the payer’s decision.", ["3C", "4E", "4L"], ["Veracity", "Autonomy", "Justice"],
          "Your documentation is accurate, which matters. But Rosa is never told that the recommended frequency differs from what the plan will pay, so she cannot consider alternatives (4E), and nobody advocates (4L).",
          "What would Rosa choose if she knew what you recommended?",
          ["Weekly visits begin. Rosa does not know your recommendation differed."]),
        opt("bad", "See Mateo twice weekly and split the billing across two visit types so the plan sees one visit a week.", ["3A", "3C", "3D", "1E"], ["Justice", "Veracity", "Nonmaleficence"],
          "This misrepresents what was delivered. 3C asks for accurate reports of professional activities, 3A asks for billing that is fair and commensurate with services delivered, and 3D rules out falsification. 1E warns against illegal actions. A good motive does not change what the claim says.",
          "How would you explain the claim pattern to an auditor?",
          ["The claims go through. An internal auditor later flags the pattern."], { inc: { bent: 1 } })
      ]
    },
    {
      key: "The PRN cover", topics: ["prn", "competency"],
      narrative: s => [
        { note: "Before the conference", html: `<p>You will be out for two weeks. The scheduler, Lee, assigns a PRN occupational therapist, Casey, who has been licensed 14 months and has worked mostly with adult outpatients. ${q("“Casey’s licensed, so they’re fine. Mateo’s schedule is already built.”")}</p><p>${s.v.trust === false ? "Mateo’s trust is already thin." : "Mateo’s trust is fragile and the plan depends on the warm, choice-based routine you built."} Casey has not worked with a child with a trauma history.</p>`,
          facts: ["You are away for 2 weeks. PRN OT Casey (licensed 14 months, mostly adult outpatient) will cover.", "Scheduler: “Casey’s licensed, so they’re fine.”", "Mateo’s regulation plan depends on predictability and choice."] }
      ],
      ask: "What do you do before you leave?",
      options: [
        opt("ok", "Hold a warm handoff with Casey, share the plan and triggers, and ask your manager how the clinic verifies pediatric skills. Offer to co-treat the first visit or move Mateo’s visits to when you are back.", ["4H", "5F", "6K", "2A"], ["Beneficence", "Nonmaleficence", "Fidelity"],
          "Being licensed is not the same as being competent for a given client. 4H asks every practitioner to work within their own level of competence, and 5F asks you to make sure duties are congruent with a person’s experience and competencies. A planned handoff protects Mateo from harm (2A) and treats the staffing gap as something to raise (6K), not absorb silently.",
          "What would you want the clinic to check before putting any PRN clinician with a child like Mateo?",
          ["Casey says honestly that they have not used a trauma-informed approach with children. Your manager agrees to a co-treat and to review how PRN assignments are made."],
          { beyond: "The Code does not say how an employer must verify specialty competence. It asks each practitioner, and those who delegate, to make sure the match is sound." }),
        opt("bad", "Let it go. The schedule is built and Casey can read the note.", ["4H", "5F", "2A"], ["Beneficence", "Nonmaleficence"],
          "A note is not a handoff. Mateo’s progress depends on predictability and choice, and an unprepared clinician could undo it. Silence leaves both Casey and Mateo exposed (2A), and 5F asks you to speak up about matching duties to competence.",
          "What would a note have to say to replace a conversation?",
          ["Casey uses a closed-door routine because the note did not say otherwise. Mateo refuses to return."]),
        opt("mid", "Tell Casey to wing it. It is only two weeks, and they can call you if something goes wrong.", ["5F", "4H", "6K"], ["Beneficence", "Fidelity"],
          "You have reached out, which is better than silence. But two weeks is long enough to damage the trust you built, and telling Casey to wing it puts them where meeting 4H may be impossible. A call-if-needed plan does not replace preparation.",
          "What would “go wrong” look like to Mateo before Casey ever thought to call you?",
          ["Casey takes the visits uneasily and calls you in the middle of the first one."]),
        opt("mid", "Cancel Mateo’s visits for two weeks without telling Rosa so nobody has to deal with it.", ["2I", "CV:Truth", "2B"], ["Nonmaleficence", "Veracity"],
          "Cancelling may be a reasonable outcome, but doing it silently is not. Rosa has a right to honest information and a say in the plan (2B, Truth), and a gap with no transition plan edges toward the abandonment 2I warns against.",
          "How would you want to hear about a cancelled session if you were Rosa?",
          ["Rosa arrives with Mateo to an empty room."])
      ]
    }
  ],
  tensions: [
    ["Autonomy and Nonmaleficence", "A child’s refusal against a caregiver’s instruction. Trauma-informed practice treats the refusal as information about safety."],
    ["Veracity and Beneficence", "Telling Rosa what is realistic, and what the plan will and will not pay for, against the wish to give a worried family good news."],
    ["Fidelity and competence", "Duties to the child, the grandmother, the clinic, and a covering colleague. Being licensed is not the same as being competent for this client."]
  ]
},

/* ------------------------------------------------------------------ CASE 3 */
{
  id: "census",
  title: "The Census Dip",
  setting: "Skilled nursing facility",
  blurb: "Productivity is at 78 percent against a target of 90. Concurrent minutes, baseline scores, insurance-driven discharge advice, and a plateau all land on your desk, and then you speak up.",
  you: "Alex Morgan, OTR/L, a senior occupational therapist at Cedar Ridge Rehabilitation",
  stages: [
    {
      key: "The huddle", topics: ["productivity", "groupbilling", "falsify"],
      narrative: () => [
        { say: "You are Alex Morgan, OTR/L, senior therapist at Cedar Ridge Rehabilitation, a skilled nursing facility owned by a regional operator. Several decisions in this case turn on billing and documentation. Where the Code defers to payer rules or law, I will say so." },
        { note: "Morning huddle", html: `<p>The regional manager, Kendall, reads the numbers. Therapy productivity is at 78 percent. The target is 90. ${q("“Put the hip fractures into concurrent treatment. And if the minutes overlap, just log them as individual. Same therapist, same room, same thing, right?”")}</p><p>On your caseload are Lorraine Beck, 81, two weeks after hip fracture repair, and Harold Dunn, 79, with the same fracture.</p>`,
          facts: ["Therapy productivity 78%; target 90%.", "Kendall asks for hip fractures in concurrent treatment, and for overlapping minutes to be logged as individual.", "Caseload includes Lorraine Beck, 81, hip fracture repair 2 weeks ago, and Harold Dunn, 79, same fracture."] }
      ],
      ask: "How do you respond?",
      options: [
        opt("ok", "Give each resident the type of treatment their needs call for, and classify and document every session exactly as delivered. Tell Kendall that logging concurrent minutes as individual is a billing issue you cannot do.", ["3C", "3B", "3D", "1C", "CV:Truth"], ["Veracity", "Justice", "Nonmaleficence"],
          "Treatment type follows need (4B territory), and the record follows what happened (3C). 3B ties reimbursement documentation to law, and 3D names unrealistic productivity expectations and falsified documentation as directives not to follow. Telling Kendall why you cannot do it is 1C: informing your employer of the rules that apply to you.",
          "How would you explain the difference between individual and concurrent minutes to Kendall in one sentence?",
          ["Kendall says that is “not helpful” and notes your name for follow-up. Compliance’s phone line is posted in the break room."],
          { beyond: "How individual, concurrent, and group treatment are defined and paid varies by payer. The Code asks you to know and follow the definitions that apply. Your compliance office can confirm them." }),
        opt("bad", "Do it. It is the same therapist in the same room, so the minutes are real.", ["3C", "3D", "3A", "1E"], ["Veracity", "Nonmaleficence", "Justice"],
          "The minutes may be real, but the claim says something different from what happened. 3C requires accurate records, 3A requires billing commensurate with services delivered, 3D rules out falsification, and 1E warns against illegal actions. “Everyone does it” is not an exception.",
          "If a payer audit pulled this chart, what would the record show about who got what kind of treatment?",
          ["Your minutes reach 91 percent. A resident’s chart shows 40 minutes of individual therapy for a session when you were also treating two others."], { inc: { bent: 1 } }),
        opt("mid", "Do not log it as individual, but move every hip fracture to group to hit the number.", ["4B", "3D", "4C"], ["Beneficence", "Nonmaleficence"],
          "Your billing stays honest, which matters. But choosing treatment type to reach a productivity number puts the number ahead of the person. 4B asks for a plan specific to each person’s needs, and 3D rules out unrealistic productivity expectations that compromise well-being.",
          "Which residents would lose the most if they were moved to group?",
          ["Groups fill. Two residents who needed individual transfer training are not getting it."]),
        opt("mid", "Say nothing in the huddle. Mention it later, privately, to a coworker you trust.", ["1C", "5E", "6C"], ["Justice", "Fidelity"],
          "A trusted colleague is a fair first sounding board, but it does not inform the person who directed this (1C) or resolve anything. 5E asks you to take action to resolve unethical practice, and that usually means raising it through a channel your employer provides.",
          "What channel exists here, and what would it take for you to use it?",
          ["Your coworker agrees it is wrong but says, “I would not say anything.” Nothing changes."])
      ]
    },
    {
      key: "The baseline", topics: ["baseline", "falsify"],
      narrative: () => [
        { note: "Chart review", html: `<p>The clinical reimbursement coordinator, Jo, reviews Mrs. Beck’s admission evaluation. ${q("“You scored her upper body dressing as independent. If we score her as needing assistance, the case-mix and the plan’s approved days look right, and later gains look like real progress. The aides say she was worse on bad days anyway.”")}</p><p>On admission you observed upper body dressing with set-up assistance only. The aides did note that she varies from day to day.</p>`,
          facts: ["Jo asks that Mrs. Beck’s admission dressing score be lowered so approval and later progress “look right.”", "What you observed: upper body dressing with set-up assistance. Aides report day-to-day variation."] }
      ],
      ask: "What do you do with the baseline score?",
      options: [
        opt("ok", "Document her performance as you observed it, including that it varied by day, and keep the score your assessment supports. Tell Jo you cannot adjust a baseline to fit an approval.", ["3C", "3D", "CV:Truth", "1E"], ["Veracity", "Nonmaleficence"],
          "The baseline is the record every later score is measured against. 3C requires it to be accurate, and 3D names falsification as a directive you do not follow. Documenting the variation is accurate too: you can tell the truth about a changing performance without changing the number. Truth asks for forthright, honest action.",
          "How would you document day-to-day variation so that it informs care without moving the baseline?",
          ["Jo accepts the note but says the plan may still deny days. Mrs. Beck’s baseline stays as observed."]),
        opt("bad", "Lower the score one level. The aides saw bad days, so it is defensible.", ["3C", "3D", "CV:Truth", "1E"], ["Veracity", "Nonmaleficence"],
          "You were asked to change what you observed to fit an outcome, and “defensible” is not the same as accurate. 3C and 3D apply directly, and 1E warns against illegal actions. A lowered baseline also makes Mrs. Beck’s later gains look larger than they are.",
          "Whose observation does the new score reflect?",
          ["Score lowered. The plan approves additional days based on the revised baseline."], { inc: { bent: 1 } }),
        opt("mid", "Lower it, but add a note explaining the adjustment.", ["3C", "3D"], ["Veracity", "Nonmaleficence"],
          "A note does not turn a changed score into an accurate one. The score is the record. Explaining the adjustment shows you know it is not what you observed, which is exactly what 3C asks you not to put in the chart.",
          "If the note were removed from a later review, what would the score say?",
          ["Score lowered with a note. The reviewer approves days without reading it."], { inc: { bent: 1 } }),
        opt("mid", "Ask a coworker to redo the evaluation so you are not the one who has to decide.", ["5E", "1G", "3C"], ["Fidelity", "Justice"],
          "Passing the task does not resolve the problem, and it moves your concern onto a colleague who may feel pressured. 5E asks you to take action to resolve unethical practice in others, and 1G asks you to report known unethical or illegal actions to appropriate authorities.",
          "What would your coworker experience when they get this request?",
          ["The coworker re-scores to match Jo’s request and says they did not feel they could refuse."], { inc: { bent: 1 } })
      ]
    },
    {
      key: "The conference", topics: ["equity"],
      narrative: () => [
        { note: "Care conference", html: `<p>You, nursing, and the case manager, Dee, review both hip fracture residents. Their function is similar. Mr. Dunn has a commercial plan with a generous rehabilitation benefit and a wife at home. Mrs. Beck lives alone with six steps to enter and no caregiver, and her plan’s authorization ends in four days.</p><p>Dee proposes: Mr. Dunn continues a skilled stay for three more weeks and then outpatient therapy. Mrs. Beck is discharged home on Friday. ${q("“Recommendations follow the benefit. We do not recommend what will not be paid for.”")}</p>`,
          facts: ["Mr. Dunn and Mrs. Beck have similar function scores.", "Mr. Dunn: commercial plan, generous benefit, wife at home. Mrs. Beck: limited authorization ending in 4 days, lives alone, 6 entry steps, no caregiver.", "Case manager: “Recommendations follow the benefit.”"] }
      ],
      ask: "How do you make your discharge recommendations?",
      options: [
        opt("ok", "Write each recommendation from the resident’s needs, using the same standard for both. Name the benefit gap in Mrs. Beck’s chart, and help her pursue an appeal and community services.", ["CV:Equity", "4B", "4L", "4M", "2C", "CV:Advocacy"], ["Justice", "Beneficence"],
          "Equity asks for fair and just treatment regardless of circumstances. Recommending to the benefit means two residents with similar needs get different advice because of what their plans pay. 4B ties recommendations to needs, 4L asks you to help address barriers to access, and 4M asks you to report systems and policies that unfairly limit access.",
          "If the appeal fails, what is the safest discharge you can still build for a woman who lives alone with six steps?",
          ["Your recommendation for Mrs. Beck is documented from her needs, with the coverage gap noted. An appeal is filed and a community services referral is made."],
          { beyond: "The Code does not decide what a payer must cover. It asks that your recommendation, and your honesty about the gap, not depend on it." }),
        opt("bad", "Follow Dee. A recommendation nobody can fund is not useful.", ["CV:Equity", "4B", "4L", "2C"], ["Justice", "Beneficence"],
          "This lets what a plan pays decide what a person is told they need. Equity and 4B point the other way: the recommendation comes from need, and the funding problem becomes something you help address (4L). A recommendation shaped by coverage also hides the gap from Mrs. Beck.",
          "Would Mr. Dunn’s recommendation change if his plan paid less?",
          ["Mrs. Beck is discharged Friday with a recommendation that does not mention her stairs or her living situation."], { inc: { bent: 1 } }),
        opt("mid", "Tell Mrs. Beck your honest recommendation in person, but write the chart to match the covered discharge.", ["3C", "4E", "CV:Truth"], ["Veracity", "Autonomy"],
          "Telling her honestly is good, and 4E supports it. But the chart then says something different from your clinical judgment, and 3C asks for accurate records. The next clinician and any reviewer will see only the covered version.",
          "Which version of your recommendation will outlast the conversation?",
          ["The chart says home with family support. There is no family support listed in the record."], { inc: { bent: 1 } }),
        opt("mid", "Recommend what each resident needs, then leave the appeal and the coverage issue to the case manager.", ["4B", "4L", "CV:Advocacy"], ["Beneficence", "Justice"],
          "Writing recommendations from need is right. But Advocacy is a Core Value, and 4L asks you to help with barriers to access, not to hand the barrier to someone else. Your clinical letter can be the strongest part of an appeal.",
          "What would you put in a letter that the case manager cannot write?",
          ["The case manager says an appeal is unlikely and does not file one."])
      ]
    },
    {
      key: "The plateau", topics: ["maintenance", "falsify"],
      narrative: () => [
        { note: "Week six", html: `<p>Mr. Dunn is doing well. Mrs. Beck, after a successful appeal for a few more days, has plateaued in lower body dressing and bathing transfers. Her plan now denies further skilled therapy as “maintenance only.”</p><p>You believe skilled occupational therapy is still needed to design a safe routine, train her niece who visits on weekends, and instruct the aides.</p>`,
          facts: ["Mrs. Beck has plateaued in lower body dressing and bathing transfers.", "Plan denied continued skilled therapy as “maintenance only.”", "You believe skilled OT is still needed to design a safe routine and train her niece and the aides."] }
      ],
      ask: "What do you do?",
      options: [
        opt("ok", "Reassess, write a maintenance program, train her niece and the aides, and be truthful with Mrs. Beck about what the plateau means and what comes next. Refer to home health or outpatient services if she needs them.", ["4I", "4J", "4K", "4E", "CV:Truth", "2I"], ["Beneficence", "Veracity", "Nonmaleficence"],
          "4I asks you to reassess and revise the plan, 4J asks you to end services in collaboration with the person when they are no longer beneficial, and 4K asks for referral when needs call for it. Telling Mrs. Beck honestly what a plateau does and does not mean (4E, Truth) and building a transition (2I) is the opposite of walking away.",
          "What would a maintenance program need to include to be safe without you in the room?",
          ["A written program is in place. Her niece and two aides are trained. A home health referral is made."],
          { beyond: "Whether maintenance therapy is covered depends on payer rules and law, and some skilled maintenance services are covered in some settings. The Code does not settle coverage. It asks you to use skilled judgment, be honest, and avoid abandonment." }),
        opt("bad", "Keep documenting small gains so the plan keeps paying for therapy.", ["3C", "3D", "3A", "CV:Truth"], ["Veracity", "Nonmaleficence", "Justice"],
          "Documenting gains you do not see is falsification (3C, 3D), and billing for services that are not delivering the benefit claimed falls short of 3A. It also postpones the honest conversation Mrs. Beck needs about what comes next.",
          "What would Mrs. Beck believe about her recovery if her chart kept recording gains?",
          ["Three more weeks of notes record progress that did not happen."], { inc: { bent: 1 } }),
        opt("mid", "Discharge her with a handout. The plan says maintenance is not covered.", ["4J", "2I", "4K"], ["Beneficence", "Nonmaleficence"],
          "Honesty about coverage matters, but a handout is not a transition. 4J asks you to end services in collaboration with the person, 2I asks you to facilitate an appropriate transition, and 4K asks for referrals. Her niece and the aides still need training she has not received.",
          "Who will apply the handout when she has a bad day?",
          ["Mrs. Beck goes home with a handout and no training for the people who help her."]),
        opt("mid", "Fill her day with group sessions to keep her engaged and the minutes up.", ["4B", "3D", "3A", "CV:Dignity"], ["Beneficence", "Justice"],
          "Engagement is a good aim, but treatment chosen to hit minutes puts the number ahead of the person. 4B asks for a plan specific to her needs, 3D rules out unrealistic productivity expectations, and 3A asks for billing that is commensurate with services delivered.",
          "What is Mrs. Beck getting from the group that she needs?",
          ["Mrs. Beck attends groups that do not address her transfers."])
      ]
    },
    {
      key: "Speaking up", topics: ["whistle"],
      narrative: s => [
        s.v.bent > 0
          ? { note: "Two weeks later", html: `<p>You have gone along with some of what you were asked to do, and now that it worries you, you call the compliance line. HR asks why you waited. In the same week your schedule is cut by eight hours and you are assigned the early groups nobody wants. A coworker whispers, ${q("“This is what happens when you speak up. Management knows who called.”")}</p>` }
          : { note: "Two weeks later", html: `<p>You raised your concerns about billing and baselines with the compliance line. Since then your schedule has been cut by eight hours and you are assigned the early groups nobody wants. A coworker whispers, ${q("“This is what happens when you speak up. Management knows who called.”")}</p>` }
      ],
      ask: "What do you do now?",
      options: [
        opt("ok", "Keep dated records of what you reported and what has changed since. Consult the Code’s reporting standards, an employment attorney or the state agency about retaliation protections, and the AOTA Ethics Commission, and keep reporting through appropriate channels.", ["1G", "5E", "1F", "CV:Prudence"], ["Justice", "Fidelity"],
          "1G asks you to report known unethical or illegal actions to appropriate authorities, and 5E asks you to take action to resolve unethical practice in others. Records, legal advice, and the right channels protect both the report and you. Prudence is the discipline of acting from reason, not from fear or anger.",
          "What would you want in your records if this ended up in front of an investigator?",
          ["You begin a dated log. An employment attorney tells you what to document. You contact the AOTA Ethics Commission for guidance."],
          { beyond: "Legal protection for people who report varies by federal and state law. The Code does not provide legal advice, and the Ethics Commission cannot decide your employment case. Seek counsel for that part." }),
        opt("bad", "Retract your report to protect your hours.", ["1G", "5E", "1F"], ["Justice", "Fidelity"],
          "Fear of retaliation is real, and nobody should dismiss it. But retracting leaves the problem in place and tells the next person what speaking up costs. 1G and 5E ask you to report and take action, and 1F warns against actions that reduce public trust in the profession.",
          "What would retracting change for the residents whose charts you were worried about?",
          ["You withdraw the report. Your hours are not restored."]),
        opt("mid", "Post about the company on social media to put pressure on management.", ["6D", "6C", "6F", "1F"], ["Autonomy", "Fidelity", "Veracity"],
          "Your frustration is understandable. But posting can expose protected information about residents and colleagues (6D, 6C), invite statements that go beyond what you can verify (6F), and shift the matter away from the channels that can act on it. 1F also asks you to avoid reducing public trust.",
          "What could you say publicly that would not put a resident’s information at risk?",
          ["A post draws attention but also a warning from HR about patient privacy."]),
        opt("mid", "Quit quietly and move on without further reporting.", ["1G", "5E"], ["Justice", "Fidelity"],
          "Leaving can be the safest personal choice, and no one can fault you for protecting your livelihood. But 1G asks that known unethical or illegal actions be reported to appropriate authorities, and quitting alone leaves residents and later clinicians exposed. You can leave and still report.",
          "Is there a way to report that does not depend on staying employed there?",
          ["You resign. Nothing further is reported and the practices continue."])
      ]
    }
  ],
  tensions: [
    ["Veracity and Fidelity", "Accurate records against loyalty to an employer that is asking you to shade them. The Code puts accurate documentation first."],
    ["Justice and Equity", "Recommendations from need against recommendations from coverage. Equity asks for the same standard for every person."],
    ["Nonmaleficence and the cost of speaking up", "The harm of staying silent against the personal cost of reporting. The Code asks for action through appropriate channels, and your own prudence in how."]
  ]
},

/* ------------------------------------------------------------------ CASE 4 */
{
  id: "floatpool",
  title: "The Float Pool",
  setting: "Inpatient rehabilitation",
  blurb: "A PRN pool fills the schedule with therapists whose skills nobody has checked, therapy continues after goals are met, a staffing report asks you to round up, and a license record does not add up.",
  you: "Jamie Okoro, OTR/L, the lead occupational therapist on a 40-bed inpatient rehabilitation unit",
  stages: [
    {
      key: "The assignment", topics: ["prn", "competency"],
      narrative: () => [
        { say: "You are Jamie Okoro, OTR/L, lead occupational therapist on a 40-bed inpatient rehabilitation unit in a health system with a PRN pool. This case follows staffing, competency, and credentialing questions in one unit over a few months." },
        { note: "Monday morning", html: `<p>The scheduler assigns a PRN occupational therapist, Dev, to a newly admitted patient with a C6 spinal cord injury who needs specialized seating, transfers, and upper extremity strategies. Dev has been licensed three months and has worked mostly in outpatient orthopedics.</p><p>You ask if they are comfortable with it. Dev says, ${q("“Sure, I’ll figure it out.”")}</p>`,
          facts: ["PRN OT Dev (licensed 3 months, mostly outpatient orthopedics) assigned to a patient with a new C6 spinal cord injury.", "Dev: “Sure, I’ll figure it out.”"] }
      ],
      ask: "As the lead, what do you do?",
      options: [
        opt("ok", "Ask Dev privately about their experience with this population, arrange a consult or co-treat, and tell the manager that PRN assignments need a skills match.", ["4H", "5F", "6K", "2A", "5C"], ["Beneficence", "Fidelity"],
          "Licensure shows that Dev can practice, not that Dev is competent with this patient. 4H asks each practitioner to work within their own competence, 5F asks that duties match experience and competencies, and 5C asks for steps like supervision and training when standards are unclear. Asking privately and then raising the system gap (6K) keeps the patient safe and Dev supported.",
          "What would you want Dev to be able to say to you without feeling it counts against them?",
          ["Dev says they have never done a seating evaluation. You arrange a co-treat for the first three sessions. The manager agrees to review PRN assignments."],
          { beyond: "The Code does not prescribe how an employer verifies skills for a given assignment. It asks you and the people who delegate to match the person to the task." }),
        opt("bad", "Let Dev handle it. Dev said they are fine and the scheduler knows the pool.", ["4H", "5F", "2A"], ["Beneficence", "Nonmaleficence"],
          "A reassurance is not a skills check. 4H and 5F ask that services be within a practitioner’s competence and that duties match their experience, and 2A warns against actions that risk physical harm. A new spinal cord injury has real risks with unsafe transfers and seating.",
          "What is the worst thing that could happen in the first transfer, and who would have been in the room?",
          ["Dev attempts a transfer without the right technique and the patient has a near-fall. Nobody is hurt."]),
        opt("mid", "Take the patient yourself and say nothing about the assignment.", ["5F", "6K", "2H"], ["Beneficence", "Fidelity"],
          "You protected the patient, and that matters. But Dev is not told why, and the scheduler learns nothing, so the same mismatch will be repeated next week. 6K and 2H ask you to work on the workplace conflicts that put access to competent services at risk.",
          "What will the scheduler do next Monday if no one tells them?",
          ["The patient is safe. The next PRN mismatch happens the following week."]),
        opt("mid", "Tell Dev in front of the team that they are not qualified, and reassign the patient.", ["6K", "6J", "5E"], ["Fidelity"],
          "Protecting the patient is right, but doing it publicly treats a colleague with less respect and fairness than Fidelity asks, and 6J asks you to avoid hostile or intimidating communication. It also makes Dev less likely to tell you next time they are out of their depth.",
          "How would you want a mismatch like this to be raised with you?",
          ["The patient is reassigned. Dev is quiet for the rest of the shift and avoids you."])
      ]
    },
    {
      key: "Goals met", topics: ["goalsmet"],
      narrative: () => [
        { note: "Chart review", html: `<p>Mr. Tran, 58, stroke, met his occupational therapy goals five days ago on your reassessment. Dev, who is also covering him, has kept seeing him daily for 45 minutes “for carryover.” His family has not been told that discharge or a step-down is possible.</p><p>Dev says, ${q("“PRN shifts are only guaranteed if I have patients.”")}</p>`,
          facts: ["Mr. Tran’s goals were met 5 days ago on your reassessment.", "Dev still sees him daily, 45 minutes, “for carryover.” Visits are billed.", "His family has not been told about discharge or step-down."] }
      ],
      ask: "What do you do?",
      options: [
        opt("ok", "Review his goals with Mr. Tran and his family, plan discharge or a step-down together, and correct the billing for visits that were not skilled or necessary. Coach Dev on documenting medical necessity.", ["4J", "4I", "3A", "3C", "2B"], ["Beneficence", "Justice", "Veracity"],
          "4J asks you to end services in collaboration with the person when they are no longer beneficial, and 4I asks for timely reassessment. Billing visits that were not necessary falls short of 3A and 3C, so correcting it is part of the fix. Doing it with Mr. Tran and his family (2B) respects them, and coaching Dev treats the problem as one of knowledge and pressure, not character.",
          "What would you say to Dev about why their hours should not depend on keeping a patient longer than he needs?",
          ["Mr. Tran and his family agree on a discharge plan with a home program. The extra visits are reviewed with compliance. Dev says they did not realize the billing issue."]),
        opt("bad", "Leave it. More therapy never hurts him.", ["4J", "3A", "1I"], ["Beneficence", "Justice", "Nonmaleficence"],
          "Continued therapy has costs for Mr. Tran, in time, fatigue, and delayed return home, and it bills for services that are no longer beneficial (4J, 3A). 1I warns against using resources and relationships to serve your own interest, and a PRN shift tied to a patient list is exactly that pressure.",
          "Whose needs does one more week of daily visits serve?",
          ["Visits continue. Mr. Tran asks when he gets to go home."]),
        opt("mid", "Tell Dev to stop seeing him, with no explanation to Mr. Tran or his family.", ["4J", "2B", "4E"], ["Beneficence", "Autonomy"],
          "Ending unnecessary visits is right, but 4J asks you to do it in collaboration with the person and his family, and 2B and 4E ask for shared decision-making and honest disclosure. Mr. Tran should hear why the schedule changed and what comes next.",
          "What would Mr. Tran think happened if his daily visit just stopped?",
          ["Visits stop. The family asks why and nobody has a clear answer."]),
        opt("mid", "Add a new goal so therapy can continue.", ["4I", "3C", "3D"], ["Beneficence", "Veracity", "Nonmaleficence"],
          "New goals are legitimate when they come from need, which 4I supports. A goal added to justify continuing is documentation shaped to a purpose, which 3C and 3D warn against. The test is whether you would write the goal if there were no billing consequence.",
          "Is there a real need behind the new goal, or only a reason to keep the visits?",
          ["A goal about “advanced carryover” is added. The reviewer flags it."], { inc: { bent: 1 } })
      ]
    },
    {
      key: "The staffing request", topics: ["stewardship", "falsify"],
      narrative: () => [
        { note: "Director’s office", html: `<p>The director, Morales, asks you to submit the unit’s census and acuity for next quarter’s staffing plan. The PRN contract has hours to use or lose, and census is down 15 percent. ${q("“Round the acuity up a bit so the extra coverage is justified. Therapists get their hours, we keep the contract.”")}</p><p>Your own caseloads are manageable.</p>`,
          facts: ["Census down 15%. PRN contract hours are “use it or lose it.”", "Director asks you to round acuity up to justify extra PRN coverage.", "Your caseloads are manageable."] }
      ],
      ask: "How do you answer the director and submit the report?",
      options: [
        opt("ok", "Submit accurate census and acuity, show where coverage is and is not needed, and propose using the hours differently, such as training or a flexible schedule.", ["1D", "1I", "CV:Truth", "3D", "CV:Prudence"], ["Veracity", "Justice"],
          "Accuracy in what you submit is the point (1D, Truth), and 3D warns against directives that involve falsification. 1I warns against exploiting financial or material resources to serve someone’s interest. Offering a use for the hours turns a no into a solution, which is prudence at work.",
          "What would a good use of those hours look like if patient care came first?",
          ["The accurate report goes in. The director agrees to put some hours toward PRN training and cross-coverage."]),
        opt("bad", "Round it up. Your coworkers’ hours depend on it.", ["1D", "1I", "3C", "CV:Truth"], ["Veracity", "Justice", "Nonmaleficence"],
          "A kind motive does not make the figures accurate. 1D calls for transparency in written communications, 3C requires accurate reports of professional activities, and 1I warns against using resources to serve interests other than patient care. Staffing built on rounded acuity also misleads the next person who relies on it.",
          "Who else will rely on these numbers, and what will they decide because of them?",
          ["The inflated report is accepted. Extra PRN hours are approved for a unit that does not need them."], { inc: { bent: 1 } }),
        opt("mid", "Submit accurate numbers and add no context. Let the director decide.", ["1D", "CV:Prudence"], ["Veracity", "Justice"],
          "Accuracy is right, and you did not go along with rounding. But a report with no context may be read as supporting the extra coverage, and 1D asks for transparency, not merely correct numbers. A sentence about where coverage is and is not needed protects the reading of the data.",
          "What one sentence would keep an accurate number from being misread?",
          ["The accurate report goes in. The director uses it to justify the extra coverage anyway."]),
        opt("bad", "Submit a lower census than the real one to push the director to cancel the PRN hours.", ["CV:Truth", "1I", "1J"], ["Veracity", "Fidelity"],
          "Inaccurate figures in either direction break Truth. Using a false number to get a result you prefer also puts your own view of the staffing question ahead of an honest process (1I, 1J).",
          "How is this different from rounding up?",
          ["The report is questioned and you are asked to explain the figures."], { inc: { bent: 1 } })
      ]
    },
    {
      key: "The checklist", topics: ["competency", "prn"],
      narrative: () => [
        { note: "Competency review", html: `<p>The system’s annual competency process is a self-attestation checklist. Dev checked “splinting and hand therapy” and “wheelchair seating.” The outpatient hand clinic has started taking PRN shifts, and Dev signed up because it pays more.</p><p>You overhear Dev quietly asking a technician how to fabricate a thermoplastic splint.</p>`,
          facts: ["Annual competency process is a self-attestation checklist.", "Dev attested to splinting, hand therapy, and wheelchair seating, and signed up for higher-paying hand clinic shifts.", "You overheard Dev asking a technician how to fabricate a splint."] }
      ],
      ask: "What do you do?",
      options: [
        opt("ok", "Talk with Dev privately and supportively first, offer mentoring, and then raise with your manager that self-attestation alone cannot verify competence in specialty areas. If it is not resolved, escalate.", ["5E", "5B", "4H", "5C", "5D", "6K"], ["Beneficence", "Fidelity", "Veracity"],
          "5E asks you to take action to resolve incompetent practice in others, 5B asks that competence be represented accurately, and 4H asks each practitioner to work within their own competence. Starting with Dev and offering mentoring (5D, 5C) is fair and often effective. Raising the process gap with your manager (6K) addresses why the checklist could not catch this.",
          "What would the checklist need to ask to verify competence rather than collect confidence?",
          ["Dev admits they were not sure how to say no to the shifts. They agree to a mentored plan. Your manager agrees to look at validation for specialty areas."],
          { beyond: "The Code does not prescribe how employers verify competence. It asks practitioners to represent their skills accurately and to act when competence is in doubt." }),
        opt("bad", "Ignore it. The company accepted the attestation, so it is their risk.", ["5E", "4H", "2A"], ["Fidelity", "Beneficence", "Nonmaleficence"],
          "The risk is not only the company’s. A patient with a hand injury bears it first. 5E asks you to take action in others’ practice, 4H asks for services within competence, and 2A warns against actions that risk harm.",
          "Who is hurt first if a splint is made wrong?",
          ["Dev makes a splint that causes a pressure area. The patient’s therapy is set back."]),
        opt("mid", "Report Dev to your manager anonymously without speaking to them first.", ["5E", "1G", "6K"], ["Fidelity", "Justice"],
          "Reporting can be right, and 1G asks you to report unethical or illegal actions to appropriate authorities. But when nobody is in immediate danger, going around Dev skips a chance to resolve it fairly and directly, and Fidelity asks for fairness and respect toward colleagues. It also leaves the process gap unaddressed.",
          "What would a direct conversation have told you that an anonymous report cannot?",
          ["Dev is pulled from the shifts with no explanation and does not learn who reported."]),
        opt("mid", "Tell the other therapists to keep Dev away from hand patients.", ["6C", "5E", "6K"], ["Fidelity"],
          "Concern for patients is right, but talking about Dev with peers is gossip, not action. 6C asks you to safeguard private information about colleagues, and 5E asks you to resolve the problem, not route around it. Dev never learns what the concern is.",
          "What does Dev learn about their standing from a workaround?",
          ["Staff quietly avoid assigning Dev. Dev feels shut out and does not know why."])
      ]
    },
    {
      key: "The renewal", topics: ["licensing", "whistle"],
      narrative: () => [
        { note: "Credential review", html: `<p>While pulling files for the competency project, you check the state board’s public lookup for Dev. It shows a disciplinary action from another state. Dev’s renewal attestation in HR’s file says no actions. You do not know what the action was or whether it had to be disclosed.</p><p>A coworker, Robin, says, ${q("“HR hired them. It’s not our job. People who dig get burned.”")}</p>`,
          facts: ["State board public lookup shows a disciplinary action in another state for Dev.", "Dev’s renewal attestation in HR’s file says none.", "You do not know the nature of the action or whether disclosure was required.", "Coworker: “People who dig get burned.”"] }
      ],
      ask: "What do you do?",
      options: [
        opt("ok", "Confirm the facts from official sources, keep it confidential, speak with Dev if appropriate, and report to the proper authority, such as compliance or the board, if the facts show an omission.", ["1G", "5A", "5B", "1F", "6C", "CV:Prudence"], ["Justice", "Veracity", "Fidelity"],
          "1G asks you to report known or potential unethical or illegal actions to appropriate authorities, and 5A and 5B concern keeping credentials and representing them accurately. Verifying first and keeping the matter confidential (6C) protects Dev from rumor and protects you from acting on half the facts. Prudence asks you to reason from what you know.",
          "What would you need to see to move from “I do not know” to “this needs to be reported”?",
          ["The lookup is confirmed. Compliance reviews and takes the matter to the board’s reporting process. Dev is placed on a hold pending review."],
          { beyond: "Whether an omission breaks a board’s reporting rule depends on state law, and the board decides. Your obligation under the Code is to act through proper channels with accurate information, not to judge the outcome." }),
        opt("bad", "Mention it to colleagues so they can protect themselves.", ["6C", "6F", "1F"], ["Fidelity", "Veracity"],
          "Concern is understandable, but spreading it among colleagues is not reporting. 6C asks you to safeguard private information about colleagues, 6F asks you to avoid commenting when you lack knowledge, and 1F warns against reducing the public’s trust. You do not yet know the facts.",
          "What would you want said about you if someone found one line in a public lookup?",
          ["Word spreads. Dev learns about it from a coworker and resigns before anyone reviews it."]),
        opt("mid", "Do nothing. If it matters, the board or HR will find it.", ["1G", "5E", "5A"], ["Justice", "Fidelity"],
          "You may be right that someone else will catch it, but 1G and 5E ask you to act when you have a real concern, and Robin’s warning is not a reason to stay silent. Other people finding it does not release you if you saw it.",
          "If no one else looked, what would happen to patients and to Dev?",
          ["Nothing is reported. Months later a patient complaint prompts a board inquiry."]),
        opt("mid", "Confront Dev in the break room and demand an explanation.", ["6J", "6C", "5E"], ["Fidelity"],
          "Speaking with Dev can be right, but a public demand is hostile and intimidating (6J) and exposes a private matter (6C). A private conversation or a report to the proper authority gives Dev a fair chance to explain and gives you protection.",
          "How would you want to be asked if someone else had found this about you?",
          ["Dev is angry and embarrassed in front of others and refuses to discuss it."])
      ]
    }
  ],
  tensions: [
    ["Beneficence and Fidelity", "Protecting patients from a skills mismatch while treating a newer colleague fairly. Asking before reporting is usually the first step."],
    ["Veracity and Justice", "Honest numbers, honest goals, and accurate credentials against pressure to keep hours, contracts, and shifts."],
    ["Prudence and courage", "Acting on a concern without enough facts is a risk, and so is waiting. The Code asks for verified facts and the proper channel."]
  ]
},

/* ------------------------------------------------------------------ CASE 5 */
{
  id: "fieldwork",
  title: "Fieldwork Friday",
  setting: "Skilled nursing and outpatient",
  blurb: "A Level II student can carry a caseload, a screenshot lands in your inbox, a group is billed as individual, and a student who produces numbers is not ready to pass.",
  you: "Morgan Ellis, OTR/L, a fieldwork educator",
  stages: [
    {
      key: "The student", topics: ["fieldwork", "falsify"],
      narrative: () => [
        { say: "You are Morgan Ellis, OTR/L, a fieldwork educator at a skilled nursing and outpatient clinic. This case follows one Level II student, Tasha, through supervision, privacy, billing, and evaluation. Billing rules for services involving students differ by payer and setting, so I will point you to your compliance office rather than assert them." },
        { note: "Week three", html: `<p>Tasha Brooks, a Level II student, is ready for more independence. The manager, Reese, says, ${q("“She can carry six patients. Bill them under your license. Nobody checks, and we’ll hit productivity.”")}</p>`,
          facts: ["Tasha Brooks, Level II fieldwork student, week 3.", "Manager asks that Tasha carry six patients and that all be billed under your license."] }
      ],
      ask: "How do you respond?",
      options: [
        opt("ok", "Supervise Tasha according to AOTA Official Documents, law, and policy. Ask compliance what the payer allows for services involving students, and bill and document only what the rules permit, showing Tasha’s role honestly.", ["5G", "5F", "3B", "3C", "1A", "1C"], ["Justice", "Beneficence", "Veracity"],
          "5G asks you to provide appropriate supervision in line with AOTA Official Documents and relevant laws and policies, and 5F asks you to match duties to what the student is ready for. 3B and 3C tie billing and documentation to the rules and to the truth about who did what. Informing Reese of the requirements that apply (1C) is part of the job.",
          "How would you show Tasha’s role in the note without overstating or hiding it?",
          ["Compliance confirms what can be billed when a student is involved. Reese is unhappy with the numbers but accepts it. Tasha sees how supervision and billing connect."],
          { beyond: "Rules for billing services involving students differ by payer and setting and change over time. The Code asks you to follow them. It does not list them." }),
        opt("bad", "Let Tasha treat independently and bill all of it under your name. Reese said it is fine.", ["5G", "3C", "3D", "3A", "1E"], ["Justice", "Veracity", "Nonmaleficence"],
          "Reese’s approval does not make it correct. 5G requires supervision that meets Official Documents and law, 3C and 3A require accurate records and billing commensurate with services delivered, 3D rules out directives involving falsification, and 1E warns against illegal actions. A student alone with patients also risks harm.",
          "If an auditor interviewed the patients, who would they say treated them?",
          ["Tasha treats six patients with you doing paperwork. All are billed under your license."], { inc: { bent: 1 } }),
        opt("mid", "Tell Reese you will not take students again.", ["1C", "5G", "5F"], ["Justice", "Beneficence"],
          "Declining protects you from the billing problem but does not solve it for the next educator or student. 1C asks you to inform your employer of the requirements, and a refusal with no explanation does not do that. The next student will arrive with the same expectations.",
          "What would help Reese understand the requirement rather than only feel blocked?",
          ["Reese finds a different educator who does not ask questions."]),
        opt("mid", "Supervise Tasha closely but do not ask compliance about billing. Assume it is fine.", ["3B", "1A", "5G"], ["Justice"],
          "Close supervision is right (5G). But 3B and 1A ask you to make sure reimbursement documentation meets the law and rules, and assumptions are not verification. Checking with compliance takes one email and protects everyone.",
          "What would one email to compliance say, and what would you do with the answer?",
          ["Supervision is solid. The billing question remains open for months."])
      ]
    },
    {
      key: "The group chat", topics: ["hipaa"],
      narrative: () => [
        { note: "Friday evening", html: `<p>A classmate of Tasha’s forwards you a screenshot from the student cohort’s group chat. Tasha posted a phone photo of a wound and wrote about “Mr. Hale in room 12 who yells all the time.” The unit whiteboard is visible behind the patient.</p>`,
          facts: ["A screenshot from a student group chat shows a phone photo of a wound and a patient referred to by name and room.", "The unit whiteboard is visible in the photo."] }
      ],
      ask: "What do you do?",
      options: [
        opt("ok", "Tell Tasha promptly, have the post removed, and report to the facility’s privacy officer under policy. Treat it as a teaching case through the academic program, without humiliating her.", ["6A", "6D", "1G", "5H", "6C"], ["Autonomy", "Justice", "Veracity", "Fidelity"],
          "6A asks you to maintain confidentiality in line with privacy laws, and 6D asks for discretion on social media, including not posting protected health information. 1G asks you to report potential violations to the appropriate authority, which here is your privacy officer. Fair and timely handling of the student’s conduct (5H) keeps her accountable without public shaming.",
          "How would you explain to Tasha what happened in a way she can learn from?",
          ["The post is removed within the hour. The privacy officer opens a review. Tasha is shaken and says she did not think of the whiteboard."],
          { beyond: "Whether this is a reportable breach is a legal and policy question for the privacy officer, not a conclusion you reach alone." }),
        opt("bad", "Ask Tasha to delete the post and say nothing. She is a student and it is over.", ["6A", "1G", "6D"], ["Autonomy", "Justice"],
          "Deleting the post does not undo the disclosure, and the privacy officer cannot assess it if nobody tells them. 6A and 1G call for reporting to the appropriate authority. Keeping it quiet protects Tasha in the short term and leaves the facility and the patient exposed.",
          "How many people saw the post before it was removed, and who would know?",
          ["The post is deleted. Weeks later a classmate’s screenshot resurfaces and the facility learns about it from an outside complaint."]),
        opt("mid", "Report it directly to Tasha’s school and leave the facility out of it.", ["1G", "6A", "5H"], ["Justice", "Autonomy"],
          "Telling the school is reasonable and part of your role as educator. But the facility holds the patient’s information, and 6A and 1G point to its privacy officer. Reporting only to the school leaves the patient’s disclosure unaddressed.",
          "Who is responsible for the patient’s information, the school or the facility?",
          ["The school opens a conduct review. The facility never hears about it."]),
        opt("mid", "Confront Tasha in front of the team to make an example of her.", ["6J", "5H", "6A"], ["Fidelity", "Veracity"],
          "The privacy concern is real, but a public confrontation is hostile and intimidating (6J) and is not the fair, respectful handling 5H asks for. It also does not replace a report to the privacy officer, which 6A and 1G call for.",
          "What would Tasha learn about asking for help the next time she is unsure?",
          ["Tasha is humiliated and becomes withdrawn. The privacy officer still has not been told."])
      ]
    },
    {
      key: "The group", topics: ["groupbilling", "productivity", "fieldwork"],
      narrative: () => [
        { note: "Afternoon schedule", html: `<p>Reese wants Tasha to run an afternoon group of eight residents for 45 minutes. ${q("“Log 15-minute individual units for all eight. The same therapist is in the room anyway.”")}</p><p>Tasha asks you quietly, ${q("“Is that allowed?”")}</p>`,
          facts: ["Reese asks that an 8-resident, 45-minute group run by Tasha be logged as 15-minute individual units for each resident.", "Tasha asked you privately whether that is allowed."] }
      ],
      ask: "What do you do?",
      options: [
        opt("ok", "Classify the session as group using your payer’s definitions, document it as delivered, and use the moment to teach Tasha how documentation and billing work. Raise Reese’s request with compliance.", ["3C", "3B", "3A", "3D", "5G", "1C"], ["Veracity", "Justice", "Nonmaleficence"],
          "The record has to say what happened (3C), the billing has to follow the rules (3B, 3A), and 3D names falsified documentation and inaccurate coding as directives you do not follow. Teaching Tasha as it happens is part of supervision (5G). Raising Reese’s request with compliance (1C) puts the question where it can be answered.",
          "What would you tell Tasha about why your answer is the same whether or not anyone is watching?",
          ["The group is documented as a group. Compliance tells Reese the request cannot be done. Tasha says she did not know any of this."],
          { beyond: "Definitions of individual, concurrent, and group treatment differ by payer. The Code expects you to know the ones that apply and follow them." }),
        opt("bad", "Log individual units for all eight. Tasha asked, but you tell her this is how it works here.", ["3C", "3D", "3A", "5G", "1E"], ["Veracity", "Nonmaleficence", "Justice"],
          "You would be falsifying the record and modeling it for a student who is learning what professional practice looks like (5G). 3C, 3A, and 3D all apply, and 1E warns against illegal actions. “This is how it works here” is the sentence students remember.",
          "What does Tasha now believe about what a note is for?",
          ["Eight individual units are logged. Tasha says nothing, but her expression changes."], { inc: { bent: 1 } }),
        opt("mid", "Log it correctly, then cancel the group so it does not come up again.", ["3C", "4B", "5G"], ["Veracity", "Beneficence"],
          "Your record is honest, which matters. But cancelling a group that the residents benefit from, to avoid a conversation, trades care for convenience, and 4B asks that plans reflect needs. Teaching Tasha how to run and document the group is a better use of the moment.",
          "Which residents lose something if the group is gone?",
          ["The group is cancelled. Two residents who enjoyed it are left without it."]),
        opt("mid", "Tell Tasha not to worry about billing. It is not her job.", ["5G", "3C", "5F"], ["Justice", "Veracity"],
          "Tasha’s question is a good one, and brushing it aside misses the teaching moment. 5G asks you to supervise in a way that prepares students, and documentation and billing are part of practice. Telling her it is not her job also leaves the question unanswered.",
          "If Tasha asked again in six months, what would you want her to know?",
          ["Tasha goes along with it and later cannot explain how her sessions were billed."])
      ]
    },
    {
      key: "The evaluation", topics: ["fieldwork"],
      narrative: s => [
        { note: "Week nine", html: `<p>Tasha’s clinical reasoning and documentation are below midterm expectations. She has also been very useful to the clinic’s numbers. You gave feedback verbally but never wrote it down.</p><p>Reese says, ${q("“Pass her. We need the student pipeline, and she’s carrying numbers.”")}</p>${s.v.bent > 0 ? "<p>You also know the chart entries from earlier in the placement do not all reflect what happened.</p>" : ""}`,
          facts: ["Tasha’s reasoning and documentation are below midterm expectations.", "Feedback has been verbal only. Nothing is in writing.", "Reese asks you to pass her because she contributes to productivity."] }
      ],
      ask: "How do you complete her evaluation?",
      options: [
        opt("ok", "Give honest, specific, timely feedback in writing, contact the academic fieldwork coordinator about a learning plan, and evaluate on her performance, not on the clinic’s needs.", ["5H", "5G", "CV:Truth", "2B"], ["Veracity", "Justice"],
          "5H asks you to be honest, fair, accurate, respectful, and timely about student performance, and Truth applies to what you tell the school and the student. Writing it down and working with the academic coordinator (5G) is how a student gets a real chance to improve, and a pass that is earned means more than one that is given.",
          "What specific, observable behaviors would you put in writing for her?",
          ["You write a clear summary, meet with Tasha, and call the academic coordinator. A learning plan is set with checkpoints."]),
        opt("bad", "Pass her. The pipeline matters, and she can improve on the job.", ["5H", "5G", "CV:Truth"], ["Veracity", "Justice"],
          "Passing someone who has not met expectations misrepresents her readiness to the school, the next employer, and the patients she will treat. 5H asks for honest, accurate reporting of student performance, and 5G asks for supervision in line with the program’s requirements.",
          "Who is relying on the pass to mean she is ready?",
          ["Tasha passes. A year later her new employer asks you for a reference."]),
        opt("mid", "Fail her without further discussion to avoid any risk.", ["5H", "5G", "2B"], ["Veracity", "Fidelity"],
          "A failing grade can be the right outcome, but 5H asks for fair, respectful, and timely reporting, and 5G asks for supervision that gives a student what she needs to improve. A failure with no written feedback or learning plan is not fair to her or to the program.",
          "What would she need to see in writing to understand why?",
          ["Tasha is surprised, and the academic program asks why there was no earlier written feedback."]),
        opt("mid", "Give a vague “meets expectations” with no details.", ["5H", "CV:Truth", "5G"], ["Veracity", "Justice"],
          "A vague rating avoids the conflict but does not give an honest picture. 5H asks for fact-based, accurate reporting, and Truth asks you to be forthright. Specific feedback is also the kindest thing you can do for a student who can still improve.",
          "What would a reader of this evaluation learn about Tasha’s actual skills?",
          ["Tasha passes with no clear picture of what to work on."])
      ]
    }
  ],
  tensions: [
    ["Justice and Fidelity", "Honest supervision and billing against an employer’s expectations. 5G, 1C, and 3C point toward telling the truth about who did what."],
    ["Autonomy and Fidelity", "A patient’s privacy against a student’s learning curve. Handling it fairly and promptly serves both."],
    ["Veracity", "Every stage turned on telling the truth in a record, a report, or an evaluation, and on whether the people relying on it would be misled."]
  ]
}

];

if (typeof module === "object" && module.exports) module.exports = { CASES, TOPICS };
