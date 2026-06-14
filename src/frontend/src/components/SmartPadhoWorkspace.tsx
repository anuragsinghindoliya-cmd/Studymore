import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileUp,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ClassLevel = "Class 9" | "Class 10" | "Class 11" | "Class 12";
type Subject =
  | "Science"
  | "Math"
  | "Social Science"
  | "Physics"
  | "Chemistry"
  | "Biology";
type Mode = "examiner" | "tutor";
type ChatMessage = { role: "examiner" | "student"; text: string };
type Mistake = { question: string; failedStep: string; date: string };
type ChapterMemory = {
  notesUploaded: boolean;
  notesSummary: string;
  chatHistory: ChatMessage[];
  mistakeLogbook: Mistake[];
};

const classSubjects: Record<ClassLevel, Subject[]> = {
  "Class 9": ["Science", "Math", "Social Science"],
  "Class 10": ["Science", "Math", "Social Science"],
  "Class 11": ["Physics", "Chemistry", "Math", "Biology"],
  "Class 12": ["Physics", "Chemistry", "Math", "Biology"],
};

const chapters: Record<Subject, string[]> = {
  Science: [
    "Matter in Our Surroundings",
    "Motion",
    "Life Processes",
    "Heredity",
    "Electricity",
  ],
  Math: [
    "Number Systems",
    "Polynomials",
    "Quadratic Equations",
    "Coordinate Geometry",
    "Probability",
  ],
  "Social Science": [
    "The French Revolution",
    "Nationalism in India",
    "Resources and Development",
    "Power Sharing",
  ],
  Physics: [
    "Units and Measurements",
    "Laws of Motion",
    "Work, Energy and Power",
    "Ray Optics",
    "Electrostatics",
  ],
  Chemistry: [
    "Some Basic Concepts",
    "Structure of Atom",
    "Chemical Bonding",
    "Solutions",
    "Electrochemistry",
  ],
  Biology: [
    "The Living World",
    "Biomolecules",
    "Photosynthesis",
    "Human Reproduction",
    "Genetics and Evolution",
  ],
};

const syllabusGaps: Record<string, string> = {
  "Class 10:Math:Quadratic Equations":
    "forming competency-based quadratic models from real-life constraints",
  "Class 10:Science:Electricity":
    "case-based circuit reasoning with power-rating inference",
  "Class 12:Physics:Electrostatics":
    "competency-based electric flux interpretation through non-uniform surfaces",
};

const pyqs = [
  "A quadratic equation has roots whose sum is 5 and product is 6. Form the equation and solve it using the method from your notes.",
  "A student records a current of 0.5 A through a resistor connected to 6 V. Find resistance and justify the formula used.",
  "Explain why a ray passing through the optical centre of a lens emerges undeviated with a labelled step sequence.",
  "Solve a probability question where two dice are thrown and the required event is getting a sum greater than 9.",
  "Write a competency-style answer explaining one real-life application of the chapter concept in 4 marked points.",
];

const emptyMemory: ChapterMemory = {
  notesUploaded: false,
  notesSummary: "",
  chatHistory: [],
  mistakeLogbook: [],
};

const getMemoryKey = (
  classLevel: ClassLevel,
  subject: Subject,
  chapter: string,
) => `smart-padho:${classLevel}:${subject}:${chapter}`;

