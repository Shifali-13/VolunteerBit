import { Link } from 'react-router-dom';

const steps = [
  { icon: '🔍', title: 'Find a task', text: 'Browse short 30-60 minute tasks from local NGOs.' },
  { icon: '✅', title: 'Apply & get accepted', text: 'NGOs review applications and confirm volunteers.' },
  { icon: '🏅', title: 'Earn recognition', text: 'Collect hours, badges and a PDF certificate.' },
];

export default function Landing() {
  return (
    <main>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold">Volunteer in minutes, not months.</h1>
          <p className="mt-5 text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
            VolunteerBit connects NGOs with people who have a spare hour. Teach, translate, design, help, and earn certificates for it.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/tasks" className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50">
              Browse Tasks
            </Link>
            <Link to="/register" className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.title} className="bg-white border rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl">{s.icon}</div>
              <h3 className="font-semibold text-lg mt-3">{s.title}</h3>
              <p className="text-gray-600 mt-2 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
