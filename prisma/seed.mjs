import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleIssues = [
  {
    title: 'AC Unit Condensation Leak Above Server Rack',
    description: 'The ceiling split AC unit is dripping condensation directly over the auxiliary server rack. Potential hazard for network switches and power distribution units.',
    category: 'ELECTRICAL',
    block: 'Academic Block A',
    floor: '3rd Floor',
    room: 'Computer Lab 304',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    status: 'IN_PROGRESS',
    upvotesCount: 28,
    adminNote: 'HVAC technician Ramesh inspected at 10:15 AM. Drain line unclogged, secondary pan fitted, and safety tarp installed.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    title: 'High-Pressure Water Pipe Burst in Restroom',
    description: 'Major water leakage from the main inlet angle valve under the handwash counter. Water is spilling out into the corridor.',
    category: 'PLUMBING',
    block: 'Student Centre',
    floor: '2nd Floor',
    room: 'Washroom 2B',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    status: 'ASSIGNED',
    upvotesCount: 45,
    adminNote: 'Sub-valve isolated by security. Assigned to plumbing team lead David for immediate gasket replacement.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    title: '4K Ceiling Projector Lamp Blown Before Midterms',
    description: 'The overhead Optoma projector in LH-102 flickers and turns off after 30 seconds with an overheat error. Crucial for tomorrow morning fluid dynamics presentation.',
    category: 'LAB_EQUIPMENT',
    block: 'Science & Tech Block',
    floor: '1st Floor',
    room: 'Lecture Hall 102',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    status: 'IN_REVIEW',
    upvotesCount: 34,
    adminNote: 'AV Department verified ticket. Replacement 240W bulb module checked out from IT stores.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
  {
    title: 'Loose Emergency Electrical Breaker Switchboard',
    description: 'Front acrylic cover of the main 415V 3-phase distribution box is cracked and hanging open near the CNC milling station.',
    category: 'ELECTRICAL',
    block: 'Mechanical Workshop',
    floor: 'Ground Floor',
    room: 'Mechatronics Bay 1',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    status: 'REPORTED',
    upvotesCount: 19,
    adminNote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
  },
  {
    title: 'Fume Hood Exhaust Blower System Failure',
    description: 'Audible grinding noise and zero negative pressure in fume hood hood #4 during chemical extraction practicals.',
    category: 'LAB_EQUIPMENT',
    block: 'Chemistry Research Annex',
    floor: '2nd Floor',
    room: 'Organic Chem Lab 210',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    status: 'RESOLVED',
    upvotesCount: 52,
    adminNote: 'V-belt replaced on rooftop centrifugal extractor and face velocity verified at 105 FPM. Certified safe for student usage.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    title: 'Broken Auditorium Seats with Splintered Armrests',
    description: 'Seats 14-18 in Row G have loosened floor bolts and splintered plywood armrests snagging student clothes.',
    category: 'FURNITURE',
    block: 'Arts & Humanities Block',
    floor: 'Ground Floor',
    room: 'Main Auditorium',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    status: 'RESOLVED',
    upvotesCount: 15,
    adminNote: 'Carpentry crew re-anchored metal pedestals with heavy duty M10 anchor studs and sanded armrests.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
  {
    title: 'Overflowing Recycling & Compost Bins at North Gate',
    description: 'Post-hackathon lunch waste has accumulated around exterior sorting bins; attracting birds and bees near study benches.',
    category: 'SANITATION',
    block: 'Central Library',
    floor: 'Ground Floor',
    room: 'North Porch Entrance',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    status: 'REPORTED',
    upvotesCount: 21,
    adminNote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  }
];

async function main() {
  console.log('Seeding FixMyCampus database with realistic campus issues...');
  await prisma.upvote.deleteMany();
  await prisma.issue.deleteMany();

  for (const issue of sampleIssues) {
    const created = await prisma.issue.create({
      data: issue,
    });
    console.log(`Created issue: [${created.category}] ${created.title} (${created.status})`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
