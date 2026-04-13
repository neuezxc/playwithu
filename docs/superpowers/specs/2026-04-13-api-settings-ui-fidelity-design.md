# API Settings UI Fidelity Redesign

## Purpose
The API Settings modal currently uses a generic dark-mode UI with bright neon green accents (`green-400`, `green-500`) and solid backgrounds (`#121212`). The goal is to perfectly align its aesthetic with the premium, cohesive design found on the main chat page (e.g., `SuperInput.jsx`), utilizing specific hex codes, glassmorphism, and subtle borders. 

## UI Design System Mapping
We will replace all generic utility classes in `ApiSettingsModal.jsx` with the exact system tokens defined actively out in the chat interface.

1. **Backgrounds & Modal Housing**
   - Overlay Backdrop: Change from `bg-black/80 backdrop-blur-sm` to `bg-black/80 backdrop-blur-md` (slightly more intense blur).
   - Modal Container: Change from `bg-[#121212]` to `bg-[#212121]/95`.
   - Modals Borders: Change from `border-white/10` to `border-[#282828]`.

2. **Typography & Text Iteration**
   - Primary Text (Headers, Output): Change from `text-white` to `text-[#E4E4E4]`.
   - Secondary Text (Labels, Disclaimers): Change from `text-gray-400/500` to `text-[#CDCDCD]` or `#A2A2A2` depending on hierarchical weight.

3. **Interactive Elements (Inputs, Dropdowns)**
   - Inputs: Standardize to `bg-transparent border border-[#454545] rounded-xl px-4 py-3 text-[#E4E4E4] placeholder:text-[#A2A2A2]`.
   - Focus States: Replace `focus:border-green-500/50 focus:ring-green-500/50` with elegant `focus:border-[#3A9E49] focus:ring-1 focus:ring-[#3A9E49]`.
   - Dropdown backgrounds: `bg-[#212121]` with `border-[#282828]` to map above the main modal safely.

4. **Interactive Accents (Buttons, Sliders, Active Tabs)**
   - Buttons (Primary): Remove `bg-green-500 text-black`. Use `bg-[#3A9E49]/30 border border-[#3A9E49] text-white hover:bg-[#3A9E49]/50 transition-colors`.
   - Sliders (`type="range"`): The custom WebKit thumbs should be mapped from `bg-green-500` to `bg-[#3A9E49]`, and track backgrounds from `bg-[#2a2a2a]` to `bg-[#282828]`.
   - Active Tab Indicators: Swap explicit `text-green-400` and `bg-green-400` borders with `text-[#3A9E49]` and `bg-[#3A9E49]`.

## Scope
This is purely a cosmetic, UI/UX rebuild targeted only at the `ApiSettingsModal.jsx`. 
It will not touch the Zustand stores or alter the actual API fetching business logic we just implemented.

## Verification
- Input fields remain perfectly usable without glaring contract issues.
- The `Test Connection` success/error states still visibly pop without breaking the aesthetic harmony. `success` will use an ultra-thin `#3A9E49` border with `/10` opacity backgrounds, and `error` generic reds can be softened to `#e57373` equivalently.