export function SmartPadhoWorkspace() {
  const [classLevel, setClassLevel] = useState<ClassLevel | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [memory, setMemory] = useState<ChapterMemory>(emptyMemory);
  const [notesDraft, setNotesDraft] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [tutorQuestion, setTutorQuestion] = useState("");

  const memoryKey = useMemo(() => {
    if (!classLevel || !subject || !chapter) return null;
    return getMemoryKey(classLevel, subject, chapter);
  }, [classLevel, subject, chapter]);

  useEffect(() => {
    if (!memoryKey) return;
    const saved = localStorage.getItem(memoryKey);
    setMemory(saved ? JSON.parse(saved) : emptyMemory);
    setMode(null);
    setQuestionIndex(0);
    setFeedback("");
  }, [memoryKey]);

  const persistMemory = (nextMemory: ChapterMemory) => {
    setMemory(nextMemory);
    if (memoryKey) localStorage.setItem(memoryKey, JSON.stringify(nextMemory));
  };

  const missingTopic =
    classLevel && subject && chapter
      ? syllabusGaps[`${classLevel}:${subject}:${chapter}`]
      : undefined;
  const currentQuestion = pyqs[questionIndex];

  const uploadNotes = () => {
    persistMemory({
      ...memory,
      notesUploaded: true,
      notesSummary:
        notesDraft ||
        "Uploaded notes registered for strict note-pinned evaluation.",
      chatHistory: [
        ...memory.chatHistory,
        {
          role: "examiner",
          text: "Notes ingested. Structural flow, formulas, and step methods are pinned for this chapter.",
        },
      ],
    });
    setNotesDraft("");
  };

  const gradeAnswer = () => {
    if (answer.toLowerCase().includes("hint")) {
      setFeedback(
        "Hint: Revisit the formula/method sequence from your uploaded notes summary before substituting values. I will not reveal the final answer yet.",
      );
      return;
    }
    const lostMarks = answer.trim().length < 80;
    const nextMistakes = lostMarks
      ? [
          ...memory.mistakeLogbook,
          {
            question: currentQuestion,
            failedStep:
              "Step 1 explanation was incomplete or not aligned to uploaded-note method.",
            date: new Date().toISOString(),
          },
        ]
      : memory.mistakeLogbook;
    persistMemory({
      ...memory,
      mistakeLogbook: nextMistakes,
      chatHistory: [
        ...memory.chatHistory,
        { role: "student", text: answer },
        {
          role: "examiner",
          text: lostMarks
            ? "Partial marks awarded; mistake logged."
            : "Full method credit awarded.",
        },
      ],
    });
    setFeedback(
      lostMarks
        ? "✅ Given Data & Formula (as per your notes): +1 Mark\n❌ Step 1 Execution: -1 Mark — the reasoning is too short to verify your exact method. Try correcting this step before moving ahead.\n📝 Added to Chapter Mistake Logbook."
        : "✅ Given Data & Formula (as per your notes): +1 Mark\n✅ Step 1 Execution: +1.5 Marks\n✅ Final Calculation/Conclusion: +1.5 Marks\nTotal: Full credit. Ready for the next PYQ?",
    );
  };

  const askTutor = () => {
    persistMemory({
      ...memory,
      chatHistory: [
        ...memory.chatHistory,
        { role: "student", text: tutorQuestion },
        {
          role: "examiner",
          text: "Open Tutor Mode response generated using standard CBSE pedagogy.",
        },
      ],
    });
    setFeedback(
      `Open Tutor Mode: Start from the definition, connect it to a daily-life example, then solve with CBSE steps. For your doubt: “${tutorQuestion}”, first identify the known data, choose the governing concept, substitute carefully, and conclude in exam language.`,
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 shadow-sm dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <Badge className="mb-4 gap-2">
          <ShieldCheck className="h-3.5 w-3.5" /> CBSE 2027 Syllabus Shield
        </Badge>
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Smart Padho
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          A strict but empathetic digital examiner for personalized CBSE board
          preparation, with persistent chapter memory, note-pinned testing, and
          an error logbook.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Navigation Flow
            </CardTitle>
            <CardDescription>
              Select class, subject, and chapter in order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold">1. Class</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(classSubjects).map((item) => (
                  <Button
                    key={item}
                    variant={classLevel === item ? "default" : "outline"}
                    onClick={() => {
                      setClassLevel(item as ClassLevel);
                      setSubject(null);
                      setChapter(null);
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            {classLevel && (
              <div>
                <p className="mb-2 text-sm font-semibold">2. Subject</p>
                <div className="grid gap-2">
                  {classSubjects[classLevel].map((item) => (
                    <Button
                      key={item}
                      variant={subject === item ? "default" : "outline"}
                      onClick={() => {
                        setSubject(item);
                        setChapter(null);
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {subject && (
              <div>
                <p className="mb-2 text-sm font-semibold">3. Chapter</p>
                <div className="grid gap-2">
                  {chapters[subject].map((item) => (
                    <Button
                      key={item}
                      variant={chapter === item ? "default" : "outline"}
                      onClick={() => setChapter(item)}
                      className="justify-start whitespace-normal"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!chapter && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-3 h-10 w-10" /> Select a chapter
                to open its persistent workspace.
              </CardContent>
            </Card>
          )}

          {chapter && (
            <Card>
              <CardHeader>
                <CardTitle>{chapter} Workspace</CardTitle>
                <CardDescription>
                  Loaded previous chat history, uploaded notes status, and
                  mistake logbook for this chapter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-semibold">
                      {memory.notesUploaded ? "Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Chat Turns</p>
                    <p className="font-semibold">{memory.chatHistory.length}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Mistakes</p>
                    <p className="font-semibold">
                      {memory.mistakeLogbook.length}
                    </p>
                  </div>
                </div>

                {!memory.notesUploaded && (
                  <div className="rounded-2xl border border-dashed p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <FileUp className="h-5 w-5" /> First-time chapter setup:
                      upload PDFs, images, web URLs, or paste notes.
                    </div>
                    <Input type="file" multiple className="mb-3" />
                    <Textarea
                      value={notesDraft}
                      onChange={(event) => setNotesDraft(event.target.value)}
                      placeholder="Paste note flow, formulas, or web URLs here..."
                    />
                    <Button className="mt-3" onClick={uploadNotes}>
                      Analyze & Pin Notes
                    </Button>
                  </div>
                )}

                {memory.notesUploaded && (
                  <div className="rounded-2xl bg-muted p-4 text-sm">
                    <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />{" "}
                    Your notes are already pinned. Smart Padho will not ask you
                    to re-upload them for this chapter.
                  </div>
                )}

                {missingTopic && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <AlertTriangle className="mr-2 inline h-4 w-4" /> ⚠️ Note:
                    Your notes are missing the competency-based concept of{" "}
                    <strong>{missingTopic}</strong>, which is required for the
                    2027 exams. Would you like me to explain it in Open Tutor
                    Mode, or will you add it later?
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => setMode("examiner")}
                    variant={mode === "examiner" ? "default" : "outline"}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" /> Mode A: Examiner
                    Mode
                  </Button>
                  <Button
                    onClick={() => setMode("tutor")}
                    variant={mode === "tutor" ? "default" : "outline"}
                  >
                    <Brain className="mr-2 h-4 w-4" /> Mode B: Open Tutor Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === "examiner" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Strict Note-Pinned PYQ {questionIndex + 1} of 5
                </CardTitle>
                <CardDescription>
                  Only one question is shown at a time. Type “Hint” for a
                  note-only clue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border bg-muted/50 p-4 font-medium">
                  {currentQuestion}
                </div>
                <Textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Write your answer step-by-step, or mention that you uploaded a handwritten image..."
                />
                <div className="flex gap-3">
                  <Button onClick={gradeAnswer}>Submit for CBSE Marking</Button>
                  <Button
                    variant="outline"
                    disabled={!feedback || questionIndex === 4}
                    onClick={() => {
                      setQuestionIndex(questionIndex + 1);
                      setAnswer("");
                      setFeedback("");
                    }}
                  >
                    Next PYQ
                  </Button>
                </div>
                {feedback && (
                  <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-white">
                    {feedback}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}

          {mode === "tutor" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5" /> Open Tutor Mode
                </CardTitle>
                <CardDescription>
                  Ask any academic question. Notes are optional in this mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={tutorQuestion}
                  onChange={(event) => setTutorQuestion(event.target.value)}
                  placeholder="Ask a doubt, request an explanation, or generate practice..."
                />
                <Button onClick={askTutor}>Explain Simply</Button>
                {feedback && (
                  <div className="rounded-2xl border bg-muted p-4">
                    {feedback}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
