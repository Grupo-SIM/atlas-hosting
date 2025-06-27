import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Get the plugin name from the URL parameters
    const url = new URL(request.url);
    const pluginName = url.pathname.split('/').pop();

    if (pluginName !== 'atlashosting-migrator.zip') {
      return NextResponse.json(
        { message: "Plugin não encontrado" },
        { status: 404 }
      );
    }

    // Path to the built plugin ZIP in the WordPress plugin project
    const pluginPath = path.join(
      process.cwd(), 
      '../wp-plugin-atlashosting/wp-plugin-atlashosting/dist/atlashosting-migrator.zip'
    );

    try {
      const fileBuffer = await readFile(pluginPath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="atlashosting-migrator.zip"',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (fileError) {
      // If the built plugin doesn't exist, return a helpful message
      return NextResponse.json(
        { 
          message: "Plugin ainda não foi compilado. Execute o build.sh no projeto do plugin primeiro.",
          buildInstructions: "cd ../wp-plugin-atlashosting/wp-plugin-atlashosting && ./build.sh"
        },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Erro ao servir plugin:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
