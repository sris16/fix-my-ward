import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="z-10 text-center max-w-2xl px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-6 tracking-tight">
          Fix My Ward
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
          Empowering citizens to report, track, and resolve local civic issues. 
          Be the change in your community today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-emerald-500 text-white font-semibold text-lg hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 rounded-full bg-transparent border border-gray-600 text-gray-300 font-semibold text-lg hover:bg-gray-800 hover:text-white transition-all transform hover:-translate-y-1"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;
