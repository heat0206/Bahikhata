const { GoogleGenAI } = require('@google/genai');
const Application = require('../models/Application');

// ── Status Enum ─────────────────────────────────────
const VALID_STATUSES = ['Applied', 'Hackathon', 'Interview', 'OA', 'Offer', 'Rejected', 'Withdrawn'];

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

// ── Regex-safe escaping ─────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Tool Definitions for Gemini ─────────────────────
const tools = [
  {
    functionDeclarations: [
      {
        name: 'add_application',
        description: 'Add a new job/internship application to the tracker. Use when the user says they applied somewhere, submitted an application, etc.',
        parameters: {
          type: 'object',
          properties: {
            company: {
              type: 'string',
              description: 'The company name the user applied to',
            },
            role: {
              type: 'string',
              description: 'The role/position applied for (e.g. "Software Engineer Intern", "Summer Analyst"). Optional.',
            },
            status: {
              type: 'string',
              description: 'Application status. Must be one of: Applied, Hackathon, Interview, OA, Offer, Rejected, Withdrawn. Defaults to "Applied" if not mentioned.',
              enum: VALID_STATUSES,
            },
            appliedOn: {
              type: 'string',
              description: 'Date the user applied, in YYYY-MM-DD format. Defaults to today if not mentioned.',
            },
          },
          required: ['company'],
        },
      },
      {
        name: 'update_status',
        description: 'Update the status of an existing application. Use when the user says to move/change/update a company status.',
        parameters: {
          type: 'object',
          properties: {
            company: {
              type: 'string',
              description: 'The company name to update',
            },
            newStatus: {
              type: 'string',
              description: 'The new status. Must be one of: Applied, Hackathon, Interview, OA, Offer, Rejected, Withdrawn.',
              enum: VALID_STATUSES,
            },
          },
          required: ['company', 'newStatus'],
        },
      },
      {
        name: 'remove_application',
        description: 'Remove/delete an application from the tracker. Use when the user says to remove, delete, or drop a company.',
        parameters: {
          type: 'object',
          properties: {
            company: {
              type: 'string',
              description: 'The company name to remove',
            },
          },
          required: ['company'],
        },
      },
    ],
  },
];

// ── Tool Handlers ───────────────────────────────────
async function handleAddApplication(args) {
  const today = new Date().toISOString().split('T')[0];
  const status = args.status || 'Applied';

  // Validate status enum
  if (!isValidStatus(status)) {
    return {
      reply: `I couldn't add that — "${status}" isn't a valid status. Please use one of: ${VALID_STATUSES.join(', ')}.`,
      refreshNeeded: false,
    };
  }

  const doc = await Application.create({
    companyName: args.company,
    role: args.role || '',
    status,
    appliedOn: args.appliedOn || today,
  });

  return {
    reply: `Added **${doc.companyName}**${doc.role ? ` — ${doc.role}` : ''} with status **${doc.status}**. Applied on ${doc.appliedOn}.`,
    action: 'added',
    refreshNeeded: true,
  };
}

async function handleUpdateStatus(args) {
  const { company, newStatus } = args;

  // Validate status enum
  if (!isValidStatus(newStatus)) {
    return {
      reply: `"${newStatus}" isn't a valid status. Please use one of: ${VALID_STATUSES.join(', ')}.`,
      refreshNeeded: false,
    };
  }

  // Case-insensitive match with escaped regex
  const escaped = escapeRegex(company);
  const matches = await Application.find({
    companyName: { $regex: escaped, $options: 'i' },
  });

  if (matches.length === 0) {
    return {
      reply: `I couldn't find any application for "${company}". Check the company name and try again.`,
      refreshNeeded: false,
    };
  }

  if (matches.length > 1) {
    const list = matches.map((m) => `• ${m.companyName} — ${m.role || 'no role'}`).join('\n');
    return {
      reply: `I found ${matches.length} entries matching "${company}":\n${list}\n\nPlease be more specific — which one should I update?`,
      refreshNeeded: false,
    };
  }

  const doc = matches[0];
  doc.status = newStatus;
  await doc.save();

  return {
    reply: `Updated **${doc.companyName}**${doc.role ? ` (${doc.role})` : ''} → status is now **${newStatus}**.`,
    action: 'updated',
    refreshNeeded: true,
  };
}

