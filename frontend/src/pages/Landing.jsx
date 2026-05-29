import { Link } from "react-router-dom";

function Landing() {
  return (
    <div 
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-[128px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-10 pointer-events-none"></div>

      <div className="z-10 text-center max-w-2xl px-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm">
          🏙️ Civic Empowerment Portal
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 mb-6 tracking-tight">
          Fix My Ward
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-light">
          Empowering communities by bridging the gap between citizens and local government. 
          Report infrastructure issues, track live resolutions, and build a better neighborhood today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transform hover:-translate-y-0.5 text-center"
          >
            Access Platform
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-900/60 backdrop-blur-md border border-gray-800 text-gray-300 font-semibold text-lg hover:bg-gray-800 hover:text-white transition-all transform hover:-translate-y-0.5 text-center hover:border-gray-700"
          >
            Create Citizen Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;
