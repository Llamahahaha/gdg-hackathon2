import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'match_telemetry.json');
  try {
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Telemetry not found' }, { status: 404 });
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