async function handleRemoveApplication(args) {
  const { company } = args;
  const escaped = escapeRegex(company);
  const matches = await Application.find({
    companyName: { $regex: escaped, $options: 'i' },
  });

  if (matches.length === 0) {
    return {
      reply: `I couldn't find any application for "${company}". Check the company name and try again.`,
      refreshNeeded: false,
    };
  }

  if (matches.length > 1) {
    const list = matches.map((m) => `• ${m.companyName} — ${m.role || 'no role'}`).join('\n');
    return {
      reply: `I found ${matches.length} entries matching "${company}":\n${list}\n\nPlease be more specific — which one should I remove?`,
      refreshNeeded: false,
    };
  }

  // Don't delete yet — return a confirmation prompt with the _id
  const doc = matches[0];
  return {
    reply: `Remove **${doc.companyName}**${doc.role ? ` — ${doc.role}` : ''}? Reply **yes** to confirm or **no** to cancel.`,
    pendingAction: {
      type: 'delete',
      id: doc._id.toString(),
      companyName: doc.companyName,
      role: doc.role || '',
    },
    refreshNeeded: false,
  };
}

// ── Pending Action Handlers ─────────────────────────
async function handlePendingDelete(message, pendingAction) {
  const answer = message.trim().toLowerCase();

  if (answer === 'yes' || answer === 'y') {
    const doc = await Application.findByIdAndDelete(pendingAction.id);
    if (!doc) {
      return {
        reply: `That application was already removed or couldn't be found.`,
        refreshNeeded: true,
      };
    }
    return {
      reply: `Removed **${pendingAction.companyName}**${pendingAction.role ? ` — ${pendingAction.role}` : ''}.`,
      action: 'deleted',
      refreshNeeded: true,
    };
  }

  return {
    reply: `Okay, cancelled. **${pendingAction.companyName}** stays in your tracker.`,
    refreshNeeded: false,
  };
}

// ── Main Handler ────────────────────────────────────
const handleMessage = async (req, res) => {
  const { message, pendingAction } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      reply: 'Please send a message.',
      refreshNeeded: false,
    });
  }

  // Handle pending delete confirmation
  if (pendingAction && pendingAction.type === 'delete') {
    try {
      const result = await handlePendingDelete(message, pendingAction);
      return res.json(result);
    } catch (error) {
      console.error('Chatbot pending action error:', error);
      return res.status(500).json({
        reply: 'Something went wrong while processing your confirmation. Please try again.',
        refreshNeeded: false,
      });
    }
  }

  // Call Gemini API with function calling
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        reply: 'The Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.',
        refreshNeeded: false,
      });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        tools,
        systemInstruction: `You are PrepBoard Assistant, a helpful chatbot for managing job and internship applications. You can add new applications, update their status, and remove them. When the user tells you about an application action, use the appropriate tool. If the user's message is conversational or you're not sure what action to take, respond with helpful text. Be concise and friendly. Status options are: Applied, Hackathon, Interview, OA, Offer, Rejected, Withdrawn. If the user says a status that's close but not exact (like "Interviewing" instead of "Interview"), use the closest valid status.`,
      },
    });

    // Check if Gemini returned a function call
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const functionCallPart = parts.find((p) => p.functionCall);

    if (functionCallPart) {
      const { name, args } = functionCallPart.functionCall;
      let result;

      switch (name) {
        case 'add_application':
          result = await handleAddApplication(args);
          break;
        case 'update_status':
          result = await handleUpdateStatus(args);
          break;
        case 'remove_application':
          result = await handleRemoveApplication(args);
          break;
        default:
          result = {
            reply: `I received an unknown action: "${name}". I can add, update, or remove applications.`,
            refreshNeeded: false,
          };
      }

      return res.json(result);
    }

    // No function call — return plain text reply
    const textPart = parts.find((p) => p.text);
    const reply = textPart?.text || "I'm not sure what to do with that. Try something like \"I applied to Google for SDE Intern\" or \"Move Amazon to Interview\".";

    return res.json({
      reply,
      refreshNeeded: false,
    });
  } catch (error) {
    console.error('Gemini API error:', error.message || error);

    // Rate limit / quota exceeded
    const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota');
    if (isRateLimit) {
      return res.status(429).json({
        reply: 'Gemini API rate limit reached — your free tier quota may be exhausted. Wait a minute and try again, or check your billing at ai.google.dev.',
        refreshNeeded: false,
      });
    }

    // Auth / invalid key
    const isAuthError = error.status === 401 || error.status === 403 || error.message?.includes('API_KEY_INVALID');
    if (isAuthError) {
      return res.status(401).json({
        reply: 'Your Gemini API key appears to be invalid. Please check the GEMINI_API_KEY in your .env file.',
        refreshNeeded: false,
      });
    }

    // Network errors
    const isNetworkError = error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message?.includes('fetch');
    const userMessage = isNetworkError
      ? 'Could not reach the Gemini API. Please check your internet connection and try again.'
      : 'Something went wrong while processing your message. Please try again in a moment.';

    return res.status(502).json({
      reply: userMessage,
      refreshNeeded: false,
    });
  }
};

module.exports = { handleMessage };
