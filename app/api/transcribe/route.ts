import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

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

  // Call local Whisper API
  const whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8000'
  const formData = new FormData()
  const blob = new Blob([buffer])
  formData.append('file', blob, file.name)

  try {
    const whisperResponse = await fetch(`${whisperUrl}/transcribe`, {
      method: 'POST',
      body: formData,
    })

    if (!whisperResponse.ok) {
      throw new Error('Whisper transcription failed')
    }

    const { text } = await whisperResponse.json()

    // Update file with transcription
    const { data: updatedFile, error: updateError } = await supabaseAdmin
      .from('files')
      .update({ content: text })
      .eq('id', fileId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ transcription: text, file: updatedFile })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    )
  }
}