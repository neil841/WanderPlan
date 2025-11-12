# shadcn Component Workflow Integration

> **How to Use shadcn Components in the Agentic Development System**

---

## Quick Reference

### ✅ **What WAS Done**

1. **Registry Cleanup**: Removed 6 invalid placeholder registries from `components.json`
2. **Component Analysis**: Identified all 54+ shadcn components needed across all 6 phases
3. **Requirements Document**: Created comprehensive `.claude/specs/shadcn-component-requirements.md`
4. **Component Mapping**: Mapped every UI task to specific shadcn components

### ⏳ **What You Need to Do**

1. **Install Phase 2 components** (run the command below)
2. **Use the workflow** when implementing UI features
3. **Call the right agents** at the right time

---

## Installation Commands by Phase

### **Phase 2 (Current) - Install Now**

```bash
npx shadcn@latest add card badge skeleton input select button pagination toggle-group avatar dialog form textarea calendar popover command label tabs dropdown-menu separator tooltip alert-dialog
```

### **Phase 3 - Install When Ready**

```bash
# shadcn components
npx shadcn@latest add scroll-area radio-group toggle

# External libraries
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
npm install leaflet react-leaflet leaflet.markercluster leaflet-routing-machine
npm install -D @types/leaflet
```

### **Phase 4 - Install When Ready**

```bash
npx shadcn@latest add checkbox progress
npm install socket.io-client
```

### **Phase 5 - Install When Ready**

```bash
npx shadcn@latest add table
```

### **Phase 6 - Install When Ready**

```bash
npx shadcn@latest add spinner
npm install @react-pdf/renderer
```

---

## Agentic Workflow

### **When to Use Each Agent**

#### **1. shadcn-requirements-analyzer** (You just used this!)

**Use when**:
- Starting a new UI feature
- Unsure which components are needed
- Need to break down complex UI requirements

**Example**:
```bash
/agents:shadcn-requirements-analyzer
```

**Prompt example**:
> "I need to build the Trip Creation Dialog from Task 2.4. What shadcn components do I need?"

**Output**: Requirements document with component list and hierarchy

---

#### **2. shadcn-component-researcher**

**Use when**:
- Need to understand how a specific shadcn component works
- Want to see examples and usage patterns
- Need installation commands

**Example**:
```bash
/agents:shadcn-component-researcher
```

**Prompt example**:
> "How do I use the shadcn `command` component for autocomplete with an API?"

**Output**: Component details, examples, installation command

---

#### **3. shadcn-implementation-builder**

**Use when**:
- Ready to actually build the UI component
- Have requirements and know which components to use
- Need production-ready TypeScript implementation

**Example**:
```bash
/agents:shadcn-implementation-builder
```

**Prompt example**:
> "Build the CreateTripDialog component using the requirements from `.claude/specs/shadcn-component-requirements.md` Task 2.4"

**Output**: Complete TypeScript component code

---

### **Typical Workflow for a UI Task**

```
Task: "Build Trip Creation Dialog" (Task 2.4)

Step 1: Analyze Requirements
├── Run: /agents:shadcn-requirements-analyzer
├── Input: "Analyze Task 2.4 from implementation-tasks.md"
└── Output: Component requirements document

Step 2: Research Components (if needed)
├── Run: /agents:shadcn-component-researcher
├── Input: "How to use Command component for destination autocomplete?"
└── Output: Component documentation and examples

Step 3: Install Components
├── Run: npx shadcn@latest add dialog form input textarea calendar popover command label
└── Verify: Components installed in src/components/ui/

Step 4: Build Implementation
├── Run: /agents:shadcn-implementation-builder
├── Input: "Build CreateTripDialog from requirements"
└── Output: Complete component code

Step 5: Validate
├── Run: npm run dev
├── Test: Chrome DevTools validation
└── Fix: Any issues found
```

---

## Integration with Staff Engineer Agent

**BEFORE implementing any UI task**, the Staff Engineer agent should:

1. **Read** `.claude/specs/shadcn-component-requirements.md`
2. **Verify** required components are listed for the current task
3. **Check** if components are installed (check `src/components/ui/`)
4. **Install** missing components with `npx shadcn@latest add [components]`
5. **Call** Premium UX Designer agent for UI implementation

**Example in agent handoff**:

```markdown
## [2025-11-10] staff-engineer → premium-ux-designer

### Task
Implement Trip List UI (Task 2.2)

### Prerequisites Completed
✅ Read shadcn-component-requirements.md
✅ Verified components needed: card, badge, skeleton, input, select, button, pagination
✅ Installed missing components: pagination, toggle-group
✅ Components ready in src/components/ui/

### Next Steps for Premium UX Designer
- Build TripListPage component using installed shadcn components
- Follow component hierarchy from requirements doc
- Ensure accessibility (WCAG 2.1 AA)
- Validate with Chrome DevTools
```

