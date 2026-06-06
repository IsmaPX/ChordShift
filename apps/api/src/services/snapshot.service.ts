/**
 * Snapshot de hidratación: el estado completo del usuario para sincronizar
 * el cliente cuando arranca en un dispositivo nuevo.
 *
 * Devuelve todo lo que el usuario necesita para funcionar offline:
 * - Canciones (preset + propias)
 * - Sesiones de práctica
 * - Resultados de ear training
 * - Tips y estilos (catálogo)
 * - Canciones compartidas conmigo
 */

import { prisma } from '../config/database.js';

export interface UserSnapshot {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    settings: unknown;
    createdAt: string;
  };
  songs: Array<{
    id: string;
    title: string;
    artist: string | null;
    styleId: string;
    difficulty: number;
    keySignature: string;
    bpm: number;
    chordData: unknown;
    isPublished: boolean;
    isPreset: boolean;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  practiceSessions: Array<{
    id: string;
    userId: string;
    songId: string;
    startedAt: string;
    durationS: number;
    completed: boolean;
  }>;
  earTrainingResults: Array<{
    id: string;
    userId: string;
    exerciseType: string;
    question: unknown;
    answerGiven: string;
    correctAnswer: string;
    isCorrect: boolean;
    responseMs: number;
    createdAt: string;
  }>;
  styles: Array<{
    id: string;
    name: string;
    difficulty: number;
    theoryRequired: string[];
    techniques: string[];
    description: string;
  }>;
  tips: Array<{
    id: string;
    content: string;
    category: string;
    styleId: string | null;
    difficultyMin: number;
  }>;
  sharedWithMe: Array<{
    id: string;
    songId: string;
    permission: string;
    song: unknown;
    sharedBy: { id: string; displayName: string | null; email: string };
  }>;
  serverTime: string;
  snapshotVersion: number;
}

const SNAPSHOT_VERSION = 1;

export async function getUserSnapshot(userId: string): Promise<UserSnapshot> {
  const [user, songs, practiceSessions, earTrainingResults, styles, tips, sharedWithMe] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          settings: true,
          createdAt: true,
        },
      }),
      prisma.song.findMany({
        where: { OR: [{ isPreset: true }, { createdById: userId }] },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.practiceSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 500,
      }),
      prisma.earTrainingResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      prisma.style.findMany({ orderBy: { difficulty: 'asc' } }),
      prisma.tip.findMany({ orderBy: { difficultyMin: 'asc' } }),
      prisma.songShare.findMany({
        where: { sharedWithId: userId },
        include: {
          song: true,
          sharedBy: { select: { id: true, displayName: true, email: true } },
        },
      }),
    ]);

  if (!user) throw new Error('Usuario no encontrado');

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      settings: user.settings,
      createdAt: user.createdAt.toISOString(),
    },
    songs: songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      styleId: s.styleId,
      difficulty: s.difficulty,
      keySignature: s.keySignature,
      bpm: s.bpm,
      chordData: s.chordData,
      isPublished: s.isPublished,
      isPreset: s.isPreset,
      createdById: s.createdById,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    practiceSessions: practiceSessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      songId: s.songId,
      startedAt: s.startedAt.toISOString(),
      durationS: s.durationS,
      completed: s.completed,
    })),
    earTrainingResults: earTrainingResults.map((r) => ({
      id: r.id,
      userId: r.userId,
      exerciseType: r.exerciseType,
      question: r.question,
      answerGiven: r.answerGiven,
      correctAnswer: r.correctAnswer,
      isCorrect: r.isCorrect,
      responseMs: r.responseMs,
      createdAt: r.createdAt.toISOString(),
    })),
    styles: styles.map((s) => ({
      id: s.id,
      name: s.name,
      difficulty: s.difficulty,
      theoryRequired: s.theoryRequired,
      techniques: s.techniques,
      description: s.description,
    })),
    tips: tips.map((t) => ({
      id: t.id,
      content: t.content,
      category: t.category,
      styleId: t.styleId,
      difficultyMin: t.difficultyMin,
    })),
    sharedWithMe: sharedWithMe.map((s) => ({
      id: s.id,
      songId: s.songId,
      permission: s.permission,
      song: s.song,
      sharedBy: s.sharedBy,
    })),
    serverTime: new Date().toISOString(),
    snapshotVersion: SNAPSHOT_VERSION,
  };
}
