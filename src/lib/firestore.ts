import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Quiz, QuizResponse, TargetPreset, WeightPreset, Choice, Answer, Vector5, Vector6 } from "@/types";

// ===== Quizzes =====

export async function getActiveQuizzes(): Promise<Quiz[]> {
  const q = query(
    collection(db, "quizzes"),
    where("isActive", "==", true),
    orderBy("order")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  })) as Quiz[];
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const q = query(collection(db, "quizzes"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  })) as Quiz[];
}

export async function addQuiz(data: {
  question: string;
  category: string;
  choices: Choice[];
  isActive: boolean;
  order: number;
}): Promise<string> {
  const ref = await addDoc(collection(db, "quizzes"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateQuiz(
  id: string,
  data: Partial<Omit<Quiz, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "quizzes", id), data);
}

export async function deleteQuiz(id: string): Promise<void> {
  await deleteDoc(doc(db, "quizzes", id));
}

export async function importQuizzes(
  items: { question: string; category?: string; choices: Choice[] }[]
): Promise<void> {
  const batch = writeBatch(db);
  const snap = await getDocs(collection(db, "quizzes"));
  const maxOrder = snap.docs.reduce(
    (max, d) => Math.max(max, (d.data().order as number) ?? 0),
    0
  );

  items.forEach((item, i) => {
    const ref = doc(collection(db, "quizzes"));
    batch.set(ref, {
      question: item.question,
      category: item.category ?? "",
      choices: item.choices,
      isActive: false,
      order: maxOrder + i + 1,
      createdAt: Timestamp.now(),
    });
  });
  await batch.commit();
}

// ===== Responses =====

export async function submitResponse(data: {
  respondentName: string;
  respondentEmail: string;
  answers: Answer[];
  finalVector: Vector6;
  answerTimes: number[];
}): Promise<string> {
  const ref = await addDoc(collection(db, "responses"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getResponses(): Promise<QuizResponse[]> {
  const q = query(collection(db, "responses"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
  })) as QuizResponse[];
}

// ===== Target Presets =====

export async function getTargetPresets(): Promise<TargetPreset[]> {
  const q = query(collection(db, "targetPresets"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TargetPreset[];
}

export async function addTargetPreset(data: {
  name: string;
  values: Vector5;
}): Promise<string> {
  const snap = await getDocs(collection(db, "targetPresets"));
  const maxOrder = snap.docs.reduce(
    (max, d) => Math.max(max, (d.data().order as number) ?? 0),
    0
  );
  const ref = await addDoc(collection(db, "targetPresets"), {
    ...data,
    order: maxOrder + 1,
  });
  return ref.id;
}

export async function updateTargetPreset(
  id: string,
  data: Partial<Omit<TargetPreset, "id">>
): Promise<void> {
  await updateDoc(doc(db, "targetPresets", id), data);
}

export async function deleteTargetPreset(id: string): Promise<void> {
  await deleteDoc(doc(db, "targetPresets", id));
}

// ===== Weight Presets =====

export async function getWeightPresets(): Promise<WeightPreset[]> {
  const q = query(collection(db, "weightPresets"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WeightPreset[];
}

export async function addWeightPreset(data: {
  name: string;
  values: Vector5;
}): Promise<string> {
  const snap = await getDocs(collection(db, "weightPresets"));
  const maxOrder = snap.docs.reduce(
    (max, d) => Math.max(max, (d.data().order as number) ?? 0),
    0
  );
  const ref = await addDoc(collection(db, "weightPresets"), {
    ...data,
    order: maxOrder + 1,
  });
  return ref.id;
}

export async function updateWeightPreset(
  id: string,
  data: Partial<Omit<WeightPreset, "id">>
): Promise<void> {
  await updateDoc(doc(db, "weightPresets", id), data);
}

export async function deleteWeightPreset(id: string): Promise<void> {
  await deleteDoc(doc(db, "weightPresets", id));
}
