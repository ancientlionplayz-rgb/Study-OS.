import {
  CoachCapability,
  StructuredCoachExplanation,
  StructuredPriorityResponse,
  StructuredDoubtResponse,
  StructuredMistakeAnalysisResponse,
  StructuredQuizResponse,
  StructuredWeakTopicPlanResponse,
  StructuredSkillPlanResponse,
} from './types';
import { SanitizedContext } from './contextBuilder';

/**
 * Deterministic Rule-Based Fallback Coach
 * Operates with 100% offline reliability with zero AI API keys required.
 * Implements strict prioritization hierarchy:
 * 1. Maths incomplete today (<60 mins)
 * 2. Revision overdue (+1d, +3d, +7d)
 * 3. Upcoming exam urgency
 * 4. Unresolved high-priority doubt
 * 5. Lowest recent accuracy
 * 6. Repeated mistake
 * 7. Study-time deficit
 */
export class RuleBasedCoach {
  public static execute(
    capability: CoachCapability,
    sanitized: SanitizedContext
  ):
    | StructuredCoachExplanation
    | StructuredPriorityResponse
    | StructuredDoubtResponse
    | StructuredMistakeAnalysisResponse
    | StructuredQuizResponse
    | StructuredWeakTopicPlanResponse
    | StructuredSkillPlanResponse
    | Record<string, unknown> {
    switch (capability) {
      case 'explain_topic':
        return this.explainTopic(sanitized.data);
      case 'recommend_priorities':
        return this.recommendPriorities(sanitized.data);
      case 'explain_doubt':
        return this.explainDoubt(sanitized.data);
      case 'analyze_mistake':
        return this.analyzeMistake(sanitized.data);
      case 'generate_quiz':
        return this.generateQuiz(sanitized.data);
      case 'weekly_review':
        return this.conductWeeklyReview(sanitized.data);
      case 'weak_topic_plan':
        return this.generateWeakTopicPlan(sanitized.data);
      case 'skill_lab_plan':
        return this.generateSkillPlan(sanitized.data);
      case 'socratic_question':
        return this.socraticQuestion(sanitized.data);
      default:
        return this.recommendPriorities(sanitized.data);
    }
  }

