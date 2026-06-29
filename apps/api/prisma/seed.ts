import { PrismaClient } from '@prisma/client';
import { bootstrapAdmin } from '../src/database/seed-admin';

export async function runSeed(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv = process.env,
) {
  console.log('Seeding database...');

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
  // 2. DEPARTMENTS
  // -------------------------------------------------------------------------
  const departmentDefs = [
    { name: 'Direcção Geral',              parent: null },
    { name: 'Comercial',                   parent: 'Direcção Geral' },
    { name: 'Tecnologia & Sistemas',       parent: 'Direcção Geral' },
    { name: 'Recursos Humanos',            parent: 'Direcção Geral' },
    { name: 'Financeiro & Administrativo', parent: 'Direcção Geral' },
  ];

  const dbDepartments: Record<string, any> = {};

  // First pass — create without parent so FK is satisfied
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

  // -------------------------------------------------------------------------
  // 3. ROLES
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // 4. BOOTSTRAP ADMIN (reads INITIAL_ADMIN_EMAIL from env)
  // -------------------------------------------------------------------------
  await bootstrapAdmin(prisma, env);

  // -------------------------------------------------------------------------
  // 5. UPDATE ADMIN WITH STRUCTURAL DATA
  // -------------------------------------------------------------------------
  const adminEmail = env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
  if (adminEmail) {
    await prisma.user.update({
      where: { workspaceEmail: adminEmail },
      data: {
        departmentId:     dbDepartments['Direcção Geral'].id,
        roleId:           dbRoles['Director Geral'].id,
        hierarchyLevelId: dbHierarchyLevels[6].id,
      },
    });
    console.log(`Admin user updated with structural data.`);
  }

  // -------------------------------------------------------------------------
  // 6. USERS
  // -------------------------------------------------------------------------
  const userDefs = [
    {
      name:  'Ana Ferreira',
      email: 'ana.ferreira@persistech.ao',
      dept:  'Direcção Geral',
      role:  'Director Geral',
      rank:  6,
      manager: null,
      appRole: 'ADMIN',
    },
    {
      name:  'Carlos Mendes',
      email: 'carlos.mendes@persistech.ao',
      dept:  'Comercial',
      role:  'Gestor Comercial',
      rank:  5,
      manager: 'ana.ferreira@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Fátima Lopes',
      email: 'fatima.lopes@persistech.ao',
      dept:  'Comercial',
      role:  'Técnico Comercial',
      rank:  2,
      manager: 'carlos.mendes@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'João Baptista',
      email: 'joao.baptista@persistech.ao',
      dept:  'Comercial',
      role:  'Técnico Comercial',
      rank:  2,
      manager: 'carlos.mendes@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Pedro Costa',
      email: 'pedro.costa@persistech.ao',
      dept:  'Tecnologia & Sistemas',
      role:  'Gestor de Tecnologia',
      rank:  5,
      manager: 'ana.ferreira@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Mariana Silva',
      email: 'mariana.silva@persistech.ao',
      dept:  'Tecnologia & Sistemas',
      role:  'Especialista de Sistemas',
      rank:  3,
      manager: 'pedro.costa@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Rui Andrade',
      email: 'rui.andrade@persistech.ao',
      dept:  'Tecnologia & Sistemas',
      role:  'Técnico de Sistemas',
      rank:  2,
      manager: 'pedro.costa@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Inês Rodrigues',
      email: 'ines.rodrigues@persistech.ao',
      dept:  'Recursos Humanos',
      role:  'Gestor de RH',
      rank:  5,
      manager: 'ana.ferreira@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Sofia Neto',
      email: 'sofia.neto@persistech.ao',
      dept:  'Recursos Humanos',
      role:  'Técnico de RH',
      rank:  2,
      manager: 'ines.rodrigues@persistech.ao',
      appRole: 'EMPLOYEE',
    },
    {
      name:  'Miguel Tavares',
      email: 'miguel.tavares@persistech.ao',
      dept:  'Financeiro & Administrativo',
      role:  'Gestor Financeiro',
      rank:  5,
      manager: 'ana.ferreira@persistech.ao',
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

  // -------------------------------------------------------------------------
  // 7. DIMENSIONS
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
  // 8. CRITERIA
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
  // 9. CRITERION OPTIONS (uniform scale — applied to every criterion)
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
  // 10. APPLICABILITY RULES
  // -------------------------------------------------------------------------

  // Competências Corporativas — todos avaliam todos
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

  // Competências Técnicas — mesmo dept preferencial, cross permitido
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

  // Competências de Liderança — só para rank >= 5, bloqueado se avaliado acima
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
  // 11. WEIGHT RULES
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
  // 12. RETENTION POLICY
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
  // 13. CYCLE
  // -------------------------------------------------------------------------
  const cycleName = 'Avaliação 360º — Q3 2026';
  const existingCycle = await prisma.cycle.findFirst({ where: { name: cycleName } });

  if (!existingCycle) {
    const cycleCreator = dbUsers['ana.ferreira@persistech.ao'];
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

  console.log('Database seeding finished.');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  runSeed(prisma, process.env)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
