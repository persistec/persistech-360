import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Hierarchy levels
  const hierarchyLevels = [
    { name: 'Estagiário', rank: 1 },
    { name: 'Técnico / Operacional', rank: 2 },
    { name: 'Sénior / Especialista', rank: 3 },
    { name: 'Coordenador', rank: 4 },
    { name: 'Gestor', rank: 5 },
    { name: 'Direção', rank: 6 },
  ];

  const dbHierarchyLevels = [];
  for (const hl of hierarchyLevels) {
    const created = await prisma.hierarchyLevel.upsert({
      where: { rank: hl.rank },
      update: { name: hl.name },
      create: hl,
    });
    dbHierarchyLevels.push(created);
  }
  console.log(`Seeded ${dbHierarchyLevels.length} hierarchy levels.`);

  // 2. Departments
  const departments = [
    { name: 'Direção Geral' },
    { name: 'Engenharia' },
    { name: 'Recursos Humanos' },
    { name: 'Vendas' },
  ];

  const dbDepartments: Record<string, any> = {};
  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    dbDepartments[dept.name] = created;
  }
  console.log(`Seeded ${Object.keys(dbDepartments).length} departments.`);

  // Setup hierarchical departments
  await prisma.department.update({
    where: { id: dbDepartments['Engenharia'].id },
    data: { parentDepartmentId: dbDepartments['Direção Geral'].id },
  });
  await prisma.department.update({
    where: { id: dbDepartments['Recursos Humanos'].id },
    data: { parentDepartmentId: dbDepartments['Direção Geral'].id },
  });
  await prisma.department.update({
    where: { id: dbDepartments['Vendas'].id },
    data: { parentDepartmentId: dbDepartments['Direção Geral'].id },
  });

  // 3. Roles
  const hrDept = dbDepartments['Recursos Humanos'];
  const engDept = dbDepartments['Engenharia'];
  const execDept = dbDepartments['Direção Geral'];

  const levelJunior = dbHierarchyLevels.find(h => h.rank === 2);
  const levelSenior = dbHierarchyLevels.find(h => h.rank === 3);
  const levelCoordinator = dbHierarchyLevels.find(h => h.rank === 4);
  const levelManager = dbHierarchyLevels.find(h => h.rank === 5);
  const levelDirector = dbHierarchyLevels.find(h => h.rank === 6);

  const roles = [
    {
      name: 'Diretor Geral',
      departmentId: execDept.id,
      hierarchyLevelId: levelDirector?.id,
    },
    {
      name: 'Desenvolvedor Júnior',
      departmentId: engDept.id,
      hierarchyLevelId: levelJunior?.id,
    },
    {
      name: 'Desenvolvedor Sénior',
      departmentId: engDept.id,
      hierarchyLevelId: levelSenior?.id,
    },
    {
      name: 'Coordenador de RH',
      departmentId: hrDept.id,
      hierarchyLevelId: levelCoordinator?.id,
    },
    {
      name: 'Gerente de Engenharia',
      departmentId: engDept.id,
      hierarchyLevelId: levelManager?.id,
    },
  ];

  for (const role of roles) {
    const existing = await prisma.role.findFirst({
      where: {
        name: role.name,
        departmentId: role.departmentId,
      },
    });

    if (!existing) {
      await prisma.role.create({
        data: role,
      });
    }
  }
  console.log('Seeded roles.');

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
