import type { PromptStructure, EnhancementResult, AnalysisResult } from '../types.js';

export function enhancePrompt(rawPrompt: string): EnhancementResult {
  const analysis = analyzePrompt(rawPrompt);
  const structure = inferStructure(rawPrompt, analysis);
  const enhanced = formatEnhancedPrompt(structure);
  
  return {
    enhanced,
    metadata: {
      originalLength: rawPrompt.length,
      enhancedLength: enhanced.length,
      sectionsInferred: Object.keys(structure).filter(key => structure[key as keyof PromptStructure].trim().length > 0)
    }
  };
}

function analyzePrompt(prompt: string): AnalysisResult {
  const lowerPrompt = prompt.toLowerCase();
  
  const hasStructure = /###|##|\*\*[A-Z]+\*\*|ROLE:|TASK:|CONTEXT:/i.test(prompt);
  
  const detectedSections: string[] = [];
  if (/role:/i.test(prompt)) detectedSections.push('role');
  if (/task:/i.test(prompt)) detectedSections.push('task');
  if (/context:/i.test(prompt)) detectedSections.push('context');
  if (/constraint/i.test(prompt)) detectedSections.push('constraints');
  if (/output|format/i.test(prompt)) detectedSections.push('outputFormat');
  
  const taskType = detectTaskType(lowerPrompt);
  const domainLevel = detectDomainLevel(prompt);
  
  return {
    hasStructure,
    detectedSections,
    taskType,
    domainLevel
  };
}

function detectTaskType(lowerPrompt: string): 'decision-making' | 'informational' | 'implementation' | 'analysis' {
  if (/\b(write|create|build|implement|code|develop|generate)\b/.test(lowerPrompt)) {
    return 'implementation';
  }
  if (/\b(should|best|recommend|choose|decide|which)\b/.test(lowerPrompt)) {
    return 'decision-making';
  }
  if (/\b(analyze|evaluate|compare|assess|review|critique)\b/.test(lowerPrompt)) {
    return 'analysis';
  }
  if (/\b(what|why|how|explain|describe|tell me)\b/.test(lowerPrompt)) {
    return 'informational';
  }
  return 'informational';
}

function detectDomainLevel(prompt: string): 'beginner' | 'intermediate' | 'expert' {
  const technicalTerms = /\b(architecture|distributed|scalability|optimization|algorithm|complexity|refactor|design pattern|microservice|kubernetes|redis|kafka|postgresql)\b/i;
  const basicTerms = /\b(simple|basic|beginner|learn|how to|getting started|tutorial|introduction)\b/i;
  
  if (basicTerms.test(prompt)) return 'beginner';
  if (technicalTerms.test(prompt)) return 'expert';
  return 'intermediate';
}

function inferStructure(rawPrompt: string, analysis: AnalysisResult): PromptStructure {
  const role = inferRole(rawPrompt, analysis);
  const task = inferTask(rawPrompt, analysis);
  const context = inferContext(rawPrompt, analysis);
  const constraints = inferConstraints(rawPrompt, analysis);
  const outputFormat = inferOutputFormat(rawPrompt, analysis);
  const qualityBar = inferQualityBar(analysis);
  
  return {
    role,
    task,
    context,
    constraints,
    outputFormat,
    qualityBar
  };
}

function inferRole(prompt: string, analysis: AnalysisResult): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('function') || lowerPrompt.includes('code') || lowerPrompt.includes('program')) {
    const language = extractLanguage(prompt);
    if (language) {
      return `You are an expert ${language} developer with deep knowledge of best practices, design patterns, and production-ready code standards.`;
    }
    return 'You are an experienced software engineer specializing in writing clean, maintainable, and production-ready code.';
  }
  
  if (lowerPrompt.includes('architecture') || lowerPrompt.includes('system design')) {
    return 'You are a senior systems architect with expertise in distributed systems, scalability, and enterprise architecture patterns.';
  }
  
  if (lowerPrompt.includes('database') || lowerPrompt.includes('sql') || lowerPrompt.includes('data model')) {
    return 'You are a database expert with extensive experience in data modeling, query optimization, and database architecture.';
  }
  
  if (lowerPrompt.includes('api') || lowerPrompt.includes('rest') || lowerPrompt.includes('graphql')) {
    return 'You are an API design specialist with expertise in RESTful services, API architecture, and integration patterns.';
  }
  
  if (lowerPrompt.includes('security') || lowerPrompt.includes('authentication') || lowerPrompt.includes('authorization')) {
    return 'You are a security engineer with deep knowledge of authentication, authorization, and secure application development.';
  }
  
  if (lowerPrompt.includes('performance') || lowerPrompt.includes('optimization') || lowerPrompt.includes('speed')) {
    return 'You are a performance optimization specialist with expertise in profiling, benchmarking, and system optimization.';
  }
  
  if (lowerPrompt.includes('test') || lowerPrompt.includes('testing')) {
    return 'You are a test engineering expert specializing in test-driven development, automated testing, and quality assurance.';
  }
  
  if (analysis.taskType === 'decision-making') {
    return 'You are a technical consultant with broad expertise in software engineering, architecture, and technology evaluation.';
  }
  
  return 'You are a knowledgeable technical expert with deep understanding of software development principles and best practices.';
}