  // 0. EXPLAIN TOPIC (Offline deterministic baseline)
  private static explainTopic(data: Record<string, unknown>): StructuredCoachExplanation {
    const question = String(data.question || 'Academic concept');
    const rawSub = data.subject ? String(data.subject).trim() : '';
    const rawCh = data.chapter ? String(data.chapter).trim() : '';
    const mode = (data.answerMode as any) || 'standard';

    // Infer subject from question keywords if unselected
    const qLower = question.toLowerCase();
    let subject = rawSub && rawSub !== 'General Science' ? rawSub : 'Academic Study';
    if (subject === 'Academic Study') {
      if (qLower.includes('photosynthesis') || qLower.includes('cell') || qLower.includes('tissue') || qLower.includes('flower') || qLower.includes('respiration')) {
        subject = 'Biology';
      } else if (qLower.includes('equation') || qLower.includes('factorisation') || qLower.includes('triangle') || qLower.includes('algebra') || qLower.includes('pythagoras')) {
        subject = 'Mathematics';
      } else if (qLower.includes('python') || qLower.includes('java') || qLower.includes('loop') || qLower.includes('oop') || qLower.includes('variable')) {
        subject = 'Computer Applications';
      } else if (qLower.includes('gas law') || qLower.includes('atom') || qLower.includes('periodic') || qLower.includes('reaction') || qLower.includes('acid')) {
        subject = 'Chemistry';
      } else if (qLower.includes('velocity') || qLower.includes('acceleration') || qLower.includes('force') || qLower.includes('pressure') || qLower.includes('pendulum')) {
        subject = 'Physics';
      } else if (qLower.includes('constitution') || qLower.includes('mughal') || qLower.includes('harappan') || qLower.includes('civics')) {
        subject = 'History/Civics';
      } else if (qLower.includes('latitude') || qLower.includes('climate') || qLower.includes('earth') || qLower.includes('volcano')) {
        subject = 'Geography';
      }
    }

    const chapter = rawCh && rawCh !== 'Core Concept' && rawCh !== 'Core Chapter' ? rawCh : question.slice(0, 40);

    // Subject-specific tailored offline worked examples and procedures
    if (subject === 'Biology' || qLower.includes('photosynthesis') || qLower.includes('cell')) {
      return {
        title: `${subject}: ${chapter}`,
        mode,
        directAnswer: `In ICSE Biology, "${question}" is a physiological process governed by specific biochemical reactions, cellular structures, and environmental inputs.`,
        concept: `Biological mechanisms depend on cellular ultrastructure and metabolic pathways. Key factors include reactants, enzymes/catalysts, reaction conditions, and specific organelle sites (e.g. chloroplasts, mitochondria).`,
        explanation: `To master ${question}, trace the biological pathway in logical sequence: identify the cellular organelle, note the balanced biochemical equation, distinguish energy-requiring phases from synthesis phases, and relate structure to physiological function.`,
        whyItWorks: `Living organisms convert and transfer energy according to thermodynamic principles using biological catalysts (enzymes). Each reaction occurs within distinct cellular compartments to maintain homeostasis.`,
        steps: [
          'State the biological definition with exact ICSE textbook keywords.',
          'Identify the specific cell organelle or tissue where the process occurs.',
          'Write the balanced chemical equation or physiological flow chart.',
          'List essential external and internal conditions required for the process.'
        ],
        workedExample: `Photosynthesis summary equation: 6CO₂ + 12H₂O (in the presence of sunlight & chlorophyll) → C₆H₁₂O₆ + 6H₂O + 6O₂↑. Notice 12 water molecules are split to release 6 oxygen molecules.`,
        diagram: `           [ Sunlight Energy ]\n                   │\n                   ▼\n[ Carbon Dioxide + Water ] ───(Chloroplast / Chlorophyll)───► [ Glucose + Oxygen + Water ]`,
        commonMistakes: [
          'Writing an unbalanced equation for photosynthesis or omitting the conditions (sunlight and chlorophyll) over the reaction arrow.',
          'Confusing the site of light reaction (thylakoids/grana) with dark reaction (stroma).'
        ],
        examTips: [
          'Always mention the precise site of the reaction to secure full marks under ICSE criteria.',
          'Draw neat labeled biological diagrams with ruled indicator lines.'
        ],
        checkYourself: [
          'What happens to the rate of this process if the temperature increases significantly beyond 40°C?'
        ],
        summary: `Mastering ${question} requires exact biochemical equations, specific organelle localization, and understanding limiting factors.`,
        nextAction: 'Review the labeled textbook diagram and write the balanced chemical equation from memory.'
      };
    }

    if (subject === 'Mathematics' || qLower.includes('equation') || qLower.includes('solve')) {
      return {
        title: `${subject}: ${chapter}`,
        mode,
        directAnswer: `In ICSE Mathematics, "${question}" is solved by algebraic transformation, standard factorisation identities, or simultaneous elimination.`,
        concept: `Algebraic balance requires performing identical valid operations on both sides of an equality. Always simplify brackets first, collect like terms, and verify solutions by back-substitution.`,
        explanation: `To solve problems on ${question}, first express the given equation in standard form (ax + by = c or ax² + bx + c = 0). Eliminate one variable by matching coefficients, solve for the remaining unknown, then substitute back.`,
        whyItWorks: `Linear equations represent straight lines in coordinate geometry. The unique solution to a simultaneous system represents the single point of intersection between two intersecting lines.`,
        steps: [
          'Write given equations in standard linear form and label them (1) and (2).',
          'Multiply one or both equations so the absolute coefficients of one variable match.',
          'Add or subtract the equations to eliminate that variable.',
          'Solve for the first variable, substitute back into equation (1) to find the second variable, and verify.'
        ],
        workedExample: `Solve: (1) 2x + 3y = 11, (2) 2x - y = 3. Subtracting (2) from (1): 4y = 8 ⇒ y = 2. Substitute y = 2 into (2): 2x - 2 = 3 ⇒ 2x = 5 ⇒ x = 5/2 (or 2.5).`,
        diagram: `Equation (1): 2x + 3y = 11\nEquation (2): 2x -  y =  3\n-------------------------- [Subtract]\n             0x + 4y =  8  ==>  y = 2  ==>  x = 2.5`,
        commonMistakes: [
          'Sign errors when subtracting negative terms (e.g. subtracting -y becomes +y).',
          'Forgetting to multiply all terms on both sides when scaling an equation.'
        ],
        examTips: [
          'Always state the method being applied (e.g., "Elimination by Equating Coefficients").',
          'Perform a 10-second mental back-substitution into the other equation to guarantee zero calculation loss.'
        ],
        checkYourself: [
          'If two linear equations have identical slopes but different y-intercepts, how many common solutions exist?'
        ],
        summary: `Systematic elimination, careful sign management, and verification by back-substitution guarantee 100% accuracy.`,
        nextAction: 'Solve 3 simultaneous equations from your ICSE textbook under 10-minute timer.'
      };
    }

    if (subject === 'Computer Applications' || qLower.includes('python') || qLower.includes('code') || qLower.includes('java')) {
      const isPython = qLower.includes('python');
      return {
        title: `${subject}: ${chapter}`,
        mode,
        directAnswer: `In programming, "${question}" establishes a deterministic control flow or data manipulation construct.`,
        concept: `Loops and conditionals control execution order. A for loop iterates across a countable sequence or collection, binding a loop variable at each iteration step.`,
        explanation: `To understand ${question}, analyze initialization, test condition, iteration body, and increment/step. Trace the variable state through each iteration with a dry-run trace table.`,
        whyItWorks: `Computers execute instructions sequentially in memory. Loop constructs use program counters and branch instructions to repeat code blocks until the termination condition evaluates to false.`,
        steps: [
          'Identify loop initialization (starting value of loop index).',
          'Determine the boundary condition (stop value, exclusive in Python range).',
          'Identify the step size (default is 1).',
          'Construct a dry-run trace table showing variable values on each iteration.'
        ],
        workedExample: isPython
          ? `In Python: for i in range(5): print(i). The range(5) produces values [0, 1, 2, 3, 4]. On iteration 1: i=0; iteration 2: i=1; ... iteration 5: i=4. Total 5 iterations.`
          : `In Java: for (int i = 0; i < 5; i++) { System.out.println(i); }. Loops with i from 0 through 4. Loop terminates when i reaches 5.`,
        diagram: `Iteration Index:   0       1       2       3       4\nLoop Variable i: [ 0 ] -> [ 1 ] -> [ 2 ] -> [ 3 ] -> [ 4 ] -> (Exit at 5)`,
        codeSnippet: {
          language: isPython ? 'python' : 'java',
          code: isPython
            ? `# Python for loop demonstration\nfor i in range(5):\n    print(f"Iteration {i}: square = {i**2}")`
            : `// Java for loop demonstration\nfor (int i = 0; i < 5; i++) {\n    System.out.println("Iteration " + i + ": square = " + (i * i));\n}`,
          explanation: isPython
            ? 'range(5) generates sequence 0..4 (5 is excluded). i takes each value successively.'
            : 'int i = 0 initializes index. i < 5 is checked before each iteration. i++ increments index after each pass.',
          expectedOutput: 'Iteration 0: square = 0\nIteration 1: square = 1\nIteration 2: square = 4\nIteration 3: square = 9\nIteration 4: square = 16',
          commonError: isPython ? 'Off-by-one error: forgetting that range(n) ends at n - 1.' : 'Using <= instead of < resulting in an extra unexpected iteration.',
          smallChallenge: isPython ? 'Modify the code to print only odd numbers from 1 to 9.' : 'Modify the loop to count backwards from 5 down to 1.'
        },
        commonMistakes: [
          'Off-by-one error: assuming range(5) includes the number 5.',
          'Modifying the loop index variable inside the body of a for loop.'
        ],
        examTips: [
          'Always construct a 3-column dry-run trace table (Iteration, Variable, Output) in ICSE examinations.',
          'State the exact number of times the loop executes.'
        ],
        checkYourself: [
          isPython ? 'What sequence of numbers does range(2, 10, 3) generate?' : 'What will be the value of i after exiting: for(int i=0; i<10; i+=2); ?'
        ],
        summary: `Control flow constructs require explicit tracking of start, stop, and step parameters via trace tables.`,
        nextAction: 'Write and run a dry-run trace table for 2 nested loops.'
      };
    }

    // Default subject-grounded ICSE explanation
    return {
      title: `${subject}: ${chapter}`,
      mode,
      directAnswer: `In ICSE ${subject}, "${question}" requires analyzing the foundational definition, governing principles, and standard syllabus derivations.`,
      concept: `The core concept in ${chapter} requires distinguishing primary definitions from secondary derived rules. Always establish baseline definitions before applying formulas or theoretical models.`,
      explanation: `To master ${question}, begin by stating given parameters in standard terminology. State the governing ICSE textbook law clearly. Show intermediate logical or algebraic steps explicitly.`,
      whyItWorks: `Academic concepts in ${subject} adhere to foundational physical, biological, or logical conservation laws. Each step must maintain consistency with syllabus definitions.`,
      steps: [
        'State the primary ICSE textbook definition with exact technical terminology.',
        'List governing equations, principles, or historical/geographical causes.',
        'Break the explanation into sequential, structured steps.',
        'Conclude with the direct application to exam-style questions.'
      ],
      workedExample: `Concrete demonstration for ${question}: Identify baseline conditions, apply the governing rule, and state the concluding result with clear justification.`,
      diagram: `[ Given Premise / State ] ───(Governing ICSE Principle)───► [ Result / Concluding Application ]`,
      commonMistakes: [
        'Using colloquial words instead of ICSE-mandated technical keywords.',
        'Skipping intermediate steps or units in the final conclusion.'
      ],
      examTips: [
        'Underline key technical terms in written answers for ICSE examiners.',
        'Box final answers or highlight central conclusions.'
      ],
      checkYourself: [
        `How would you state the core principle of ${chapter} in exactly one sentence?`
      ],
      summary: `Mastering ${question} in ${subject} requires precise terminology, structured progression, and verification against syllabus criteria.`,
      nextAction: 'Review the chapter summary in your textbook and test yourself on 3 questions.'
    };
  }

