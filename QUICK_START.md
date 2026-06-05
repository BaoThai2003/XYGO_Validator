# 🎮 Yu-Gi-Oh! Tournament Deck Validator - Quick Start Guide

## 🎉 What's New - 5 Major Improvements

### 1. 🎨 **Visual Enhancements**

- **Background**: Beautiful gaming-themed background (`bg2.jpg`) with gradient overlay
- **Logo**: Project logo displayed at the top center
- **Glassmorphism**: Modern frosted glass effect maintained throughout

### 2. 👥 **Team Member Selection**

In Step 2 (Deck Input), you can now select team members who provide respect bonuses:

- **31 Team Members** available (sorted alphabetically)
- **Multi-select**: Choose one or multiple team members
- **Visual Feedback**: Selected members highlighted in purple gradient
- **Summary Display**: Shows all selected members at a glance

**Example**:

```
Selected: Khai Điện, Nhật Minh
```

### 3. 🏆 **Respect Condition Bonuses**

Team members provide special bonuses:

- **Instant Unlock**: Some members unlock archetypes immediately
- **Win Reduction**: Some reduce required wins (e.g., 20→15)
- **Loss Reduction**: Some reduce required losses
- **Foundation Ready**: Architecture in place for display in archetype cards

**Example Bonuses**:

- Mikanko + Yuki Chan = Automatic unlock
- Chimera + Khai Điện = 20 wins → 15 wins
- Sky Striker + Nhật Minh = 30 wins → 20 wins

### 4. 🔍 **Advanced Filtering**

After validation (Step 3), filter results by requirement type:

- **Tất Cả** (All) - Show all 50+ archetypes
- **Yêu Cầu Wins** - Only archetypes requiring wins
- **Yêu Cầu Losses** - Only archetypes requiring losses
- **Cả 2 Yêu Cầu** (Both) - Only archetypes requiring both wins AND losses

**Use Case**: Quickly find archetypes that only need wins for your current team

### 5. 📥 **Export Results**

Export complete validation results as JSON:

- **Button**: Blue "📥 Xuất Kết Quả" button in Step 3
- **Includes**: Team stats, deck statistics, banlist check, all 50+ archetype results
- **Format**: `deck-validation-{timestamp}.json`
- **Use**: Share, analyze, or archive validation results

---

## 📋 How to Use Each Feature

### **Team Member Selection**

1. Enter team stats (Step 1) and proceed to Step 2
2. Scroll to **"📋 Chọn Thành Viên Đội (Tùy Chọn)"** section
3. Click team member names to select/deselect (toggle)
4. Selected members appear highlighted in purple
5. View count: "✓ Đã chọn X thành viên: [names]"
6. Continue to validate your deck with these bonuses applied

**All 31 Available Members**:

```
Bảo, Cell Skt, Chương Trần, Đạt, Đào Đức, Doãn Nhân
Gầm Giường, Hồ Huy, Hùng, Khai Điện, Kuroko Guen
Nguyễn. Đ. Bình, Nguyễn Đình Tấn Phát, Nguyễn Hữu Lộc
Nguyễn Nguyên, Nguyễn Quang, Nhật Minh, Nos Karkin
Pham Le Minh, Phú, Quang, Quochau Do, Sang Truong
Súc Vật Đại Dương, Tài, Theodore Hamilton, Trần, Trương Duy
Tú Thanh, Vũ, Yuki Chan
```

### **Using Filters**

1. Complete deck validation to see Step 3 results
2. Find the **"🔍 Lọc Archetype:"** section at top
3. Click filter buttons:
   - **Tất Cả**: Shows all eligible and ineligible archetypes
   - **Yêu Cầu Wins**: Only shows archetypes that need wins
   - **Yêu Cầu Losses**: Only shows archetypes that need losses
   - **Cả 2 Yêu Cầu**: Only shows archetypes needing both
4. Results update instantly without re-validating

### **Exporting Results**

1. After validation in Step 3
2. Look for blue button: **"📥 Xuất Kết Quả"**
3. Click to download JSON file
4. File name: `deck-validation-1716921645.json` (includes timestamp)
5. Open in text editor or JSON viewer to review/share

**Exported File Contains**:

- Validation timestamp
- All team statistics and bonuses
- Complete deck composition data
- Banlist compliance status
- Results for all 50+ archetypes
- Statistics breakdowns (monsters, spells, traps, etc.)

---

## 🎯 Feature Highlights

| Feature            | Access         | Benefit                 |
| ------------------ | -------------- | ----------------------- |
| **Background**     | Automatic      | Modern gaming aesthetic |
| **Logo**           | Top center     | Brand identity          |
| **Team Selection** | Step 2         | Unlock respect bonuses  |
| **Filtering**      | Step 3 results | Quick archetype lookup  |
| **Export**         | Step 3 header  | Data portability        |

---

## 🔧 Technical Details

### Supported Deck Formats

- ✅ YDKE format: `ydke://[base64]![base64]![base64]!`
- ✅ YDK format with `#main`, `#extra`, `!side` sections
- ✅ Plaintext passcode lists

### Data Validation

- ✅ OCG 4/2026 Banlist compliance check
- ✅ 50+ Archetype condition validation
- ✅ Team member respect bonuses
- ✅ Deck composition analysis

### Performance

- ⚡ Instant filtering (no re-computation)
- ⚡ Smooth animations and transitions
- ⚡ Responsive design (mobile, tablet, desktop)

---

## 🚀 Getting Started

1. **Open the website**
2. **Step 1**: Enter Team Stats (Wins, Losses, Unlocked Archetypes)
3. **Step 2**:
   - (Optional) Select team members for bonuses
   - Paste your deck (YDKE or YDK format)
4. **Step 3**: View results with filtering and export options

---

## 💡 Tips & Tricks

1. **Team Bonuses**: Always select team members first - they may unlock archetypes!
2. **Filtering**: Use filters to focus on archetypes you're interested in
3. **Export Multiple**: Validate different decks and export to compare
4. **Share Results**: Send JSON export to teammates for discussion

---

## 📞 Need Help?

All features are built into the UI with clear labels:

- Purple sections = Team selections
- Blue sections = Filtering options
- Green buttons = Validate/Submit
- Export button = Always visible in results

---

**Enjoy validating your decks! 🎴✨**
