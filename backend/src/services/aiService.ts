import Anthropic from '@anthropic-ai/sdk';

type AIAction = 'explain' | 'debug' | 'optimize' | 'convert' | 'chat';
type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript';

interface CodeContext {
  language: SupportedLanguage;
  code: string;
  error?: string;
}

interface CodeSuggestion {
  type: 'fix' | 'optimization' | 'alternative';
  description: string;
  code: string;
  lineRange?: { start: number; end: number };
}

const USE_MOCK = !process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your-claude-api-key-here';

const anthropic = USE_MOCK ? null : new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || ''
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export class AIService {
  async assistWithCode(
    query: string,
    codeContext: CodeContext,
    action: AIAction
  ): Promise<{ response: string; suggestions: CodeSuggestion[] }> {
    // Use mock service if no API key is configured
    if (USE_MOCK) {
      console.log(`Using mock AI service for ${action} (${codeContext.language})`);
      return this.mockAssistWithCode(query, codeContext, action);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(action);
      const userPrompt = this.buildUserPrompt(query, codeContext, action);

      console.log(`Calling Claude API: ${action} for ${codeContext.language}`);

      const response = await anthropic!.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';
      const suggestions = this.extractCodeSuggestions(aiResponse, action);

      logger.info('Claude API response received', { 
        action, 
        responseLength: aiResponse.length,
        suggestionsCount: suggestions.length
      });

      return {
        response: aiResponse,
        suggestions
      };

    } catch (error: any) {
      logger.error('AI service error', { error: error.message, action });
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  private mockAssistWithCode(
    query: string,
    codeContext: CodeContext,
    action: AIAction
  ): { response: string; suggestions: CodeSuggestion[] } {
    const mockResponses: Record<AIAction, string> = {
      explain: `# Code Explanation

This ${codeContext.language} code performs the following operations:

1. **Main Logic**: The code you've written contains the core functionality for your program.
2. **Execution Flow**: It follows a sequential execution pattern.
3. **Key Components**: Variables, functions, and control structures work together to achieve the desired outcome.

**Note**: This is a mock AI response. To get real AI-powered assistance, please configure your Claude API key in the backend .env file.

\`\`\`${codeContext.language}
${codeContext.code || '// Your code here'}
\`\`\`

The code structure looks good! Consider adding error handling and input validation for production use.`,

      debug: `# Debug Analysis

I've analyzed your code and found potential issues:

**Possible Issues:**
1. Check for null/undefined values
2. Verify variable initialization
3. Ensure proper error handling
4. Validate input parameters

**Suggested Fix:**
\`\`\`${codeContext.language}
// Add error handling
try {
${codeContext.code ? codeContext.code.split('\n').map(line => '  ' + line).join('\n') : '  // Your code here'}
} catch (error) {
  console.error('Error:', error);
}
\`\`\`

**Note**: This is a mock AI response. Configure Claude API key for real debugging assistance.`,

      optimize: `# Code Optimization Suggestions

Here are some optimization recommendations:

**Performance Improvements:**
1. Use efficient data structures
2. Minimize nested loops
3. Cache repeated calculations
4. Use built-in functions when available

**Optimized Version:**
\`\`\`${codeContext.language}
${codeContext.code || '// Your optimized code here'}
\`\`\`

**Additional Tips:**
- Profile your code to identify bottlenecks
- Consider algorithmic complexity (Big O notation)
- Use appropriate design patterns

**Note**: This is a mock AI response. Configure Claude API key for detailed optimization analysis.`,

      convert: `# Language Conversion

Converting your code to another language:

**Original (${codeContext.language}):**
\`\`\`${codeContext.language}
${codeContext.code || '// Original code'}
\`\`\`

**Converted Version:**
\`\`\`javascript
// Converted code would appear here
// Configure Claude API key for accurate language conversion
\`\`\`

**Note**: This is a mock AI response. Real language conversion requires Claude API key configuration.`,

      chat: `# AI Assistant Response

Thank you for your question: "${query}"

I'm here to help with your coding questions! However, I'm currently running in mock mode.

**To get real AI assistance:**
1. Sign up for Claude API at https://console.anthropic.com/
2. Get your API key
3. Add it to backend/.env: \`CLAUDE_API_KEY=your-key-here\`
4. Restart the backend server

**In the meantime:**
- I can still execute your code
- You can save and manage projects
- The XP system is fully functional
- All other features work normally

Feel free to explore the platform!`
    };

    const response = mockResponses[action] || mockResponses.chat;
    const suggestions = this.extractCodeSuggestions(response, action);

    return { response, suggestions };
  }

  private buildSystemPrompt(action: AIAction): string {
    const prompts: Record<AIAction, string> = {
      explain: 'You are a helpful coding assistant. Explain code clearly and concisely, breaking down complex concepts into simple terms. Focus on what the code does and how it works.',
      debug: 'You are an expert debugger. Analyze the code and error messages to identify bugs. Provide clear explanations of what went wrong and how to fix it. Include corrected code snippets.',
      optimize: 'You are a code optimization expert. Analyze the code for performance improvements, better algorithms, and cleaner patterns. Suggest specific optimizations with explanations.',
      convert: 'You are a multi-language coding expert. Convert code accurately between programming languages while maintaining functionality and following best practices for the target language.',
      chat: 'You are a friendly coding mentor. Answer programming questions, provide guidance, and help users learn. Be encouraging and educational.'
    };

    return prompts[action] || prompts.chat;
  }

  private buildUserPrompt(query: string, codeContext: CodeContext, action: AIAction): string {
    let prompt = `Language: ${codeContext.language}\n\n`;
    
    if (codeContext.code) {
      prompt += `Code:\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\`\n\n`;
    }

    if (codeContext.error) {
      prompt += `Error:\n${codeContext.error}\n\n`;
    }

    if (codeContext.lineNumber) {
      prompt += `Line number: ${codeContext.lineNumber}\n\n`;
    }

    prompt += `User request: ${query}`;

    return prompt;
  }

  private extractCodeSuggestions(response: string, action: AIAction): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];

    // Extract code blocks from markdown
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      const code = match[1].trim();
      
      let type: 'fix' | 'optimization' | 'alternative' = 'alternative';
      if (action === 'debug') type = 'fix';
      else if (action === 'optimize') type = 'optimization';

      suggestions.push({
        type,
        description: `Suggestion ${index + 1}`,
        code
      });

      index++;
    }

    return suggestions;
  }
}

export const aiService = new AIService();
