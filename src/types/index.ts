export type Vector5 = [number, number, number, number, number];

export interface Choice {
  text: string;
  vector: Vector5;
}

export interface Quiz {
  id: string;
  question: string;
  category: string;
  choices: Choice[];
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export interface Answer {
  quizId: string;
  choiceIndex: number;
}

export interface QuizResponse {
  id: string;
  respondentName: string;
  respondentEmail: string;
  answers: Answer[];
  finalVector: Vector5;
  createdAt: Date;
}

export interface TargetPreset {
  id: string;
  name: string;
  values: Vector5;
  order: number;
}

export interface WeightPreset {
  id: string;
  name: string;
  values: Vector5;
  order: number;
}

export interface SyncLabel {
  min: number;
  label: string;
  desc: string;
  cls: string;
}
