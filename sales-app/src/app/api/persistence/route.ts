import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
        return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    const filePath = path.join(DATA_DIR, `${type}.json`);

    try {
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ data: null, message: 'File not found' });
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return NextResponse.json({ data: JSON.parse(data) });
    } catch (error: any) {
        console.error(`Read error [${type}]:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
        }

        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        const filePath = path.join(DATA_DIR, `${type}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`Save error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
