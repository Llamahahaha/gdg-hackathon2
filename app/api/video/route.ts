import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'vision', 'visionplay-pipeline', 'output_videos', 'detected_test.mp4');
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }
  const file = fs.readFileSync(filePath);
  return new NextResponse(file, {
    headers: {
      'Content-Type': 'video/mp4',
    },
  });
}