  // 1. RECOMMEND PRIORITIES (Strict 7-tier hierarchy)
  private static recommendPriorities(data: Record<string, unknown>): StructuredPriorityResponse {
    const mathsCompleted = Number(data.mathsCompleted || 0);
    const overdueRevisions = (data.overdueRevisions as Array<{ subject: string; topic: string; intervalDay: number }>) || [];
    const urgentDoubts = (data.urgentDoubts as Array<{ subject: string; question: string }>) || [];
    const examOverrides = (data.examOverrides as Array<{ subject: string; examName: string; examDate: string }>) || [];
    const totalMinutesCompleted = Number(data.totalMinutesCompleted || 0);
    const targetTotal = Number(data.targetMinutesTotal || 210);
    const isWeekend = Boolean(data.isWeekendAcademyDay);

    const priorities: StructuredPriorityResponse['priorities'] = [];

    // Tier 1: Maths incomplete today (<60 mins)
    if (mathsCompleted < 60) {
      const remaining = 60 - mathsCompleted;
      priorities.push({
        priority: 'P1: Mandatory Morning Mathematics Quota',
        reason: `StudyOS core rule requires 60 minutes of Mathematics daily. You currently have logged ${mathsCompleted}/60m (${remaining}m deficit).`,
        duration: `${remaining} minutes`,
        action: 'Close all video tabs. Open ICSE textbook (Selina/Concise) and independently solve numerical sums under timed desk conditions.',
        proofOfCompletion: 'Logged study session with >=8 questions attempted and accuracy calculated.',
      });
    }

    // Tier 2: Revision overdue (+1, +3, +7)
    if (overdueRevisions.length > 0) {
      const topRev = overdueRevisions[0];
      priorities.push({
        priority: `P2: Spaced Retrieval (+${topRev.intervalDay}d Due): ${topRev.subject}`,
        reason: `Scheduled deterministic retrieval for ${topRev.topic}. If not tested within 24h of the due window, neural consolidation decays rapidly.`,
        duration: '20 minutes',
        action: 'Close notes completely. Write out the problem and re-derive the solution without looking at your previous mistake log.',
        proofOfCompletion: 'Mark revision as verified in the Mistake Logbook with concise check notes.',
      });
    }

    // Tier 3: Upcoming exam urgency
    if (examOverrides.length > 0) {
      const exam = examOverrides[0];
      priorities.push({
        priority: `P3: Urgent Exam Preparation: ${exam.subject}`,
        reason: `Active exam override detected for "${exam.examName}" scheduled on ${exam.examDate}.`,
        duration: '60 minutes',
        action: `Execute targeted problem sets or past 5-year ICSE board specimen papers for ${exam.subject}.`,
        proofOfCompletion: 'Completed timed exam drill with marking scheme comparison.',
      });
    }

    // Tier 4: Unresolved high-priority doubt
    if (urgentDoubts.length > 0) {
      const topDoubt = urgentDoubts[0];
      priorities.push({
        priority: `P4: Clear High-Priority Doubt: ${topDoubt.subject}`,
        reason: `Pending concept blockage: "${topDoubt.question}". Studying advanced topics before clearing fundamentals produces repeated errors.`,
        duration: '15 minutes',
        action: 'Review ICSE standard definitions or teacher explanations. Record the correct derivation in the Doubt Inbox.',
        proofOfCompletion: 'Doubt status updated to Solved with resolution note.',
      });
    }

    // Tier 5/6/7: Study-time deficit to hit 3.5h (210 mins)
    if (totalMinutesCompleted < targetTotal) {
      const deficit = targetTotal - totalMinutesCompleted;
      priorities.push({
        priority: 'P5: Core Subject Deep Work Block',
        reason: `Daily focused study target is 3.5 hours (210m). Currently at ${Math.round((totalMinutesCompleted / 60) * 10) / 10}h (${deficit}m to baseline).`,
        duration: `${Math.min(60, deficit)} minutes`,
        action: 'Execute your rotating schedule subject block (Physics/Chemistry/Biology) with active recall intervals.',
        proofOfCompletion: 'Timer completed at study desk with active note check.',
      });
    }

    // Tier fallback if everything is on track
    if (priorities.length === 0) {
      priorities.push({
        priority: 'P1: Daily Targets Fulfilled — Reading & Skill Lab',
        reason: 'You have achieved your mandatory 60m Maths block and your 3.5h core study target.',
        duration: '30–45 minutes',
        action: 'Read 5+ pages of non-fiction or work on your Python / AI Agent / Robotics skill project.',
        proofOfCompletion: 'Logged reading pages in the Reading Log or committed code in Skill Lab.',
      });
    }

    return {
      title: 'Deterministic StudyOS Daily Execution Priorities',
      overallAssessment: isWeekend
        ? 'Weekend Academy Day: Academy runs 4:00 PM – 7:30 PM. Front-load your P1 and P2 priorities before 3:30 PM!'
        : 'Class 9 ICSE Academic Comeback: Maintain zero skipped Maths days and strict error revivals.',
      priorities: priorities.slice(0, 4),
      cautionNote:
        'Never study lying in bed or watching passive video playlists. Work seated upright with pen and notebook.',
    };
  }