function extractLanguage(prompt: string): string | null {
  const languages: Record<string, RegExp> = {
    'TypeScript': /\btypescript\b/i,
    'JavaScript': /\bjavascript\b|\bjs\b/i,
    'Python': /\bpython\b/i,
    'Java': /\bjava\b/i,
    'Go': /\bgolang\b|\bgo\b/i,
    'Rust': /\brust\b/i,
    'C++': /\bc\+\+\b/i,
    'C#': /\bc#\b/i,
    'Ruby': /\bruby\b/i,
    'PHP': /\bphp\b/i,
    'Swift': /\bswift\b/i,
    'Kotlin': /\bkotlin\b/i
  };
  
  for (const [lang, regex] of Object.entries(languages)) {
    if (regex.test(prompt)) {
      return lang;
    }
  }
  
  return null;
}

function inferTask(prompt: string, analysis: AnalysisResult): string {
  const cleanedPrompt = prompt
    .replace(/^(please|can you|could you|i need to|i want to|help me)\s+/i, '')
    .trim();
  
  const firstSentence = cleanedPrompt.split(/[.!?]\s/)[0];
  
  if (analysis.taskType === 'implementation') {
    const match = cleanedPrompt.match(/\b(write|create|build|implement|develop|generate)\s+(.+?)(?:\.|$)/i);
    if (match) {
      const taskDesc = match[0].trim();
      return taskDesc.charAt(0).toUpperCase() + taskDesc.slice(1) + (taskDesc.endsWith('.') ? '' : '.');
    }
  }
  
  if (analysis.taskType === 'decision-making') {
    const questionMatch = cleanedPrompt.match(/\b(what|which|should|best|recommend).+?\?/i);
    if (questionMatch) {
      const question = questionMatch[0].replace(/\?$/, '');
      return `Evaluate and recommend the best approach for: ${question}.`;
    }
  }
  
  if (analysis.taskType === 'analysis') {
    return `Analyze and evaluate ${firstSentence.toLowerCase()}.`;
  }
  
  const finalTask = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  return finalTask.endsWith('.') || finalTask.endsWith('?') ? finalTask : finalTask + '.';
}

function inferContext(prompt: string, analysis: AnalysisResult): string {
  const contextParts: string[] = [];
  
  if (analysis.taskType === 'implementation') {
    contextParts.push('This solution is intended for production use where code quality, maintainability, and reliability are important.');
  }
  
  if (prompt.toLowerCase().includes('user') || prompt.toLowerCase().includes('customer')) {
    contextParts.push('The implementation should consider user experience and handle edge cases gracefully.');
  }
  
  if (prompt.toLowerCase().includes('real-time') || prompt.toLowerCase().includes('performance')) {
    contextParts.push('Performance and efficiency are critical considerations.');
  }
  
  if (prompt.toLowerCase().includes('scale') || prompt.toLowerCase().includes('distributed')) {
    contextParts.push('The solution must be designed to scale and handle high volumes.');
  }
  
  if (prompt.toLowerCase().includes('security') || prompt.toLowerCase().includes('auth')) {
    contextParts.push('Security best practices and proper error handling are essential.');
  }
  
  const domainContext = extractDomainContext(prompt);
  if (domainContext) {
    contextParts.push(domainContext);
  }
  
  if (contextParts.length === 0) {
    contextParts.push('Standard software engineering best practices and principles should be followed.');
  }
  
  return contextParts.join(' ');
}

function extractDomainContext(prompt: string): string | null {
  if (/\bemail\b/i.test(prompt)) {
    return 'Email validation/handling must follow industry standards (RFC 5322 where applicable) while remaining practical for real-world use.';
  }
  
  if (/\bnotification\b/i.test(prompt)) {
    return 'Notification systems require reliable message delivery, low latency, and proper handling of delivery failures.';
  }
  
  if (/\bapi\b/i.test(prompt)) {
    return 'APIs should follow RESTful principles, include proper error handling, and provide clear documentation.';
  }
  
  if (/\bdatabase\b/i.test(prompt)) {
    return 'Database operations should be optimized for performance, maintain data integrity, and follow normalization principles where appropriate.';
  }
  
  return null;
}

