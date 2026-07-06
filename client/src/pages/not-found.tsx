import { Card, CardContent } from "@/components/ui/card";
import { TriangleAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0c0e] p-4">
      <Card className="w-full max-w-md bg-[#16181c] border-zinc-800 shadow-2xl">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">

          {/* Alert Icon Container */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-red-200">
            <TriangleAlert className="h-6 w-6" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            404 Page Not Found
          </h1>

          {/* Copy */}
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed px-2">
            Oh no! The page you're looking for was brought back to the workshop. 
            The requested page could not be found.
          </p>

          {/* Call to Action Button */}
          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-98"
          >
            <ArrowLeft className="h-4 w-4" />
            Return
          </button>

        </CardContent>
      </Card>
    </div>
  );
}