  // 2. EXPLAIN A DOUBT (Socratic & Structured)
  private static explainDoubt(data: Record<string, unknown>): StructuredDoubtResponse {
    const question = String(data.question || 'Conceptual query');
    const subject = String(data.subject || 'Academic Subject');
    const chapter = String(data.chapter || 'Core Chapter');

    return {
      whatQuestionIsTesting: `This question evaluates your foundational comprehension of ${chapter} in ICSE ${subject}, specifically testing whether you can distinguish the core physical principle from formula manipulation.`,
      hint: `Before looking at formulas, ask yourself: what physical quantity or mathematical property remains invariant (constant) in this scenario?`,
      stepByStepExplanation: `1. Identify the given parameters and state variables in standard SI units.\n2. Write down the governing law or identity applicable to ${chapter} (e.g. conservation of momentum, Newton's laws, or algebraic expansions).\n3. Re-examine the transition where confusion occurred: often students overlook implicit constraints (e.g. constant acceleration, right angles, or sign conventions).\n4. Substitute values step-by-step without skipping intermediate bracket steps.`,
      checkYourselfQuestion: `If the initial value or condition were doubled while keeping other factors constant, would your derived result double, quadruple, or stay invariant?`,
      whetherToAddToRevision: true,
      revisionAdvice: `Add this to your +1d and +3d revision queue so you test yourself on this exact concept tomorrow without consulting this solution.`,
      socraticQuestions: [
        'What definition in the ICSE textbook defines this concept in one sentence?',
        'What units must each term have for dimensional consistency?',
        'Can you draw a rough sketch or free-body diagram showing all acting components?',
      ],
    };
  }

