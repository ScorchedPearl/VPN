import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import Cover from '@/components/Cover';
import PasswordGate from '@/components/PasswordGate';
import Reveal from '@/deck/Reveal';

type Question = {
  prompt: string;
  options?: string[];
  answer: string;
  answerLink?: string;
};

const questions: Question[] = [
  { prompt: 'Which of these is NOT a programming language?', options: ['A. Assembly', 'B. PHP', 'C. C++', 'D. HTML'], answer: 'D. HTML' },
  { prompt: 'What is the unofficial national sport of engineering students?', answer: 'Procrastination' },
  { prompt: 'According to anime logic, if you are late for school with toast in your mouth, what is guaranteed to happen?', options: ['A. You will choke on the toast.', 'B. You will bump into a mysterious and attractive transfer student.', 'C. You will just miss the bus like a normal person.', 'D. A truck will appear out of nowhere.'], answer: 'B. You will bump into a mysterious and attractive transfer student.' },
  { prompt: 'According to the legendary movie Hera Pheri, exactly how many days does it take for your money to double?', options: ['A. 10 din', 'B. 21 din', 'C. 25 din', 'D. Anuradha knows, ask her.'], answer: 'B. 21 din' },
  { prompt: 'What is the national bird of every Indian college hostel?', options: ['A. Peacock', 'B. Crow', 'C. The mosquito that refuses to die', 'D. The senior who “just came to say hi”'], answer: 'Judges’ opinion' },
  { prompt: 'A pigeon is flying at full speed toward someone. Nobody survives that bird strike—except the sole exception of?', answer: 'Satoru Gojo' },
  { prompt: 'If a vampire bites a zombie, what happens?', options: ['A. The zombie becomes a vampire', 'B. The vampire becomes a zombie', 'C. Nothing, because biology has resigned', 'D. They both need therapy'], answer: 'C. Nothing, because biology has resigned' },
  { prompt: 'What is the strongest authentication mechanism?', options: ['A. Password', 'B. OTP', 'C. Biometrics', 'D. “Bro I know the senior who manages it”'], answer: 'D. “Bro I know the senior who manages it”' },
  { prompt: 'What happens when you burn a Coca-Cola?', answer: 'Watch the answer reel', answerLink: 'https://www.instagram.com/reel/DanD8l9MwJq/?igsi=YjhiM254d2VmN25j' },
  { prompt: 'What is “technical debt”?', options: ['A. Bad design that makes future changes harder', 'B. Money borrowed to buy a laptop', 'C. Your unpaid hostel mess bill', 'D. The 17 TODOs you promised to fix “later”'], answer: 'A / D — depending on how your project is going.' },
  { prompt: 'What is the most important skill an engineering student develops?', options: ['A. Programming', 'B. Problem solving', 'C. Time management', 'D. Doing 3 weeks of work in 7 hours'], answer: 'D. Doing 3 weeks of work in 7 hours' },
  { prompt: 'What is the universal solution to a Wi-Fi problem?', options: ['A. Fuck The Proxy', 'B. Restart laptop', 'C. Reconnect Wi-Fi', 'D. Blame the network administrator'], answer: 'D. Blame the network administrator' },
  { prompt: 'You walk into your first lecture at IIIT-A. What do you understand?', options: ['A. Everything', 'B. Most things', 'C. Absolutely nothing', 'D. “Is this even the right classroom?”'], answer: 'C. Absolutely nothing' },
  { prompt: 'Which programming language was named after a comedy group?', options: ['A. Python', 'B. Java', 'C. C', 'D. Rust'], answer: 'A. Python — Monty Python.' },
  { prompt: 'Why is the QWERTY keyboard arranged the way it is?', options: ['A. Historical typewriter design', 'B. To make typing faster', 'C. To make programmers suffer', 'D. To ensure freshmen never find / during their first week'], answer: 'A. Historical typewriter design' },
  { prompt: 'What does “sudo” basically mean in Linux?', options: ['A. Execute with superuser privileges', 'B. “Please, I’m desperate”', 'C. “Teacher, give me permission”', 'D. “I know what I’m doing”'], answer: 'A. Execute with superuser privileges — D is the most common lie.' },
  { prompt: 'GitHub is basically very useful for:', options: ['A. Keeping code and projects online', 'B. Working with other people', 'C. Showing your projects to others', 'D. Forking other people’s projects'], answer: 'Judges’ opinion' },
  { prompt: 'A computer without an operating system is basically:', options: ['A. A very expensive calculator', 'B. Hardware waiting for instructions', 'C. A gaming PC', 'D. ChatGPT'], answer: 'B. Hardware waiting for instructions' },
  { prompt: 'Final question: you are now officially a fresher at IIITA. What is your current plan?', options: ['A. Rangtarangini join karunga.', 'B. Complete DSA, CP and everything.', 'C. Seniors ko set karna.', 'D. GeekHaven join karunga.'], answer: 'All are valid 😂' },
  { prompt: 'You accidentally push directly to main. What do you do?', options: ['A. Pretend nothing happened', 'B. Tell your team immediately', 'C. Delete your GitHub account', 'D. Change your name and move to another country'], answer: 'B. Tell your team immediately 😂' },
  { prompt: 'What does this commit message mean? atmkbfj', options: ['A. Important update', 'B. Keyboard testing', 'C. Developer gave up', 'D. Production-ready code'], answer: 'Judges’ opinion' },
  { prompt: 'What happens when you press the accelerator and brake together in a car?', answer: 'Watch the answer reel', answerLink: 'https://www.instagram.com/reel/Db09qqcPagb/?igsi=bWw3NXphM25wbGlm' },
  { prompt: 'Final task after finishing a project?', options: ['A. Push .env to GitHub.', 'B. Send the localhost link to the manager.', 'C. Deploy on iiita.ac.in', 'D. Rechecked by Vishwas Bhaiya.'], answer: 'Judges’ opinion' },
  { prompt: 'What is our college culture more about?', options: ['A. CP', 'B. Competitive coding', 'C. Dating culture', 'D. Vibe coding'], answer: 'Judges’ opinion' },
  { prompt: 'What is the biggest lie a developer tells?', options: ['A. “I will comment the code later.”', 'B. “This is the final version.”', 'C. “It works on my machine.”', 'D. “I wrote the code from scratch.”'], answer: 'D. “I wrote the code from scratch.”' },
  { prompt: 'Before smartphones became pocket computers, which company was basically like “haan bhai, phone mein Snake daal dete hain”?', options: ['A. Nokia', 'B. Apple', 'C. IBM', 'D. Tesla'], answer: 'Judges’ opinion' },
  { prompt: 'Which anime character would absolutely survive Indian hostel life?', options: ['A. Luffy', 'B. Goku', 'C. Naruto', 'D. Levi — because he’d clean the whole hostel himself 😭'], answer: 'Judges’ opinion' },
  { prompt: 'What question should you ask your senior to ragebait them?', options: ['A. CG kitni hai sir?', 'B. CF ki rating kitni hai?', 'C. Aap relationship mein kyun nahi ho?', 'D. Sir 1 Cr ki placement toh lag hi jaati hogi na.'], answer: 'Judges’ opinion' },
  { prompt: 'Who created Linux?', options: ['A. Linus Torvalds', 'B. Bill Gates', 'C. A sleep-deprived IIIT student at 4 AM', 'D. The guy who runs the lab computers'], answer: 'A. Linus Torvalds' },
  { prompt: 'What does “404” mean?', options: ['A. Not Found', 'B. 4 assignments, 0 sleep, 4 coffees', 'C. Your CGPA after one bad semester', 'D. All of the above'], answer: 'A. Not Found' },
  { prompt: 'What does “NPC” mean in internet slang?', options: ['A. Non-Playable Character', 'B. No Placement Coming', 'C. No Problem, Chill', 'D. New Programming Curriculum'], answer: 'A. Non-Playable Character' },
  { prompt: 'What does “TL;DR” mean?', options: ['A. Too Long; Didn’t Read', 'B. Too Lazy; Do Revision', 'C. Tomorrow’s Lab; Don’t Remember', 'D. Teacher Likes; Don’t Respond'], answer: 'A. Too Long; Didn’t Read' },
  { prompt: 'Senior jab bolta hai “2 min ka kaam hai”, actual duration?', options: ['A. 2 min', 'B. 10 min', 'C. 30 min', 'D. Graduation tak'], answer: 'Judges’ opinion' },
];

