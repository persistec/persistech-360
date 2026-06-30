import { PrismaClient } from '@prisma/client';
import { bootstrapAdmin } from '../src/database/seed-admin';

// Simple helper to parse arguments
function getModeAndGuard(args: string[], env: NodeJS.ProcessEnv) {
  const modeArg = args.find(arg => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'structural';
  
  const isDemoAllowed = env.ALLOW_DEMO_SEED === 'true' || args.includes('--allow-demo-seed');
  return { mode, isDemoAllowed };
}

function checkProductionGuard(databaseUrl: string | undefined, nodeEnv: string | undefined) {
  if (!databaseUrl) return;

  const lowerUrl = databaseUrl.toLowerCase();
  
  // Heuristic checks for production Neon host and prod NODE_ENV
  const isNeonProd = lowerUrl.includes('ep-morning-wave-aciutlo4') || 
                     (lowerUrl.includes('neon.tech') && (lowerUrl.includes('prod') || lowerUrl.includes('production')));

  const isNodeEnvProd = nodeEnv === 'production';

  if (isNeonProd || isNodeEnvProd) {
    throw new Error(
      `SAFETY BLOCK: Demo seeding is BLOCKED on production environments.\n` +
      `Detected Neon Prod Host: ${isNeonProd}\n` +
      `Detected NODE_ENV=production: ${isNodeEnvProd}`
    );
  }
}

export async function runSeed(
  prisma: PrismaClient,
  mode: string,
  env: NodeJS.ProcessEnv = process.env,
  args: string[] = [],
) {
  console.log(`Seeding database in [${mode}] mode...`);

  // -------------------------------------------------------------------------
  // 1. HIERARCHY LEVELS
  // -------------------------------------------------------------------------
  const hierarchyLevelDefs = [
    { name: 'Estagiário',            rank: 1 },
    { name: 'Técnico / Operacional', rank: 2 },
    { name: 'Sénior / Especialista', rank: 3 },
    { name: 'Coordenador',           rank: 4 },
    { name: 'Gestor',                rank: 5 },
    { name: 'Direcção',              rank: 6 },
  ];

  const dbHierarchyLevels: Record<string, any> = {};
  for (const hl of hierarchyLevelDefs) {
    const created = await prisma.hierarchyLevel.upsert({
      where:  { rank: hl.rank },
      update: { name: hl.name },
      create: hl,
    });
    dbHierarchyLevels[hl.rank] = created;
  }
  console.log(`Seeded ${Object.keys(dbHierarchyLevels).length} hierarchy levels.`);

  // -------------------------------------------------------------------------
  // 2. DIMENSIONS
  // -------------------------------------------------------------------------
  const dimensionDefs = [
    {
      name:        'Competências Corporativas',
      type:        'corporate',
      weight:      1.0,
      description: 'Valores e comportamentos transversais a toda a organização.',
    },
    {
      name:        'Competências Técnicas',
      type:        'departmental',
      weight:      1.2,
      description: 'Conhecimento técnico específico da função.',
    },
    {
      name:        'Competências de Liderança',
      type:        'leadership',
      weight:      1.5,
      description: 'Capacidade de gerir equipas e decisões — aplicável a gestores e direcção.',
    },
  ];

  const dbDimensions: Record<string, any> = {};
  for (const d of dimensionDefs) {
    const created = await prisma.dimension.upsert({
      where:  { name: d.name },
      update: { type: d.type as any, weight: d.weight, description: d.description },
      create: { name: d.name, type: d.type as any, weight: d.weight, description: d.description },
    });
    dbDimensions[d.name] = created;
  }
  console.log(`Seeded ${Object.keys(dbDimensions).length} dimensions.`);

  // -------------------------------------------------------------------------
  // 3. CRITERIA
  // -------------------------------------------------------------------------
  const criterionDefs: { dimension: string; text: string; weight: number }[] = [
    // Competências Corporativas
    { dimension: 'Competências Corporativas', text: 'Pontualidade e assiduidade',       weight: 1.0 },
    { dimension: 'Competências Corporativas', text: 'Comunicação interpessoal',          weight: 1.0 },
    { dimension: 'Competências Corporativas', text: 'Orientação para resultados',        weight: 1.1 },
    { dimension: 'Competências Corporativas', text: 'Trabalho em equipa',                weight: 1.0 },
    { dimension: 'Competências Corporativas', text: 'Adaptabilidade à mudança',          weight: 1.0 },
    // Competências Técnicas
    { dimension: 'Competências Técnicas', text: 'Domínio das ferramentas da função',     weight: 1.2 },
    { dimension: 'Competências Técnicas', text: 'Qualidade do trabalho entregue',        weight: 1.2 },
    { dimension: 'Competências Técnicas', text: 'Autonomia na resolução de problemas',   weight: 1.1 },
    { dimension: 'Competências Técnicas', text: 'Cumprimento de prazos',                 weight: 1.0 },
    // Competências de Liderança
    { dimension: 'Competências de Liderança', text: 'Capacidade de delegar',             weight: 1.3 },
    { dimension: 'Competências de Liderança', text: 'Desenvolvimento da equipa',         weight: 1.3 },
    { dimension: 'Competências de Liderança', text: 'Clareza na comunicação de objectivos', weight: 1.2 },
    { dimension: 'Competências de Liderança', text: 'Gestão de conflitos',               weight: 1.2 },
  ];

  const dbCriteria: Record<string, any> = {};
  for (const c of criterionDefs) {
    const existing = await prisma.criterion.findFirst({
      where: { text: c.text, dimensionId: dbDimensions[c.dimension].id },
    });
    const criterion = existing ?? await prisma.criterion.create({
      data: {
        text:        c.text,
        weight:      c.weight,
        dimensionId: dbDimensions[c.dimension].id,
      },
    });
    dbCriteria[c.text] = criterion;
  }
  console.log(`Seeded ${Object.keys(dbCriteria).length} criteria.`);

  // -------------------------------------------------------------------------
  // 4. CRITERION OPTIONS (uniform scale — applied to every criterion)
  // -------------------------------------------------------------------------
  const optionDefs = [
    { label: 'Insatisfatório', scoreValue: 1.0, sortOrder: 1 },
    { label: 'A desenvolver',  scoreValue: 2.0, sortOrder: 2 },
    { label: 'Satisfatório',   scoreValue: 3.0, sortOrder: 3 },
    { label: 'Bom',            scoreValue: 4.0, sortOrder: 4 },
    { label: 'Excelente',      scoreValue: 5.0, sortOrder: 5 },
  ];

  let optionCount = 0;
  for (const criterion of Object.values(dbCriteria)) {
    for (const opt of optionDefs) {
      const existing = await prisma.criterionOption.findFirst({
        where: { criterionId: criterion.id, label: opt.label },
      });
      if (!existing) {
        await prisma.criterionOption.create({
          data: { ...opt, criterionId: criterion.id },
        });
        optionCount++;
      }
    }
  }
  console.log(`Seeded ${optionCount} criterion options.`);

  // -------------------------------------------------------------------------
  // 5. APPLICABILITY RULES
  // -------------------------------------------------------------------------
  const existingCorp = await prisma.applicabilityRule.findFirst({
    where: { dimensionId: dbDimensions['Competências Corporativas'].id },
  });
  if (!existingCorp) {
    await prisma.applicabilityRule.create({
      data: {
        dimensionId:              dbDimensions['Competências Corporativas'].id,
        crossDepartmentAllowed:   true,
        sameDepartmentRequired:   false,
        blockedIfEvaluateeAboveEvaluator: true,
      },
    });
  }

  const existingTech = await prisma.applicabilityRule.findFirst({
    where: { dimensionId: dbDimensions['Competências Técnicas'].id },
  });
  if (!existingTech) {
    await prisma.applicabilityRule.create({
      data: {
        dimensionId:              dbDimensions['Competências Técnicas'].id,
        crossDepartmentAllowed:   true,
        sameDepartmentRequired:   false,
        blockedIfEvaluateeAboveEvaluator: true,
      },
    });
  }

  const existingLeader = await prisma.applicabilityRule.findFirst({
    where: { dimensionId: dbDimensions['Competências de Liderança'].id },
  });
  if (!existingLeader) {
    await prisma.applicabilityRule.create({
      data: {
        dimensionId:              dbDimensions['Competências de Liderança'].id,
        crossDepartmentAllowed:   false,
        sameDepartmentRequired:   true,
        minHierarchyRank:         5,
        blockedIfEvaluateeAboveEvaluator: true,
      },
    });
  }
  console.log('Seeded applicability rules.');

  // -------------------------------------------------------------------------
  // 6. WEIGHT RULES
  // -------------------------------------------------------------------------
  const weightRuleDefs = [
    {
      relationshipType:      'same_department_peer',
      sameDepartmentWeight:  1.0,
      crossDepartmentWeight: 1.0,
      categoryWeight:        1.0,
    },
    {
      relationshipType:      'cross_department_peer',
      sameDepartmentWeight:  1.0,
      crossDepartmentWeight: 0.7,
      categoryWeight:        0.8,
    },
    {
      relationshipType:      'manager_to_subordinate',
      sameDepartmentWeight:  1.0,
      crossDepartmentWeight: 1.0,
      categoryWeight:        1.5,
    },
    {
      relationshipType:      'manual_assignment',
      sameDepartmentWeight:  1.0,
      crossDepartmentWeight: 1.0,
      categoryWeight:        1.0,
    },
  ];

  for (const wr of weightRuleDefs) {
    const existing = await prisma.weightRule.findFirst({
      where: { relationshipType: wr.relationshipType },
    });
    if (!existing) {
      await prisma.weightRule.create({ data: wr });
    }
  }
  console.log('Seeded weight rules.');

  // -------------------------------------------------------------------------
  // 7. RETENTION POLICY
  // -------------------------------------------------------------------------
  const retentionDef = {
    name:                                  'Política Padrão (90 dias)',
    evaluationsVisibleUntilOffset:         90,
    exportsAllowedUntilOffset:             90,
    rawDataRetentionUntilOffset:           365,
    anonymizedSummaryRetentionUntilOffset: 730,
  };

  const dbRetention = await prisma.retentionPolicy.upsert({
    where:  { name: retentionDef.name },
    update: {},
    create: retentionDef,
  });
  console.log('Seeded retention policy.');

  // -------------------------------------------------------------------------
  // 8. BOOTSTRAP ADMIN (reads INITIAL_ADMIN_EMAIL from env)
  // -------------------------------------------------------------------------
  await bootstrapAdmin(prisma, env);

  // -------------------------------------------------------------------------
  // DEMO DATA SEEDING (Only if mode === 'demo')
  // -------------------------------------------------------------------------
  if (mode === 'demo') {
    console.log('Seeding demonstration data...');

    // 9. DEPARTMENTS (Demo)
    const departmentDefs = [
      { name: 'Direcção Geral',              parent: null },
      { name: 'Comercial',                   parent: 'Direcção Geral' },
      { name: 'Tecnologia & Sistemas',       parent: 'Direcção Geral' },
      { name: 'Recursos Humanos',            parent: 'Direcção Geral' },
      { name: 'Financeiro & Administrativo', parent: 'Direcção Geral' },
    ];

    const dbDepartments: Record<string, any> = {};

    // First pass — create without parent
    for (const dept of departmentDefs) {
      const created = await prisma.department.upsert({
        where:  { name: dept.name },
        update: {},
        create: { name: dept.name },
      });
      dbDepartments[dept.name] = created;
    }

    // Second pass — assign parents
    for (const dept of departmentDefs) {
      if (dept.parent) {
        await prisma.department.update({
          where: { id: dbDepartments[dept.name].id },
          data:  { parentDepartmentId: dbDepartments[dept.parent].id },
        });
      }
    }
    console.log(`Seeded ${Object.keys(dbDepartments).length} departments.`);

    // 10. ROLES (Demo)
    const roleDefs = [
      { name: 'Director Geral',         dept: 'Direcção Geral',              rank: 6 },
      { name: 'Gestor Comercial',        dept: 'Comercial',                   rank: 5 },
      { name: 'Técnico Comercial',       dept: 'Comercial',                   rank: 2 },
      { name: 'Gestor de Tecnologia',    dept: 'Tecnologia & Sistemas',       rank: 5 },
      { name: 'Técnico de Sistemas',     dept: 'Tecnologia & Sistemas',       rank: 2 },
      { name: 'Especialista de Sistemas',dept: 'Tecnologia & Sistemas',       rank: 3 },
      { name: 'Gestor de RH',            dept: 'Recursos Humanos',            rank: 5 },
      { name: 'Técnico de RH',           dept: 'Recursos Humanos',            rank: 2 },
      { name: 'Gestor Financeiro',       dept: 'Financeiro & Administrativo', rank: 5 },
      { name: 'Técnico Administrativo',  dept: 'Financeiro & Administrativo', rank: 2 },
    ];

    const dbRoles: Record<string, any> = {};
    for (const r of roleDefs) {
      const existing = await prisma.role.findFirst({
        where: { name: r.name, departmentId: dbDepartments[r.dept].id },
      });
      const role = existing ?? await prisma.role.create({
        data: {
          name:             r.name,
          departmentId:     dbDepartments[r.dept].id,
          hierarchyLevelId: dbHierarchyLevels[r.rank].id,
        },
      });
      dbRoles[r.name] = role;
    }
    console.log(`Seeded ${Object.keys(dbRoles).length} roles.`);

    // 11. UPDATE ADMIN WITH DEMO DATA IF ADMIN EMAIL EXISTS
    const adminEmail = env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
    if (adminEmail) {
      const adminInDb = await prisma.user.findUnique({ where: { workspaceEmail: adminEmail } });
      if (adminInDb) {
        await prisma.user.update({
          where: { workspaceEmail: adminEmail },
          data: {
            departmentId:     dbDepartments['Direcção Geral'].id,
            roleId:           dbRoles['Director Geral'].id,
            hierarchyLevelId: dbHierarchyLevels[6].id,
          },
        });
        console.log(`Admin user linked to demo department/role/hierarchy.`);
      }
    }

    // 12. USERS (Demo)
    const userDefs = [
      {
        name:  'Ana Ferreira',
        email: 'ana.direccao@example.test',
        dept:  'Direcção Geral',
        role:  'Director Geral',
        rank:  6,
        manager: null,
        appRole: 'ADMIN',
      },
      {
        name:  'Carlos Mendes',
        email: 'carlos.comercial@example.test',
        dept:  'Comercial',
        role:  'Gestor Comercial',
        rank:  5,
        manager: 'ana.direccao@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Fátima Lopes',
        email: 'fatima.comercial@example.test',
        dept:  'Comercial',
        role:  'Técnico Comercial',
        rank:  2,
        manager: 'carlos.comercial@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'João Baptista',
        email: 'joao.comercial@example.test',
        dept:  'Comercial',
        role:  'Técnico Comercial',
        rank:  2,
        manager: 'carlos.comercial@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Pedro Costa',
        email: 'pedro.tecnologia@example.test',
        dept:  'Tecnologia & Sistemas',
        role:  'Gestor de Tecnologia',
        rank:  5,
        manager: 'ana.direccao@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Mariana Silva',
        email: 'mariana.tecnologia@example.test',
        dept:  'Tecnologia & Sistemas',
        role:  'Especialista de Sistemas',
        rank:  3,
        manager: 'pedro.tecnologia@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Rui Andrade',
        email: 'rui.tecnologia@example.test',
        dept:  'Tecnologia & Sistemas',
        role:  'Técnico de Sistemas',
        rank:  2,
        manager: 'pedro.tecnologia@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Inês Rodrigues',
        email: 'ines.rh@example.test',
        dept:  'Recursos Humanos',
        role:  'Gestor de RH',
        rank:  5,
        manager: 'ana.direccao@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Sofia Neto',
        email: 'sofia.rh@example.test',
        dept:  'Recursos Humanos',
        role:  'Técnico de RH',
        rank:  2,
        manager: 'ines.rh@example.test',
        appRole: 'EMPLOYEE',
      },
      {
        name:  'Miguel Tavares',
        email: 'miguel.financas@example.test',
        dept:  'Financeiro & Administrativo',
        role:  'Gestor Financeiro',
        rank:  5,
        manager: 'ana.direccao@example.test',
        appRole: 'EMPLOYEE',
      },
    ];

    // First pass — create without managers
    const dbUsers: Record<string, any> = {};
    for (const u of userDefs) {
      const created = await prisma.user.upsert({
        where:  { workspaceEmail: u.email },
        update: {
          name:             u.name,
          departmentId:     dbDepartments[u.dept].id,
          roleId:           dbRoles[u.role].id,
          hierarchyLevelId: dbHierarchyLevels[u.rank].id,
          appRole:          u.appRole as any,
        },
        create: {
          name:             u.name,
          workspaceEmail:   u.email,
          departmentId:     dbDepartments[u.dept].id,
          roleId:           dbRoles[u.role].id,
          hierarchyLevelId: dbHierarchyLevels[u.rank].id,
          appRole:          u.appRole as any,
          status:           'ACTIVE',
        },
      });
      dbUsers[u.email] = created;
    }

    // Second pass — assign managers
    for (const u of userDefs) {
      if (u.manager && dbUsers[u.manager]) {
        await prisma.user.update({
          where: { workspaceEmail: u.email },
          data:  { managerId: dbUsers[u.manager].id },
        });
      }
    }
    console.log(`Seeded ${Object.keys(dbUsers).length} users.`);

    // 13. CYCLE (Demo)
    const cycleName = 'Avaliação 360º — Q3 2026';
    const existingCycle = await prisma.cycle.findFirst({ where: { name: cycleName } });

    if (!existingCycle) {
      const cycleCreator = dbUsers['ana.direccao@example.test'];
      await prisma.cycle.create({
        data: {
          name:             cycleName,
          description:      'Ciclo trimestral de avaliação por pares e hierarquia.',
          startAt:          new Date('2026-07-01T00:00:00.000Z'),
          endAt:            new Date('2026-09-30T23:59:59.000Z'),
          status:           'open',
          retentionPolicyId: dbRetention.id,
          createdById:      cycleCreator?.id ?? null,
        },
      });
      console.log('Seeded cycle.');
    } else {
      console.log('Cycle already exists — skipped.');
    }
  }

  console.log('Database seeding finished.');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  const args = process.argv.slice(2);
  const { mode, isDemoAllowed } = getModeAndGuard(args, process.env);

  console.log(`Running seed in [${mode}] mode.`);
  
  if (mode === 'demo') {
    if (!isDemoAllowed) {
      console.error('ERROR: Demo mode requires explicit approval. Run with --allow-demo-seed or set ALLOW_DEMO_SEED=true.');
      process.exit(1);
    }
    try {
      checkProductionGuard(process.env.DATABASE_URL, process.env.NODE_ENV);
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  }

  runSeed(prisma, mode, process.env, args)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
