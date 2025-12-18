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

  // Prepare content for analysis
  const contentParts: string[] = []
  for (const file of files) {
    if (file.type === 'email') {
      contentParts.push(`EMAIL:\n${file.content}\n`)
    } else if (file.type === 'audio' && file.content) {
      contentParts.push(`CALL TRANSCRIPTION:\n${file.content}\n`)
    }
  }

  const combinedContent = contentParts.join('\n---\n\n')

  // Generate analysis with OpenAI
  const prompt = `You are a sales preparation assistant. Analyze the following customer interactions (emails and call transcriptions) for ${customer.name} and create a comprehensive preparation document.

The document should include:
1. TL;DR - Key takeaways (5-7 bullet points)
2. Stakeholder Map - Key people mentioned, their roles, concerns, and quotes
3. Deal Status & Blockers - What's working, what's stalling, unanswered questions
4. Next Call Strategy - Primary objective, key questions to ask, proof points to provide, objections to pre-empt
5. Competitive Context - Alternatives being considered, your differentiation
6. Key Risks - Potential issues to watch

Be specific, actionable, and reference exact quotes and timestamps when available.

Customer Interactions:
${combinedContent}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or gpt-4-1106-preview, adjust based on available models
      messages: [
        {
          role: 'system',
          content: 'You are an expert sales preparation assistant. Create detailed, actionable preparation documents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    const analysisContent = completion.choices[0]?.message?.content || ''

    // Parse and structure the analysis (you can make this more sophisticated)
    const analysis = {
      tldr: extractSection(analysisContent, 'TL;DR'),
      stakeholders: extractSection(analysisContent, 'Stakeholder Map'),
      dealStatus: extractSection(analysisContent, 'Deal Status'),
      nextCallStrategy: extractSection(analysisContent, 'Next Call Strategy'),
      competitiveContext: extractSection(analysisContent, 'Competitive Context'),
      risks: extractSection(analysisContent, 'Key Risks'),
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

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n##|$)`, 'i')
  const match = text.match(regex)
  return match ? match[0].trim() : ''
}