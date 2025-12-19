import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerId, fileIds } = await request.json()

  // Verify customer belongs to user
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('user_id', userId)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Get all files
  const { data: files, error: filesError } = await supabaseAdmin
    .from('files')
    .select('*')
    .in('id', fileIds)
    .eq('customer_id', customerId)

  if (filesError) {
    return NextResponse.json({ error: filesError.message }, { status: 500 })
  }

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files found' }, { status: 400 })
  }

  // Prepare transcripts for analysis (focusing on transcripts and call transcriptions)
  const transcriptParts: string[] = []
  for (const file of files) {
    if ((file.type === 'audio' && file.content) || (file.type === 'transcript' && file.content)) {
      // Format timestamp from occurred_at or created_at
      let timestamp = ''
      if (file.occurred_at) {
        timestamp = new Date(file.occurred_at).toISOString()
      } else if (file.created_at) {
        timestamp = new Date(file.created_at).toISOString()
      }
      
      const dateInfo = timestamp ? `[${timestamp}] ` : ''
      const notesInfo = file.notes ? `\nNotes: ${file.notes}\n` : ''
      
      // Format transcript with timestamp prefix if not already present
      let transcriptContent = file.content
      // If transcript doesn't start with a timestamp, prepend the file timestamp
      if (timestamp && !transcriptContent.match(/^\[?\d{4}-\d{2}-\d{2}/)) {
        transcriptContent = `${dateInfo}${transcriptContent}`
      }
      
      transcriptParts.push(`${transcriptContent}${notesInfo}`)
    }
  }

  if (transcriptParts.length === 0) {
    return NextResponse.json(
      { error: 'No analyzable transcripts found. Please ensure files have transcript content.' },
      { status: 400 }
    )
  }

  const combinedTranscripts = transcriptParts.join('\n\n---\n\n')

  // Generate analysis with OpenAI using the new prompt structure
  const systemPrompt = `You are an expert B2B enterprise sales strategist who specializes in complex, multi‑stakeholder deals. 

You will receive multiple call transcripts from the same opportunity. Treat them as ONE continuous story.

Your job is to synthesize, not summarize.

Be precise, judgment‑based, and actionable.

When unsure, state assumptions explicitly.`

  const userPrompt = `You will receive transcripts below. Please analyze them as ONE bundle.

========================

TRANSCRIPTS START

${combinedTranscripts}

TRANSCRIPTS END

========================

Use ONLY facts inferred from the transcripts. Do not hallucinate.

---------------------------------

PART 1 — Stakeholder Psychological Map

---------------------------------

For EACH client‑side stakeholder mentioned, list:

Name (or "Unknown Title / Role" if not given)

Role / Function:

Decision Power Level: (Decision Maker / Influencer / End‑User / Blocker / Unknown)

Cares About (1–2 lines, concrete):

Primary Fears / Risks (1–2 lines):

Recurring Questions or Themes they raise:

What they would need to believe to move forward:

Evidence from transcript (include 2–5 direct quotes with timestamps per stakeholder):

Format:

[Stakeholder Name]

- Role:

- Decision Power:

- Cares About:

- Fears:

- Repeatedly Asks:

- Must Believe:

- Evidence Quotes:

   - "quote" (timestamp)

---------------------------------

PART 2 — Deal Physics & Dynamics

---------------------------------

Explain WHY this deal is moving / stuck in plain English. Avoid fluff.

1️⃣ TL;DR (3–6 bullets)  

• what is actually happening  

• why it is stuck or risky  

• what they emotionally believe about vendors

2️⃣ Internal Dynamics

- Who actually drives the decision vs who talks the most?

- Where are disagreements internally?

- Where do they feel operational pain the most?

3️⃣ Proof from Transcript

Provide 6–10 quotes w/ timestamps that demonstrate:

- confusion

- urgency

- hesitation

- excitement

- risk concerns

Label each quote with what it proves.

---------------------------------

PART 3 — Close Plan (Concrete + Practical)

---------------------------------

Write this as a playbook the founder / AE could actually follow.

1️⃣ What the next phase should accomplish (3–5 bullets)

2️⃣ Recommended meeting sequence

   - Meeting 1 Goal:

   - Who must attend:

   - What must be shown:

   - Expected outcome:

   (repeat if multiple meetings)

3️⃣ Risks & Failure Modes

List the top 5 ways this deal could fail and how to pre‑empt.

---------------------------------

PART 4 — Positioning Strategy

---------------------------------

Explain how to position our product so the buyer emotionally believes we "get them."

1️⃣ Core Positioning Sentence (1–2 lines)

2️⃣ 3 Pillars messaging (tailored to THIS customer)

For each pillar:

- What they believe today

- How we should frame ourselves

- Proof they will care about this (with quotes)

---------------------------------

PART 5 — Executive Digest (Founder‑Friendly)

---------------------------------

Write a clear, human summary a founder can forward internally:

"Here's what's going on"

"Here's why they haven't bought yet"

"Here's exactly what we should do next"

Max 12 bullets.

Plain english. No jargon.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    })

    const analysisContent = completion.choices[0]?.message?.content || ''

    // Parse and structure the analysis based on the new 5-part structure
    const analysis = {
      stakeholderMap: extractSection(analysisContent, 'PART 1', 'PART 2'),
      dealPhysics: extractSection(analysisContent, 'PART 2', 'PART 3'),
      closePlan: extractSection(analysisContent, 'PART 3', 'PART 4'),
      positioningStrategy: extractSection(analysisContent, 'PART 4', 'PART 5'),
      executiveDigest: extractSection(analysisContent, 'PART 5'),
      fullText: analysisContent,
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from('analyses')
      .insert({
        customer_id: customerId,
        files_analyzed: fileIds,
        content: analysis,
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    return NextResponse.json(savedAnalysis)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

function extractSection(text: string, startMarker: string, endMarker?: string): string {
  // Escape special regex characters in markers
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const escapedStart = escapeRegex(startMarker)
  
  let pattern: RegExp
  
  if (endMarker) {
    // Extract section between two markers
    const escapedEnd = escapeRegex(endMarker)
    pattern = new RegExp(`${escapedStart}[\\s\\S]*?(?=${escapedEnd}|$)`, 'i')
  } else {
    // Extract section from marker to end
    pattern = new RegExp(`${escapedStart}[\\s\\S]*$`, 'i')
  }
  
  const match = text.match(pattern)
  if (match) {
    return match[0].trim()
  }
  
  return ''
}