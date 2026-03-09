"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Task, TaskResource } from "@/lib/types";

interface AthleteOption {
  id: string;
  name: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("failed reading file"));
    reader.readAsDataURL(file);
  });
}

async function buildResource(file: File): Promise<TaskResource> {
  const dataUrl = await fileToDataUrl(file);
  const isVideo = file.type.startsWith("video/");
  const isText = file.type.startsWith("text/");
  const textPreview = isText ? await file.text().then((text) => text.slice(0, 250)) : undefined;

  return {
    id: `res_${Math.random().toString(36).slice(2, 9)}`,
    name: file.name,
    type: isVideo ? "video" : isText ? "text" : "file",
    url: dataUrl,
    mimeType: file.type || undefined,
    textPreview
  };
}

export function CoachTaskBuilder({
  locale,
  workspaceId,
  athletes,
  existingTasks
}: {
  locale: string;
  workspaceId: string;
  athletes: AthleteOption[];
  existingTasks: Task[];
}) {
  const router = useRouter();
  const isHebrew = locale === "he";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detailedInstructions, setDetailedInstructions] = useState("");
  const [scheduleType, setScheduleType] = useState<"one_time" | "recurring">("one_time");
  const [dueDate, setDueDate] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("FREQ=WEEKLY;BYDAY=MO,WE,FR");
  const [resources, setResources] = useState<TaskResource[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>(athletes.map((athlete) => athlete.id));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCountLabel = useMemo(() => {
    return isHebrew ? `נבחרו ${selectedAthletes.length} שחקנים` : `${selectedAthletes.length} athletes selected`;
  }, [selectedAthletes.length, isHebrew]);

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const built = await Promise.all([...fileList].map((file) => buildResource(file)));
    setResources((prev) => [...prev, ...built]);
  }

  async function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    await addFiles(event.dataTransfer.files);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title,
          description,
          detailedInstructions,
          resources,
          scheduleType,
          dueDate: scheduleType === "one_time" ? dueDate : undefined,
          recurrenceRule: scheduleType === "recurring" ? recurrenceRule : undefined,
          athleteIds: selectedAthletes
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Task creation failed");
        return;
      }

      setTitle("");
      setDescription("");
      setDetailedInstructions("");
      setResources([]);
      setDueDate("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="coach-task-layout">
      <form className="card auth-form" onSubmit={onSubmit}>
        <h2>{isHebrew ? "יצירת משימה חדשה" : "Create New Task"}</h2>

        <label>
          {isHebrew ? "כותרת" : "Title"}
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label>
          {isHebrew ? "תיאור קצר" : "Short description"}
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
        </label>

        <label>
          {isHebrew ? "הסבר מפורט לשחקן" : "Detailed instructions"}
          <textarea value={detailedInstructions} onChange={(event) => setDetailedInstructions(event.target.value)} rows={5} />
        </label>

        <label>
          {isHebrew ? "סוג לוח זמנים" : "Schedule type"}
          <select value={scheduleType} onChange={(event) => setScheduleType(event.target.value as "one_time" | "recurring")}>
            <option value="one_time">{isHebrew ? "חד פעמי" : "One time"}</option>
            <option value="recurring">{isHebrew ? "מחזורי" : "Recurring"}</option>
          </select>
        </label>

        {scheduleType === "one_time" ? (
          <label>
            {isHebrew ? "תאריך יעד" : "Due date"}
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
          </label>
        ) : (
          <label>
            RRULE
            <input value={recurrenceRule} onChange={(event) => setRecurrenceRule(event.target.value)} required />
          </label>
        )}

        <fieldset className="athlete-picker">
          <legend>{isHebrew ? "בחירת שחקנים למשימה" : "Select athletes"}</legend>
          <p>{selectedCountLabel}</p>
          <div className="athlete-check-grid">
            {athletes.map((athlete) => {
              const checked = selectedAthletes.includes(athlete.id);
              return (
                <label key={athlete.id} className="panel-link-card check-card">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedAthletes((prev) =>
                        checked ? prev.filter((id) => id !== athlete.id) : [...prev, athlete.id]
                      );
                    }}
                  />
                  <span>{athlete.name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div
          className="drop-zone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <p>{isHebrew ? "גררו לכאן קבצים (וידאו/טקסט/קבצים)" : "Drag files here (video/text/files)"}</p>
          <label className="rect-button rect-button-secondary file-label">
            {isHebrew ? "או בחרו קבצים" : "Or select files"}
            <input
              type="file"
              multiple
              onChange={(event) => {
                void addFiles(event.target.files);
              }}
              hidden
            />
          </label>
        </div>

        {resources.length > 0 ? (
          <div className="resource-grid">
            {resources.map((resource) => (
              <article key={resource.id} className="panel-link-card static-card">
                <h3>{resource.name}</h3>
                <p>{resource.type}</p>
                {resource.type === "text" && resource.textPreview ? <p>{resource.textPreview}</p> : null}
              </article>
            ))}
          </div>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}

        <button className="rect-button" type="submit" disabled={loading}>
          {isHebrew ? "שמירת משימה" : "Save task"}
        </button>
      </form>

      <section className="card">
        <h2>{isHebrew ? "משימות קיימות" : "Existing Tasks"}</h2>
        <div className="resource-grid">
          {existingTasks.map((task) => (
            <article key={task.id} className="panel-link-card static-card">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>{isHebrew ? "קבצים מצורפים" : "Attached resources"}: {task.resources.length}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
