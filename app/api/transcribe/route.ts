import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

export async function POST(request: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fileId } = await request.json()

  // Get file from database
  const { data: file, error: fileError } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single()

  if (fileError || !file || file.type !== 'audio') {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Check if already transcribed
  if (file.content) {
    return NextResponse.json({ 
      transcription: file.content, 
      file,
      message: 'File already transcribed' 
    })
  }

  // Download file from storage
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from('audio-files')
    .download(file.storage_path!)

  if (downloadError) {
    return NextResponse.json({ error: downloadError.message }, { status: 500 })
  }

  // Convert to buffer
  const arrayBuffer = await fileData.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    // Upload file to AssemblyAI
    const uploadResponse = await client.files.upload(buffer)
    
    // Transcribe the file
    const transcript = await client.transcripts.transcribe({
      audio: uploadResponse,
    })

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed')
    }

    const transcriptionText = transcript.text || ''

    // Update file with transcription
    const { data: updatedFile, error: updateError } = await supabaseAdmin
      .from('files')
      .update({ content: transcriptionText })
      .eq('id', fileId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ transcription: transcriptionText, file: updatedFile })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    )
  }
}