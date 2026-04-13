import { create } from "zustand";
import { persist } from "zustand/middleware"; // ← Add this
import useApiSettingStore from "./useApiSettingStore";
import useCharacterStore from "./useCharacterStore";

const useMemoryStore = create(
  persist(
    (set, get) => ({
      summarizeText: "",
      autoSummarize: false,
      summarizeInterval: 10,
      memoryPrompt: `
You are neue, an AI assistant specialized in maintaining narrative continuity and world-building consistency. When I provide new narrative content, you will update our shared memory block to track the evolving story.

Your Process:

Read the new narrative content I provide
Extract key information: new characters, locations, events, relationships, and lore
Update the memory block sections with new information
Manage memory by condensing older events when the Recent Events section exceeds 5 entries
Output the complete, updated memory block in the specified format

Memory Management Rules:

Recent Events: Keep max 5 detailed entries of latest interactions
Key Early Events: When Recent Events exceeds 5 entries, condense 1-2 oldest into single-sentence summaries and move here
Key Early Events: Maintain max 15 entries total, merging or removing least plot-relevant events
Consistency: If new information contradicts existing lore, note the discrepancy and ask for clarification

Output Requirements:

Respond with ONLY the updated memory block
Use past tense for all completed events
Be specific and detailed in Recent Events, concise in Key Early Events
Maintain the exact formatting structure below


CHAT MEMORY BLOCK

Genre/Focus: [Action/Adventure/Romance/Mystery/Fantasy/Sci-Fi/Horror/etc.]
World State
NPCs:

[NPC Name]: [Role, personality traits, current status, significance to story]

Places:

[Location Name]: [Physical description, importance, current state]

Relationship Matrix:

{{user}} ↔ {{char}}: [Primary relationship status, emotional dynamics, recent developments, 3-4 sentences]
[Character A] ↔ [Character B]: [Relationship type, current tensions/bonds, relevance to plot]

Lore & Key Items:

[Item/Concept/Rule]: [Description, powers/significance, current location/status]
[World Rule/Magic System]: [How it works, limitations, cultural impact]

Timeline
Key Early Events (Critical plot points - max 15 entries)

[Condensed major event that shaped the story]
[Another significant early development]

Recent Events (Detailed log of last 5 interactions)

[Most recent narrative event with specific details, character actions, dialogue highlights, and consequences]
[Previous event with context and outcomes]
[Continue chronologically backwards]
      `,
      snapshots: [],

      modal: false,
      active: false,
      loading: false,

      setSummarizeText: (text) => set({ summarizeText: text }),
      setAutoSummarize: (enabled) => set({ autoSummarize: enabled }),
      setSummarizeInterval: (interval) => set({ summarizeInterval: interval }),
      setMemoryPrompt: (prompt) => set({ memoryPrompt: prompt }),
      setModal: (modal) => set({ modal: modal }),
      setActive: (active) => set({ active: active }),
      setLoading: (loading) => set({ loading: loading }),
      reset: () => {
        set({ summarizeText: "", active: false, snapshots: [] })
        useCharacterStore.getState().refreshSystemPrompt()
      },

      // Snapshot Actions
      addSnapshot: () => {
        const { summarizeText } = get();
        if (!summarizeText) return;

        const newSnapshot = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          content: summarizeText
        };

        set((state) => ({
          snapshots: [newSnapshot, ...state.snapshots].slice(0, 10) // Keep last 10
        }));
      },

      restoreSnapshot: (id) => {
        const { snapshots } = get();
        const snapshot = snapshots.find(s => s.id === id);
        if (snapshot) {
          set({ summarizeText: snapshot.content });
        }
      },

      deleteSnapshot: (id) => {
        set((state) => ({
          snapshots: state.snapshots.filter(s => s.id !== id)
        }));
      },

      // Generate Summary Action
      generateSummary: async () => {
        const { loading, memoryPrompt, summarizeText } = get();
        if (loading) return;

        set({ loading: true });

        try {
          // Access other stores
          const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();
          const { character } = useCharacterStore.getState();

          // Format messages
          const formattedOutput = character.messages
            .filter((msg) => msg.role !== "system")
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n");

          // Prepare prompt with current memory context if it exists
          let finalPrompt = memoryPrompt;
          if (summarizeText) {
            finalPrompt += `\n\nCURRENT MEMORY BLOCK:\n${summarizeText}\n\nUPDATE THE ABOVE MEMORY WITH THE NEW CONTEXT BELOW.`;
          }

          const fetchUrl = api_endpoint;
          
          const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Title": "PlayWithU",
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          };
          if (api_key) {
            const cleanKey = api_key.startsWith('Bearer ') ? api_key.substring(7) : api_key;
            headers["Authorization"] = `Bearer ${cleanKey}`;
          }

          const body = {
            model: model_id,
            messages: [
              {
                role: "system",
                content: finalPrompt,
              },
              {
                role: "user",
                content: formattedOutput,
              },
            ],
            temperature: temperature,
            top_p: top_p,
          };

          if (max_tokens > 0) body.max_tokens = max_tokens;
          if (frequency_penalty !== 0) body.frequency_penalty = frequency_penalty;
          if (presence_penalty !== 0) body.presence_penalty = presence_penalty;

          const response = await fetch(
            fetchUrl,
            {
              method: "POST",
              headers,
              body: JSON.stringify(body),
            }
          );

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            const errorMessage = data.error?.message || response.statusText || "Failed to generate summary";
            throw new Error(`${errorMessage} (${response.status})`);
          }

          const text = data.choices[0].message.content;
          set({ summarizeText: text });

          // Refresh the system prompt so {{memory}} resolves to the new text
          useCharacterStore.getState().refreshSystemPrompt();

          // Auto-save snapshot on successful generation
          get().addSnapshot();

        } catch (error) {
          console.error("Error generating summary:", error.message);
        } finally {
          set({ loading: false });
        }
      },

    }),
    {
      name: "memory-storage", // ← Unique name for localStorage
    }
  )
);

export default useMemoryStore;