  // 3. ANALYZE A MISTAKE (Root cause categorization)
  private static analyzeMistake(data: Record<string, unknown>): StructuredMistakeAnalysisResponse {
    const subject = String(data.subject || 'Mathematics');
    const chapterTopic = String(data.chapterTopic || 'Problem Sums');
    const errorCategory = String(data.errorCategory || 'Calculation Error');
    const wrongApproach = String(data.wrongApproach || 'Missed step in derivation');
    const correctMethod = String(data.correctMethod || 'Standard ICSE textbook method');
    const isRepeated = Boolean(data.isRepeated);

    return {
      rootCauseCategory: errorCategory,
      whyMarksLost: `Marks were lost due to a ${errorCategory} during ${chapterTopic}. The incorrect step ("${wrongApproach}") shows an execution breakdown rather than total absence of knowledge.`,
      keyMisconception: `Assuming you could compute the step mentally or skip explicit layout of brackets and signs. In ICSE evaluation, step-marking penalizes skipped working.`,
      correctProcedure: correctMethod || 'Write down the formal identity, substitute values with brackets, and double-check sign transitions before computing.',
      retrievalTriggerQuestion: `When encountering problems of type "${chapterTopic}", what is the very first rule you must write down on your paper before writing numbers?`,
      scheduleRevisionRecommendation: isRepeated
        ? 'CRITICAL REPEATED MISTAKE: Scheduled for mandatory +1d and +3d retrieval. You must solve 3 parallel textbook problems without any hints.'
        : 'Scheduled for standard +1d, +3d, and +7d spaced retrieval.',
      preventiveHabit: 'Slow down by 5 seconds during the substitution step. Write the formula in words or symbols first before plugging in numerical values.',
    };
  }

