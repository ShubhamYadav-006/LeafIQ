# Leaf AI — Database Design

**Database:** PostgreSQL  
**ORM/Query Layer:** Can use raw SQL, node-postgres (`pg`), Prisma, or another PostgreSQL-compatible layer  
**Architecture:** Relational  
**Version:** 1.0  
**Status:** Hackathon MVP

---

# 1. Purpose

The Leaf AI database stores all persistent information required for:

- User accounts
- Crop scans
- Uploaded image references
- AI analysis
- Visual evidence
- Farmer observations
- Follow-up questions
- Farmer answers
- Final assessments
- Alternative possible conditions
- Advisory/action plans
- Scan history
- Re-scans
- Scan relationships
- Future comparison functionality

The database must support the core Leaf AI workflow:

```text
IMAGE
  ↓
VISUAL ANALYSIS
  ↓
INITIAL ASSESSMENT
  ↓
QUESTIONS
  ↓
FARMER ANSWERS
  ↓
FINAL ASSESSMENT
  ↓
ADVISORY
  ↓
SAVE SCAN
  ↓
HISTORY