function inferConstraints(prompt: string, analysis: AnalysisResult): string {
  const constraints: string[] = [];
  
  if (prompt.toLowerCase().includes('no external') || prompt.toLowerCase().includes('no dependencies')) {
    constraints.push('No external libraries or dependencies');
  }
  
  if (prompt.toLowerCase().includes('synchronous') || prompt.toLowerCase().includes('sync')) {
    constraints.push('Synchronous implementation required');
  } else if (prompt.toLowerCase().includes('async') || prompt.toLowerCase().includes('asynchronous')) {
    constraints.push('Asynchronous implementation required');
  }
  
  if (analysis.taskType === 'implementation') {
    constraints.push('Code must be production-ready with proper error handling');
    constraints.push('Include type safety and input validation');
    constraints.push('Follow language-specific best practices and conventions');
  }
  
  if (prompt.toLowerCase().includes('test')) {
    constraints.push('Include comprehensive test cases');
  }
  
  if (prompt.toLowerCase().includes('comment') || analysis.domainLevel === 'beginner') {
    constraints.push('Include clear explanatory comments');
  }
  
  if (analysis.taskType === 'decision-making' || analysis.taskType === 'analysis') {
    constraints.push('Base recommendations on proven, production-tested approaches');
    constraints.push('Consider practical implementation constraints (time, team size, budget)');
  }
  
  if (constraints.length === 0) {
    constraints.push('Follow industry best practices');
    constraints.push('Ensure clarity and maintainability');
  }
  
  return constraints.map(c => `- ${c}`).join('\n');
}

function inferOutputFormat(prompt: string, analysis: AnalysisResult): string {
  const formats: string[] = [];
  
  if (analysis.taskType === 'implementation') {
    formats.push('Complete, runnable code with proper structure');
    
    if (prompt.toLowerCase().includes('function')) {
      formats.push('Function signature with type annotations or JSDoc');
      formats.push('Implementation with clear logic flow');
      formats.push('Usage examples or test cases demonstrating functionality');
    } else {
      formats.push('Well-structured implementation with clear entry points');
      formats.push('Supporting documentation or usage examples');
    }
  } else if (analysis.taskType === 'decision-making') {
    formats.push('Clear recommendation with supporting rationale');
    formats.push('Comparison of viable alternatives (if applicable)');
    formats.push('Tradeoff analysis (pros/cons or comparison table)');
    formats.push('Specific technology/approach names (not generic categories)');
  } else if (analysis.taskType === 'analysis') {
    formats.push('Structured analysis with clear sections');
    formats.push('Key findings and insights');
    formats.push('Supporting evidence or examples');
    formats.push('Actionable conclusions');
  } else {
    formats.push('Clear, well-organized explanation');
    formats.push('Relevant examples demonstrating concepts');
    formats.push('Practical takeaways or next steps');
  }
  
  return formats.map((f, i) => `${i + 1}. ${f}`).join('\n');
}

function inferQualityBar(analysis: AnalysisResult): string {
  const qualities: string[] = [];
  
  if (analysis.taskType === 'implementation') {
    qualities.push('Production-ready code that can be deployed with confidence');
    qualities.push('Handles edge cases and error conditions gracefully');
    qualities.push('Well-documented and easy to understand');
    qualities.push('Follows established design patterns and conventions');
    qualities.push('Efficient and performant for typical use cases');
  } else if (analysis.taskType === 'decision-making') {
    qualities.push('Technically sound and proven at scale');
    qualities.push('Practical and implementable with realistic constraints');
    qualities.push('Includes specific, actionable recommendations');
    qualities.push('Acknowledges tradeoffs explicitly');
    qualities.push('Considers long-term maintenance and scalability');
  } else if (analysis.taskType === 'analysis') {
    qualities.push('Accurate and well-researched');
    qualities.push('Provides actionable insights');
    qualities.push('Considers multiple perspectives');
    qualities.push('Includes concrete examples');
  } else {
    qualities.push('Clear and accurate information');
    qualities.push('Appropriate level of detail for the context');
    qualities.push('Practical and actionable');
    qualities.push('Well-organized and easy to follow');
  }
  
  return qualities.map(q => `- ${q}`).join('\n');
}

function formatEnhancedPrompt(structure: PromptStructure): string {
  return `### ROLE
${structure.role}

### TASK
${structure.task}

### CONTEXT
${structure.context}

### CONSTRAINTS
${structure.constraints}

### OUTPUT FORMAT
${structure.outputFormat}

### QUALITY BAR
${structure.qualityBar}`;
}