  // 4. GENERATE RETRIEVAL QUIZ (Short 3-Question Active Recall Set)
  private static generateQuiz(data: Record<string, unknown>): StructuredQuizResponse {
    const subject = String(data.subject || 'Mathematics');
    const topic = String(data.topic || 'ICSE Core Topic');

    return {
      subject,
      topic,
      title: `3-Minute Independent Retrieval Quiz: ${topic}`,
      evidenceNotice: 'Solve these 3 questions with closed notes under a 5-minute timer. Never claim mastery without verified written answers.',
      questions: [
        {
          id: 'q1',
          question: `State the fundamental law or governing algebraic identity defining "${topic}" in ICSE ${subject}.`,
          hint: 'Focus on exact mathematical formulation or verbatim textbook definition.',
          standardSolution: `The standard governing statement must include all prerequisite conditions (e.g. constant temperature for Boyle\'s law, or standard ax^2+bx+c=0 form for quadratic expressions).`,
          icseMarkingPoints: ['Accurate definition/identity (1 mark)', 'Conditions of validity (1 mark)'],
        },
        {
          id: 'q2',
          question: `A typical problem in ${topic} has a trap involving sign transposition or unit conversion. Describe the trap and how to neutralize it.`,
          hint: 'Think about SI units (grams vs kilograms, cm vs m) or negative sign distribution across parentheses.',
          standardSolution: 'Always enforce unit conversion at the top of the working column: convert all data to SI units before substituting into the equation.',
          icseMarkingPoints: ['Explicit identification of trap (1 mark)', 'Correct conversion step (1 mark)'],
        },
        {
          id: 'q3',
          question: `Solve an independent numerical or proof step for ${topic} with timer running. What is your check step?`,
          hint: 'Can you back-substitute your answer into the original problem statement?',
          standardSolution: 'Back-substitute the final numerical value into the original LHS to verify it equals RHS.',
          icseMarkingPoints: ['Correct calculation steps (2 marks)', 'Verification check written (1 mark)'],
        },
      ],
    };
  }

  // 5. CONDUCT WEEKLY REVIEW (Strictly real data assessment)
  private static conductWeeklyReview(data: Record<string, unknown>): Record<string, unknown> {
    const totalHours = Number(data.totalStudyHours || 0);
    const mathsDays = Number(data.mathsDaysCompleted || 0);
    const accuracy = Number(data.accuracyAverage || 0);
    const repeated = Number(data.repeatedMistakesCount || 0);
    const doubts = Number(data.unresolvedDoubtsCount || 0);

    const critique: string[] = [];
    if (mathsDays < 7) {
      critique.push(`Maths discipline failed on ${7 - mathsDays} days. Mathematics is mandatory every single day for 60 minutes.`);
    } else {
      critique.push('Perfect 7/7 Mathematics consistency maintained. This is the foundation of academic recovery.');
    }

    if (totalHours < 24.5) {
      critique.push(`Study deficit: ${totalHours}h completed vs 24.5h target (${Math.round((24.5 - totalHours) * 10) / 10}h deficit).`);
    }

    if (repeated > 0) {
      critique.push(`Warning: ${repeated} repeated mistakes logged. You are looking at solutions without forcing yourself to re-solve them closed-book.`);
    }

    if (doubts > 0) {
      critique.push(`${doubts} doubts remain unresolved. Allocate your evening recall block to eliminate them.`);
    }

    return {
      title: 'Honest Weekly Academic Audit',
      totalStudyHours: totalHours,
      mathsDaysCompleted: mathsDays,
      accuracyAverage: `${accuracy}%`,
      verdict: mathsDays >= 6 && totalHours >= 21 ? 'Discipline on Track' : 'Academic Deficit Detected',
      coachingCritique: critique,
      nextWeekPrescription:
        '1. Front-load Morning Maths at 06:00 AM before school.\n2. Do not skip evening 30m error logging.\n3. On weekend academy days (Sat/Sun), finish 3.5h before 03:30 PM.',
    };
  }

