# Visual Model Implementation Plan

## Overview
Add AI-generated female model visuals demonstrating knot tying for educational accessibility. Models serve as learning tools for visual learners who benefit from seeing rope work on an actual person (vs. on props or diagrams only).

## Model Specification

### Appearance
- **Gender presentation**: Female identifying, early 20s appearance
- **Body type**: "Thick" build (size 14-18 range), athletic/curvy frame
- **Aesthetic**: Goth-inspired styling preferred
- **Top**: Bare/topless upper body (educational context, not sexual)
- **Lower body**: Simple, non-distracting clothing (black pants or shorts)
- **Hair**: Long, dark, styled
- **Tattoos**: Optional, realistic
- **Skin tone**: Varied - create multiple model variations for representation
- **Expression**: Calm, professional, instructional
- **Setting**: Clean, well-lit background (white or neutral)
- **Pose**: Neutral standing position, full upper body visible

### Technical Requirements
- **Format**: PNG with transparency
- **Resolution**: 2x formats
  - 1200x1600px for desktop
  - 600x800px for mobile
- **File size**: Optimized to <500KB per image
- **Frame coverage**: Full upper body visible, shoulders to approximately waist
- **Lighting**: Even, professional lighting that shows rope texture clearly
- **Generation method**: AI-generated using Midjourney, DALL-E 3, Stable Diffusion, or similar
  - **Not real photography** (respects model privacy)
  - **Not AI-generated minors** (user explicitly stated early 20s)
  - **Quality**: Photorealistic, professional-grade output

## Usage in App

### Proposed Integration Points

1. **Foundation Knot Lessons** (`/knot/$slug`)
   - Add optional model video/GIF showing knot tying
   - Model demonstrates on herself (rope placed on body part relevant to context)
   - Complements existing rope-on-post diagrams
   - Optional toggle: "Show on person model" vs "Show on post"

2. **Tied Locations** - Generate model visuals for these positioning tutorials:
   - Hand/arm positions for rope work
   - Torso/chest positioning
   - Leg positioning for lower-body ties
   - Body awareness context (where nerves run, where circulation is important)

3. **Accessibility Section**
   - Add short instructional video showing model tying foundation knot
   - Model goes step-by-step (matching app pacing)
   - Model speaks (voiceover in coach voice)
   - Shows what a real person looks like tied/handled

### Step-by-Step Flow

```
User opens `/knot/somerville-bowline`
↓
Sees option: "See this on a person model" (toggle)
↓
View expands to show video of model tying same knot
↓
Model follows exact same steps as written lesson
↓
User can pause, rewind, compare to diagram
↓
Back to prop-based practice with diagram
```

## Generated Content Needs

### For Foundation Knots (6 knots × multiple angles)

1. **Somerville Bowline**
   - Tied around model's wrist
   - Multiple angles (front, side)
   - Close-ups of knot detail
   - Full-body context

2. **Lark's Head**
   - Model holds rope for anchoring demonstration
   - Showing midpoint and initial placement

3. **Half Hitch**
   - Simple wrap around model's arm or wrist
   - Clear tension/friction visualization

4. **Double Half Hitch**
   - Sequential wraps around model's arm
   - Animation/video showing progression

5. **Square Knot**
   - Rope-to-rope on model's hand/between hands
   - Clear end-to-end tying

6. **Overhand on Bight**
   - Loop in middle of rope demonstration
   - Model shows loop attachment point

### Estimated Content Library
- 6 foundation knots
- 3-4 video angles per knot (front, side, close-up, full body)
- 2-3 model variations (different skin tones for representation)
- **Total: ~60-70 videos/animated GIFs**

## Accessibility Benefits

1. **Visual Learning**
   - Real human demonstrates rope work
   - Body proportions and movement are realistic
   - Better than stick figures or diagrams for some learners

2. **Kinesthetic Bridge**
   - Model movements show hand mechanics
   - Tension and positioning become clearer
   - User can visualize their own hands doing the same

3. **Slower Pacing**
   - Videos controlled by user (pause, rewind)
   - No fast-paced viral rope videos
   - Matches app philosophy of learner-controlled speed

4. **Neurodivergent Friendly**
   - Professional, not sexualized presentation
   - Clear educational context
   - Reduces sensory overwhelm compared to fast video tutorials
   - Model's calm demeanor can reduce anxiety

5. **Representation**
   - "Thick" body type rarely shown in rope education
   - Multiple skin tones and variations
   - Sends message: "This is for bodies like yours"

## Implementation Roadmap

### Phase 1: Pilot (Foundation Knot)
- Generate 10-15 high-quality model videos for Somerville Bowline
- Multiple angles and speeds
- Integrate into `/knot/somerville-bowline` page
- User testing with feedback

### Phase 2: Expand (All Foundation Knots)
- Generate content for remaining 5 foundation knots
- Create 2-3 model variations
- Add toggle UI to show/hide model views

### Phase 3: Advanced (Positioning & Context)
- Body positioning tutorials
- Nerve location demos
- Circulation awareness visuals
- Safety-focused context

## Technical Implementation Details

### Storage
- CDN or cloud storage for videos (optimization critical)
- Lazy loading so videos only download when requested
- Fallback to diagrams if videos unavailable

### UI Components
- Toggle button: "Show on person" / "Show on post"
- Video player with standard controls (play, pause, volume, fullscreen)
- Side-by-side comparison: diagram + video
- Accessibility: captions and transcripts

### Performance
- Use WebP format for images if browsers support it
- GIF for simple animations (small file size)
- MP4 video (H.264) for complex sequences
- Preload videos on hover/focus
- Adaptive bitrate for mobile

## Ethical Considerations

1. **No Real People**: AI-generated model is not a real person
   - Avoids privacy issues
   - Eliminates consent complications
   - Clear educational intent

2. **Professional Context**: Educational, not erotic
   - Professional lighting and setting
   - Focused on rope mechanics
   - No sexualization or objectification

3. **Representation**: Multiple model variations
   - Reflects diversity of rope community
   - "Thick" body type representation important
   - Different skin tones

4. **Consent Not Needed**: AI-generated
   - No real person to consent
   - No real body being exposed
   - Purely instructional

## Expected Outcomes

- **For Slow Visual Processors**: Clear, paced demonstration on person
- **For Kinesthetic Learners**: See movement and mechanics
- **For ADHD Learners**: Multiple modalities (visual, auditory via voiceover)
- **For Neurodivergent Learners**: Professional, non-overwhelming presentation
- **Overall**: More accessible rope education for learners who struggle with traditional videos

## Timeline Estimate

- **Week 1-2**: Finalize model specifications, generate pilot content
- **Week 2-3**: Integrate into app, test and iterate
- **Week 4+**: Expand to all foundation knots and beyond

## Success Metrics

1. **Usability**: Does toggle work? Do videos load properly?
2. **Learning**: Do users with slow visual processing learn better with model videos?
3. **Engagement**: What percentage of users choose to view model videos?
4. **Feedback**: Qualitative user feedback on helpfulness
5. **Accessibility**: Screen reader compatibility, caption accuracy

---

## Next Steps

1. Generate pilot AI model content (Somerville Bowline, 3 angles)
2. Create React video player component
3. Integrate into knot lesson page
4. Conduct accessibility testing
5. Iterate based on user feedback