---

## Integration with Premium UX Designer Agent

**WHEN building UI components**, the Premium UX Designer agent should:

1. **Read** `.claude/specs/shadcn-component-requirements.md` for the current task
2. **Use ONLY** components listed in requirements (verified to exist)
3. **Follow** component hierarchy specified in requirements
4. **Build custom** components for items in "Custom Components to Build" section
5. **Validate** with Chrome DevTools after implementation

**Example workflow**:

```markdown
Task: Build Trip Creation Dialog (Task 2.4)

1. Read requirements: .claude/specs/shadcn-component-requirements.md
2. Find Task 2.4 section
3. Review component hierarchy
4. Implement CreateTripDialog component:
   ├── Use Dialog (from shadcn)
   ├── Use Form (from shadcn)
   ├── Use Input (from shadcn)
   ├── Use Calendar (from shadcn)
   ├── Use Command (from shadcn) with Nominatim API
   └── Build custom DateRangePicker (extend Calendar)
5. Validate with Chrome DevTools
```

---

## Custom Components Reference

These components are NOT in shadcn and must be custom-built:

| Component | Purpose | Base Component | Build Guide |
|-----------|---------|----------------|-------------|
| **TimePicker** | Time selection | `input` + `popover` | Extend Input with time dropdown |
| **DateRangePicker** | Date range selection | `calendar` | Modify Calendar for range mode |
| **DraggableEventCard** | Drag-drop events | `card` + `@dnd-kit` | Wrap Card with dnd-kit |
| **LocationAutocomplete** | Place search | `command` + Nominatim API | Integrate Command with API |
| **CurrencyInput** | Currency amounts | `input` + formatting | Extend Input with currency mask |

**When building custom components**:
- Always use Premium UX Designer agent
- Base on existing shadcn components when possible
- Follow shadcn styling patterns (Tailwind, CSS variables)
- Include TypeScript types
- Add accessibility features (WCAG 2.1 AA)

---

## Component Installation Verification

**Before using a component**, verify it's installed:

```bash
# Check if component exists
ls src/components/ui/dialog.tsx

# Or check all installed components
ls src/components/ui/
```

**If component is missing**:

```bash
# Install single component
npx shadcn@latest add dialog

# Install multiple components
npx shadcn@latest add dialog form input
```

---

## Troubleshooting

### **Problem**: Component not found

**Solution**:
1. Check `.claude/specs/shadcn-component-requirements.md` - is it listed?
2. If yes: Install with `npx shadcn@latest add [component]`
3. If no: Call shadcn-requirements-analyzer to verify if it exists

---

### **Problem**: Component doesn't work as expected

**Solution**:
1. Call shadcn-component-researcher for usage examples
2. Check official docs: https://ui.shadcn.com/docs/components/[component]
3. Review demo code with `mcp__shadcn__get_component_demo`

---

### **Problem**: Need component that doesn't exist in shadcn

**Solution**:
1. Check "Custom Components to Build" section in requirements doc
2. Use Premium UX Designer agent to build custom component
3. Base it on existing shadcn components when possible

---

### **Problem**: Registries not working

**Solution**:
- **Only use `@shadcn` registry** - this is the only verified registry
- Other registries (aceternity, 8bitcn) were removed due to uncertainty
- Do not add custom travel registries - they don't exist

---

## Quick Command Reference

### **Analyze UI Requirements**
```bash
/agents:shadcn-requirements-analyzer
```

### **Research Component**
```bash
/agents:shadcn-component-researcher
```

### **Build UI Implementation**
```bash
/agents:shadcn-implementation-builder
```

### **Install Components**
```bash
# Phase 2 (current)
npx shadcn@latest add card badge skeleton input select button pagination toggle-group avatar dialog form textarea calendar popover command label tabs dropdown-menu separator tooltip alert-dialog
```

---

## Best Practices

1. **Always check requirements first** - Don't guess which components to use
2. **Install before implementing** - Verify components exist before coding
3. **Use the right agent** - Analyzer → Researcher → Builder workflow
4. **Follow component hierarchy** - Requirements doc shows proper structure
5. **Build custom when needed** - Don't try to force-fit wrong components
6. **Validate with Chrome DevTools** - Every UI change must be tested

---

## Summary

**You now have**:
✅ Clean `components.json` with only valid registry
✅ Comprehensive component requirements document
✅ Phase-by-phase installation commands
✅ Clear agent workflow for UI development
✅ Reference guide for custom components

**Next steps**:
1. Install Phase 2 components (run command above)
2. Use workflow when implementing UI tasks
3. Reference `.claude/specs/shadcn-component-requirements.md` for all UI work

**Ready to build! 🚀**
