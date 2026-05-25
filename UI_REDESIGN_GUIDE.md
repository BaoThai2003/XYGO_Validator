# 🎮 Yu-Gi-Oh! Tournament Deck Validator — UI Redesign Guide

## 📋 What's New

Your validator has been completely redesigned with a modern gaming aesthetic, improved UX flow, and full Vietnamese localization!

### ✨ Key Features

#### 1. **Two-Step Validation Flow**

```
Step 1: Enter Team Stats          Step 2: Submit Deck          Step 3: View Results
├─ Wins                           ├─ Deck Input                ├─ Eligible Archetypes
├─ Losses                         ├─ Team Info Panel           ├─ Ineligible Archetypes
└─ Unlocked Archetypes            └─ Format Guide              └─ Deck Statistics
```

#### 2. **Scaling Formula** 📈

When archetypes > 5, win requirements increase:

- **6 archetypes** → +5 wins needed
- **7 archetypes** → +10 wins needed
- **8 archetypes** → +15 wins needed

Formula: `additionalWins = Math.max(0, unlockedArchetypes - 5) * 5`

#### 3. **Archetype Visualization** 🎨

**Eligible (Unlocked):**

- ✓ Bright green glow (#34d399)
- ✓ 100% opacity, high saturation
- ✓ Smooth hover animation
- ✓ "🔓 Mở Khóa" badge

**Ineligible (Locked):**

- ✗ Grayscale filter
- ✗ 35% opacity
- ✗ Slight blur effect
- ✗ Almost disappears

#### 4. **Deck Statistics** 📊

Automatically displays:

- Total archetypes in deck
- Monster / Spell / Trap counts
- Main / Extra / Side deck counts
- Top 5 card types

#### 5. **Vietnamese UI** 🇻🇳

All text translated including:

- Button labels
- Form inputs
- Error messages
- Section titles
- Status indicators

#### 6. **Typography Improvements** 📝

- Headers: +40% larger
- Labels: +30% larger
- Better spacing & hierarchy
- Improved mobile readability

#### 7. **Responsive Design** 📱

- Mobile: Single column, touch-friendly
- Tablet: 2-column layout
- Desktop: Full multi-column grid
- Landscape optimization
- Touch device support

#### 8. **Modern Gaming UI** 🎯

- Dark cyber-fantasy theme
- Neon accent colors
- Glassmorphism effects
- Smooth animations
- Glow effects on hover

---

## 🚀 How to Test

### Desktop Testing

```bash
npm run dev
# Navigate to http://localhost:3003

1. Enter team stats (wins, losses, archetypes)
2. Click "Tiếp Tục Đến Deck" (Proceed to Deck)
3. Paste your YDKE deck link or YDK format
4. Click "Xác Thực Deck" (Validate Deck)
5. Review results with statistics
```

### Mobile Testing

```bash
# Use Chrome DevTools responsive mode
# Test at: 320px, 768px, 1024px

1. Check all three steps display correctly
2. Verify buttons are large enough to tap
3. Test form inputs
4. Verify text readability
```

### Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px
- **Landscape:** max-height 600px

---

## 🎨 Design System

### Color Palette

```
Primary:      #facc15 (Gold/Yellow)
Success:      #34d399 (Bright Green)
Error:        #f87171 (Red)
Info:         #818cf8 (Purple)
Background:   #030810 (Very Dark Blue)
Surface:      rgba(5, 15, 35, 0.95)
Text:         #e2e8f0 (Light Gray)
```

### Typography

- **Font:** Rajdhani (Sans), Space Mono (Mono)
- **Headings:** 700 weight, uppercase
- **Body:** 500 weight, regular case

### Spacing Scale

- 4px, 8px, 12px, 16px, 24px, 32px

### Animations

- Fade-in: 0.6s
- Hover: 0.3s
- Transitions: 0.2-0.3s

---

## 🔧 Code Structure

### Components

```javascript
HomePage()           // Main container
├─ ArchetypeCard    // Individual archetype display
├─ StatCard         // Statistics display
└─ Form Inputs      // Team stats, deck input
```

### State Management

```javascript
// Team Stats
(teamWins, setTeamWins);
(teamLosses, setTeamLosses);
(unlockedArchetypes, setUnlockedArchetypes);

// Flow Control
(step, setStep); // 1, 2, 3

// Deck Input
(deckString, setDeckString);
(loading, setLoading);
(results, setResults);
(deckStats, setDeckStats);
(error, setError);
```

### Key Functions

```javascript
calculateArchetypeScaling(); // Scaling formula
parseDeckStats(); // Extract deck info
handleProceedToDecks(); // Validate step 1
handleValidate(); // Validate step 2
handleReset(); // Return to step 1
```

---

## 📱 Responsive Behavior

### Mobile (< 640px)

- Single column layout
- Minimum 44px button/input heights
- Font size bump to prevent zoom
- Reduced padding (16px instead of 32px)

### Tablet (640-1024px)

- 2-3 column grids
- Balanced spacing
- Full feature set

### Desktop (> 1024px)

- Full 3-5 column layouts
- Maximum information density
- All animations enabled

### Touch Devices

- Removed hover effects
- Active states instead
- Larger touch targets
- Optimized for finger input

---

## ✅ Validation Rules

### Step 1: Team Stats

```
Required: All three fields filled
- Wins: ≥ 0 (number)
- Losses: ≥ 0 (number)
- Archetypes: 0-44 (number)
```

### Step 2: Deck Input

```
Required: Non-empty deck string
Format: YDKE link or YDK file
Example YDKE: ydke://abc123xyz789...
Example YDK:
#main
12345678
87654321
#extra
11111111
!side
22222222
```

### Step 3: Results

```
Automatically calculated based on:
- Deck contents (validated by API)
- Team stats (wins, losses)
- Unlocked archetypes (with scaling)
- Archetype rules from database
```

---

## 🎯 User Flows

### Happy Path

```
1. User enters team stats
2. Proceeds to deck input
3. Pastes deck
4. Views results
5. Sees eligible archetypes highlighted
6. Can modify team stats or try new deck
```

### Error Handling

```
Missing fields → Show error banner
Invalid deck → Show API error message
Network error → Show connection message
Server error → Show retry button
```

---

## 📦 Files Modified

### Core Changes

- **app/page.jsx** (1142 lines)
  - Two-step flow implementation
  - Scaling formula
  - Enhanced visualization
  - Vietnamese localization
  - Deck statistics parser

- **app/globals.css** (Enhanced)
  - Responsive media queries
  - Mobile optimizations
  - Accessibility improvements
  - Animation keyframes
  - Touch device support

### Backup

- **app/page.jsx.backup** (Original version)

---

## 🌍 Internationalization

### Current Language

Vietnamese (vi) - Full UI localization

### Elements Translated

✅ Step titles ✅ Button labels
✅ Form labels ✅ Placeholders
✅ Error messages ✅ Status indicators
✅ Section titles ✅ Notifications
✅ Result headers ✅ Stat labels

### Elements NOT Translated

❌ Archetype names (e.g., M∀LICE, Ryzeal)
❌ Yu-Gi-Oh! terminology
❌ Card names

---

## 🐛 Troubleshooting

### Issue: Text overflows on mobile

**Solution:** Check device width, may need to adjust font-size in globals.css

### Issue: Animations lag on mobile

**Solution:** Device may have reduced-motion preference. Check prefers-reduced-motion media query.

### Issue: Team info not showing in Step 2

**Solution:** Verify all three fields were filled in Step 1

### Issue: Deck statistics show 0

**Solution:** Deck may not be parsed correctly. Check deck format and API response.

---

## 🚀 Performance Tips

### For Development

```bash
npm run dev           # Development server (port 3003)
npm run dev:3002     # Alternative port
npm run build        # Production build
npm run start        # Production server
```

### For Optimization

1. Minimize animations on older devices
2. Lazy-load heavy components
3. Cache deck database in localStorage
4. Use image optimization for any assets

---

## 📚 References

### Key Formulas

```javascript
// Scaling Formula
additionalWins = Math.max(0, unlockedArchetypes - 5) * 5;

// Deck Parsing
mainDeck = cards.filter((c) => c.section === "main");
extraDeck = cards.filter((c) => c.section === "extra");
sideDeck = cards.filter((c) => c.section === "side");

// Statistics
totalArchetypes = new Set([...deck].map((c) => c.archetype)).size;
monsterCount = deck.filter((c) => c.isMonster).length;
spellCount = deck.filter((c) => c.type === "Spell Card").length;
trapCount = deck.filter((c) => c.type === "Trap Card").length;
```

### Accessibility Standards

- WCAG 2.1 Level AA compliance
- Color contrast ratios ≥ 4.5:1
- Focus indicators visible
- Keyboard navigation supported
- Semantic HTML used

---

## 🎉 Next Steps

1. **Test thoroughly** across devices
2. **Gather feedback** from users
3. **Monitor performance** metrics
4. **Plan future enhancements**
   - Dark/Light mode toggle
   - Export results as PDF
   - Deck history/favorites
   - Advanced filtering

---

## 💬 Support

For issues or questions:

1. Check this guide
2. Review [UI_REDESIGN_SUMMARY.md](./UI_REDESIGN_SUMMARY.md)
3. Check browser console for errors
4. Test with different browser/device

---

**Last Updated:** May 25, 2026
**Status:** ✅ Complete and Ready for Testing
