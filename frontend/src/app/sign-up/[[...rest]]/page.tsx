import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">PI</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">PlacementIQ</span>
          </div>
          <p className="text-gray-500 text-sm">Create your free account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-gray-100 rounded-xl",
            },
          }}
        />
      </div>
    </div>
  );
}