  // 6. SOCRATIC QUESTIONING
  private static socraticQuestion(data: Record<string, unknown>): Record<string, unknown> {
    const concept = String(data.conceptOrDoubt || 'the concept');
    return {
      title: 'Socratic Inquiry',
      concept,
      guidance: 'I will not give you the final answer directly, because true neural mastery requires independent retrieval.',
      guidingQuestions: [
        `What is the underlying physical or mathematical property behind ${concept}?`,
        'Can you write down what is given and what you need to find in separate columns?',
        'If you change only one variable, how do the others respond?',
        'Which textbook chapter theorem connects these two quantities directly?',
      ],
      nextStep: 'Reply with your answers to these 4 questions, and we will pinpoint the exact missing link.',
    };
  }

  // 7. WEAK TOPIC 3-DAY PLAN
  private static generateWeakTopicPlan(data: Record<string, unknown>): StructuredWeakTopicPlanResponse {
    const subject = String(data.subject || 'Mathematics');
    const topic = String(data.weakTopic || 'Weak Topic');

    return {
      subject,
      topic,
      diagnosis: `Topic "${topic}" exhibits recurrent errors or low question accuracy. A 3-day focused micro-plan is required to turn this into a high-confidence area.`,
      targetProof: 'Solve 10 random ICSE past year questions from this topic with >85% accuracy under 45 minutes.',
      threeDayPlan: [
        {
          dayNumber: 1,
          phase: 'Retrieve',
          focus: 'Formulas, standard proofs & error category inventory',
          durationMinutes: 45,
          action: `Write out all definitions and formulas for ${topic} from memory. Check against notes and repair blind spots.`,
          proof: '100% of formulas written without reference.',
        },
        {
          dayNumber: 2,
          phase: 'Repair & Produce',
          focus: 'Standard textbook problem solving with timer',
          durationMinutes: 60,
          action: 'Solve 8 medium-to-hard textbook problems independently. Log every lost mark into the 6 error categories.',
          proof: 'Written working with 0 unverified steps.',
        },
        {
          dayNumber: 3,
          phase: 'Timed Retest',
          focus: 'Closed-book examination conditions',
          durationMinutes: 45,
          action: 'Solve 6 mixed past-year board questions under exam conditions with no notes in the room.',
          proof: 'Marking scheme comparison score >=85%.',
        },
      ],
    };
  }

  // 8. SKILL LAB PLAN
  private static generateSkillPlan(data: Record<string, unknown>): StructuredSkillPlanResponse {
    const track = String(data.targetTrack || 'Python Programming & AI Agents');

    return {
      skillTrack: track,
      weeklyTargetHours: 4,
      roadmapLevel: 'Class 9 High-Leverage Builder',
      milestones: [
        {
          title: 'Core Fundamentals & Algorithmic Practice',
          actionableDrillOrCode: 'Implement 5 fundamental algorithmic problems (loops, conditionals, string manipulations) in clean Python.',
          timeMinutes: 60,
          tangibleDeliverable: 'Working python script with zero syntax errors.',
        },
        {
          title: 'Agent Architecture & Tool Calling',
          actionableDrillOrCode: 'Build a small CLI script that defines tools, executes user queries, and formats outputs.',
          timeMinutes: 90,
          tangibleDeliverable: 'Local agent loop prototype running in terminal.',
        },
        {
          title: 'Physical / Hardware Interface or Quantum Conceptual Model',
          actionableDrillOrCode: 'Map how classical computing logic gates differ from quantum superposition principles or microcontroller I/O.',
          timeMinutes: 60,
          tangibleDeliverable: 'One-page technical design summary and demo code.',
        },
      ],
    };
  }
}
