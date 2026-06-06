/**
 * Seed inicial: estilos, tips, canciones preset, y un usuario admin de ejemplo.
 *
 * Ejecutar con: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_STYLES = [
  {
    id: 'style-worship-contemporary',
    name: 'Worship Contemporáneo',
    difficulty: 2,
    theoryRequired: ['acordes-mayores', 'acordes-menores', 'progresiones-I-IV-V'],
    techniques: ['acordes-cuartos', 'arpegios-basicos'],
    description: 'Estilo principal de la música de adoración moderna.',
  },
  {
    id: 'style-praise',
    name: 'Praise',
    difficulty: 3,
    theoryRequired: ['acordes-septima', 'suspensiones'],
    techniques: ['octavas-mano-izquierda', 'acordes-bloque'],
    description: 'Más energía que el worship, con coros congregacionales.',
  },
  {
    id: 'style-hymn',
    name: 'Hymn / Tradicional',
    difficulty: 1,
    theoryRequired: ['acordes-mayores'],
    techniques: ['voice-leading'],
    description: 'Himnos tradicionales con armonización clásica.',
  },
];

const SEED_TIPS = [
  {
    id: 'tip-1',
    content: 'Practica con metrónomo desde el primer día. El tempo constante desarrolla el oído rítmico.',
    category: 'técnica',
    styleId: null,
    difficultyMin: 1,
  },
  {
    id: 'tip-2',
    content: 'En worship, la mano izquierda puede ser simple (nota fundamental + quinta) para no robar atención de la melodía.',
    category: 'técnica',
    styleId: 'style-worship-contemporary',
    difficultyMin: 2,
  },
  {
    id: 'tip-3',
    content: 'El worship no es un performance: sirve a la congregación. Toca para que otros canten, no para impresionar.',
    category: 'mentalidad',
    styleId: null,
    difficultyMin: 1,
  },
  {
    id: 'tip-4',
    content: 'Aprende las progresiones comunes: I-V-vi-IV, vi-IV-I-V. El 80% de las canciones worship las usan.',
    category: 'teoría',
    styleId: 'style-worship-contemporary',
    difficultyMin: 1,
  },
];

const SEED_SONGS = [
  {
    id: 'song-rey-de-gloria',
    title: 'Rey de Gloria',
    artist: 'Elevation Worship',
    styleId: 'style-worship-contemporary',
    difficulty: 2,
    keySignature: 'C',
    bpm: 72,
    chordData: {
      sections: [
        {
          name: 'Verso 1',
          chords: [
            { chord: 'C', beat: 0, duration: 4 },
            { chord: 'G', beat: 4, duration: 4 },
            { chord: 'Am', beat: 8, duration: 4 },
            { chord: 'F', beat: 12, duration: 4 },
          ],
        },
      ],
    },
    isPublished: true,
    isPreset: true,
  },
  {
    id: 'song-build-my-life',
    title: 'Build My Life',
    artist: 'Housefires',
    styleId: 'style-worship-contemporary',
    difficulty: 2,
    keySignature: 'G',
    bpm: 68,
    chordData: {
      sections: [
        {
          name: 'Coro',
          chords: [
            { chord: 'G', beat: 0, duration: 4 },
            { chord: 'Em', beat: 4, duration: 4 },
            { chord: 'C', beat: 8, duration: 4 },
            { chord: 'D', beat: 12, duration: 4 },
          ],
        },
      ],
    },
    isPublished: true,
    isPreset: true,
  },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos de seed previos
  await prisma.practiceSession.deleteMany();
  await prisma.earTrainingResult.deleteMany();
  await prisma.songAudio.deleteMany();
  await prisma.songShare.deleteMany();
  await prisma.song.deleteMany();
  await prisma.tip.deleteMany();
  await prisma.style.deleteMany();

  // Estilos
  for (const style of SEED_STYLES) {
    await prisma.style.create({ data: style });
  }
  console.log(`✅ ${SEED_STYLES.length} estilos creados`);

  // Tips
  for (const tip of SEED_TIPS) {
    await prisma.tip.create({ data: tip });
  }
  console.log(`✅ ${SEED_TIPS.length} tips creados`);

  // Canciones preset
  for (const song of SEED_SONGS) {
    await prisma.song.create({ data: song });
  }
  console.log(`✅ ${SEED_SONGS.length} canciones preset creadas`);

  // Usuario admin de ejemplo
  const adminEmail = 'admin@worshippiano.app';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        displayName: 'Admin',
      },
    });
    console.log('✅ Usuario admin creado (admin@worshippiano.app / admin123456)');
  }

  console.log('🎉 Seed completado');
}

main()
  .catch((e) => {
    console.error('❌ Error durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