function QuestionSlide({ question, index }: { question: Question; index: number }) {
  return (
    <Slide nav={`Q${index + 1}`} notes={`Question ${index + 1}. Answer: ${question.answer}`}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
        <Reveal>
          <div className="kicker" style={{ marginBottom: 14 }}>CAPS LOCK · Question {String(index + 1).padStart(2, '0')} / {questions.length}</div>
          <h2 className="headline" style={{ maxWidth: 980, marginBottom: 30 }}>{question.prompt}</h2>
        </Reveal>
        {question.options && (
          <Reveal delay={0.08}>
            <div className="cols" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {question.options.map((option) => (
                <div key={option} className="mat" style={{ padding: '16px 20px', border: '1px solid var(--hair)', background: 'rgba(16, 27, 49, 0.84)', color: 'var(--fg-muted)', fontSize: 'clamp(15px, 1.55vw, 20px)', lineHeight: 1.4 }}>{option}</div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </Slide>
  );
}

function AnswerSlide({ question, index }: { question: Question; index: number }) {
  const isJudgesOpinion = question.answer === 'Judges’ opinion';
  return (
    <Slide center nav={`Answer ${index + 1}`} notes={`Answer for question ${index + 1}: ${question.answer}`}>
      <Reveal>
        <div className="kicker" style={{ marginBottom: 18 }}>CAPS LOCK · Answer {String(index + 1).padStart(2, '0')}</div>
        {question.answerLink ? (
          <a href={question.answerLink} target="_blank" rel="noreferrer" className="answer-link">
            Watch the answer reel ↗
          </a>
        ) : (
          <h2 className="display" style={{ maxWidth: 930, marginInline: 'auto', fontSize: 'clamp(40px, 6.4vw, 84px)' }}>
            {isJudgesOpinion ? <span className="accent-text">Judges’ opinion</span> : question.answer}
          </h2>
        )}
        {isJudgesOpinion && <p className="subhead" style={{ marginTop: 24 }}>The judges have the final call on this one.</p>}
      </Reveal>
    </Slide>
  );
}

export default function App() {
  return (
    <PasswordGate>
    <Deck>
      <Cover
        nav="Cover"
        kicker="OOSC presents · IIIT Allahabad"
        title={<>CAPS <span className="accent-text">LOCK</span></>}
        subtitle="A fresher-friendly tech, campus, anime, and internet quiz. Lock in your answer."
        foot="OOSC · IIIT Allahabad"
      />

      <Slide center nav="Rules" notes="Introduce CAPS LOCK and invite the audience to answer before revealing the judge’s decision.">
        <Reveal>
          <div className="kicker" style={{ marginBottom: 18 }}>How it works</div>
          <h2 className="display" style={{ maxWidth: 900, marginInline: 'auto', fontSize: 'clamp(42px, 7vw, 92px)' }}>
            Pick a choice.<br /><span className="accent-text">Defend your honour.</span>
          </h2>
          <p className="subhead" style={{ marginTop: 24, maxWidth: 720 }}>Some answers are facts. Some are hostel folklore. If no answer was supplied, the final call is the <strong>Judges’ opinion</strong>.</p>
        </Reveal>
      </Slide>

      {questions.flatMap((question, index) => [
        <QuestionSlide key={`question-${question.prompt}`} question={question} index={index} />,
        <AnswerSlide key={`answer-${question.prompt}`} question={question} index={index} />,
      ])}

      <Slide center nav="Close" notes="Close the quiz and thank the participants.">
        <Reveal>
          <div className="kicker" style={{ marginBottom: 18 }}>CAPS LOCK complete</div>
          <h2 className="display" style={{ maxWidth: 940, marginInline: 'auto', fontSize: 'clamp(42px, 7vw, 92px)' }}>
            You survived the quiz.<br /><span className="accent-text">Now survive the semester.</span>
          </h2>
          <p className="subhead" style={{ marginTop: 24 }}>Organized by OOSC · IIIT Allahabad</p>
        </Reveal>
      </Slide>
    </Deck>
    </PasswordGate>
  );
}
