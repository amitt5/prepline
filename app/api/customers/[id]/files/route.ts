import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify customer belongs to user
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify customer belongs to user
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const emailContent = formData.get('emailContent') as string | null
  const transcriptContent = formData.get('transcriptContent') as string | null
  const occurredAt = formData.get('occurredAt') as string | null
  const notes = formData.get('notes') as string | null

  if (file) {
    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('audio-files')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    // Save file record
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        customer_id: id,
        name: file.name,
        type: 'audio',
        storage_path: fileName,
        file_size: file.size,
        occurred_at: occurredAt || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(fileRecord)
  }

  if (emailContent) {
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        customer_id: id,
        name: 'Email thread',
        type: 'email',
        content: emailContent,
        occurred_at: occurredAt || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(fileRecord)
  }

  if (transcriptContent) {
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        customer_id: id,
        name: 'Transcript',
        type: 'transcript',
        content: transcriptContent,
        occurred_at: occurredAt || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(fileRecord)
  }

  return NextResponse.json({ error: 'No file, email content, or transcript content provided' }, { status: 400 })
}