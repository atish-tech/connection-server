import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }
    
    // Fetch the PDF from the original URL
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the PDF data as array buffer
    const pdfData = await response.arrayBuffer();
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      },
    });
  } catch (error) {
    console.error('Error in PDF proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy PDF' },
      { status: 500 }
    );
  }
}
