import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Subject } from "../backend";
import {
  useDeleteSubject,
  useGetSessions,
  useGetSubjects,
} from "../hooks/useQueries";
import { AddSubjectDialog } from "./AddSubjectDialog";
import { EditSubjectDialog } from "./EditSubjectDialog";

export function SubjectList() {
  const { data: subjects, isLoading, isError } = useGetSubjects();
  const { data: sessions } = useGetSessions();
  const { mutate: deleteSubject, isPending: isDeleting } = useDeleteSubject();

  const [addOpen, setAddOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const sessionCountMap = new Map<string, number>();
  // biome-ignore lint/complexity/noForEach: existing code pattern
  sessions?.forEach((s) => {
    const key = s.subjectId.toString();
    sessionCountMap.set(key, (sessionCountMap.get(key) || 0) + 1);
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSubject(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success("Subject deleted");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Failed to delete subject"),
      },
    );
  };

  if (isError) {
    return <div className="text-destructive">Failed to load subjects.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight font-serif">
            Subjects
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage the topics you're studying.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="rounded-full shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !subjects || subjects.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Tags className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="mb-6 text-muted-foreground font-medium text-center max-w-xs">
              No subjects yet. Create your first subject to start tracking your
              study sessions.
            </p>
            <Button
              variant="outline"
              onClick={() => setAddOpen(true)}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id.toString()}
              className="group overflow-hidden border-border/50 transition-all hover:shadow-xl hover:border-primary/30"
            >
              <div
                className="h-1.5 w-full transition-all group-hover:h-2"
                style={{ backgroundColor: subject.color }}
              />
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-serif">
                    {subject.name}
                  </CardTitle>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {sessionCountMap.get(subject.id.toString()) || 0} sessions
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => setEditSubject(subject)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(subject)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    Active
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddSubjectDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditSubjectDialog
        open={!!editSubject}
        onOpenChange={(open) => !open && setEditSubject(null)}
        subject={editSubject}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{deleteTarget?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the subject. Existing sessions will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
