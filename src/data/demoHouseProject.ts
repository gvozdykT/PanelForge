import type { PanelProject, WireConnection, WireRole } from '../types'
import { PROJECT_VERSION } from '../types'

/** ID модулів демо «Приватний будинок» за однолінійною схемою */
export const HOUSE_IDS = {
  meter: 'house-meter',
  main: 'house-main',
  fireRcd: 'house-fire-rcd',
  transferSw: 'house-transfer',
  voltRelay: 'house-volt-relay',
  nBus: 'house-n-bus',
  peBus: 'house-pe-bus',

  rcdKitchen: 'house-rcd-kitchen',
  mcbOven: 'house-mcb-oven',
  mcbDish: 'house-mcb-dish',
  mcbFridge: 'house-mcb-fridge',
  mcbKitSock: 'house-mcb-kit-sock',
  mcbKitLight: 'house-mcb-kit-light',
  mcbOutdoor: 'house-mcb-outdoor',

  rcdRooms: 'house-rcd-rooms',
  mcbKidsSock: 'house-mcb-kids-sock',
  mcbKidsLight: 'house-mcb-kids-light',
  mcbBedSock: 'house-mcb-bed-sock',
  mcbBedLight: 'house-mcb-bed-light',
  mcbAc: 'house-mcb-ac',

  rcdBath: 'house-rcd-bath',
  mcbWash: 'house-mcb-wash',
  mcbBoiler: 'house-mcb-boiler',
  mcbBathSock: 'house-mcb-bath-sock',
  mcbBathLight: 'house-mcb-bath-light',
  mcbFloor: 'house-mcb-floor',

  mcbGarageSub: 'house-mcb-garage-sub',
  mcbGarageLight: 'house-mcb-garage-light',
  mcbGarageSock: 'house-mcb-garage-sock',
  mcbBoilerSub: 'house-mcb-boiler-sub',
  mcbPumps: 'house-mcb-pumps',
  mcbBoilerAuto: 'house-mcb-boiler-auto',
} as const

function wire(
  id: string,
  fromMod: string,
  fromTerm: string,
  toMod: string,
  toTerm: string,
  role: WireConnection['role']
): WireConnection {
  return {
    id,
    from: { moduleId: fromMod, terminalId: fromTerm },
    to: { moduleId: toMod, terminalId: toTerm },
    role,
  }
}

/** 3P+N ланка між 4P приладами */
function wire4pChain(idPrefix: string, fromMod: string, toMod: string): WireConnection[] {
  const poles: { term: string; role: WireRole }[] = [
    { term: '0', role: 'L1' },
    { term: '1', role: 'L2' },
    { term: '2', role: 'L3' },
    { term: '3', role: 'N' },
  ]
  return poles.map(({ term, role }) =>
    wire(`${idPrefix}-${role.toLowerCase()}`, fromMod, `out-${term}`, toMod, `in-${term}`, role)
  )
}

/** fan-out 1P від RCD */
function fanL1(idPrefix: string, fromMod: string, fromTerm: string, targets: string[]): WireConnection[] {
  return targets.map((toMod, i) => wire(`${idPrefix}-${i}`, fromMod, fromTerm, toMod, 'in-0', 'L1'))
}

/** Проєкт за схемою приватного будинку — трифазний ввід 3×10 */
export function createHouseDemoProject(): PanelProject {
  const H = HOUSE_IDS

  const modules = [
    // ── Ряд 1: трифазний ввід ──
    {
      instanceId: H.meter,
      specId: 'meter-3ph-din',
      railId: 'rail-0',
      position: 0,
      label: 'Лічил. 3ф 3×10',
    },
    {
      instanceId: H.main,
      specId: 'mcb-4p-c32',
      railId: 'rail-0',
      position: 72,
      label: 'Ввідний 4P 32A',
    },
    {
      instanceId: H.fireRcd,
      specId: 'rcd-4p-63a-30ma',
      railId: 'rail-0',
      position: 144,
      label: 'ПЗВ 4P 300mA (пожеж.)',
    },
    {
      instanceId: H.transferSw,
      specId: 'eb-ats',
      railId: 'rail-0',
      position: 216,
      label: 'АВР / перекидний 4P',
    },
    {
      instanceId: H.voltRelay,
      specId: 'relay-voltage-63',
      railId: 'rail-0',
      position: 288,
      label: 'Реле напруги 63A',
    },
    { instanceId: H.nBus, specId: 'dist-n-6way', railId: 'rail-0', position: 324, label: 'N шина' },
    { instanceId: H.peBus, specId: 'dist-pe-6way', railId: 'rail-0', position: 342, label: 'PE шина' },

    // ── Ряд 2: групи (розведені по фазах L1 / L2 / L3) ──
    {
      instanceId: H.rcdKitchen,
      specId: 'rcd-2p-25a-30ma',
      railId: 'rail-1',
      position: 0,
      label: 'ПЗВ 25A · кухня · L1',
    },
    { instanceId: H.mcbOven, specId: 'mcb-1p-c16', railId: 'rail-1', position: 36, label: 'Духовка 16A' },
    { instanceId: H.mcbDish, specId: 'mcb-1p-c16', railId: 'rail-1', position: 54, label: 'Посудомийка 16A' },
    { instanceId: H.mcbFridge, specId: 'mcb-1p-c10', railId: 'rail-1', position: 72, label: 'Холодильник 10A' },
    { instanceId: H.mcbKitSock, specId: 'mcb-1p-c16', railId: 'rail-1', position: 90, label: 'Розетки кухня 16A' },
    { instanceId: H.mcbKitLight, specId: 'mcb-1p-c10', railId: 'rail-1', position: 108, label: 'Світло кухня 10A' },
    { instanceId: H.mcbOutdoor, specId: 'mcb-1p-c10', railId: 'rail-1', position: 126, label: 'Вуличне освіт. 10A' },

    {
      instanceId: H.rcdRooms,
      specId: 'rcd-2p-25a-30ma',
      railId: 'rail-1',
      position: 144,
      label: 'ПЗВ 25A · кімнати · L2',
    },
    { instanceId: H.mcbKidsSock, specId: 'mcb-1p-c16', railId: 'rail-1', position: 180, label: 'Розетки дитяча 16A' },
    { instanceId: H.mcbKidsLight, specId: 'mcb-1p-c10', railId: 'rail-1', position: 198, label: 'Світло дитяча 10A' },
    { instanceId: H.mcbBedSock, specId: 'mcb-1p-c16', railId: 'rail-1', position: 216, label: 'Розетки спальня 16A' },
    { instanceId: H.mcbBedLight, specId: 'mcb-1p-c10', railId: 'rail-1', position: 234, label: 'Світло спальня 10A' },
    { instanceId: H.mcbAc, specId: 'mcb-1p-c16', railId: 'rail-1', position: 252, label: 'Кондиціонер 16A · L2' },

    {
      instanceId: H.rcdBath,
      specId: 'rcd-2p-25a-10ma',
      railId: 'rail-1',
      position: 270,
      label: 'ПЗВ 10mA · санвузол · L3',
    },
    { instanceId: H.mcbWash, specId: 'mcb-1p-c16', railId: 'rail-1', position: 306, label: 'Пральна машина 16A' },
    { instanceId: H.mcbBoiler, specId: 'mcb-1p-c16', railId: 'rail-1', position: 324, label: 'Бойлер 16A' },
    { instanceId: H.mcbBathSock, specId: 'mcb-1p-c16', railId: 'rail-1', position: 342, label: 'Розетка санвузол 16A' },
    { instanceId: H.mcbBathLight, specId: 'mcb-1p-c10', railId: 'rail-1', position: 360, label: 'Світло санвузол 10A' },
    { instanceId: H.mcbFloor, specId: 'mcb-1p-c16', railId: 'rail-1', position: 378, label: 'Тепла підлога 16A · L3' },

    // ── Ряд 3: гараж / котельня (L1) ──
    { instanceId: H.mcbGarageSub, specId: 'mcb-1p-c20', railId: 'rail-2', position: 0, label: 'Автомат гараж 20A · L2' },
    { instanceId: H.mcbGarageLight, specId: 'mcb-1p-c10', railId: 'rail-2', position: 18, label: 'Світло гараж 10A' },
    { instanceId: H.mcbGarageSock, specId: 'mcb-1p-c16', railId: 'rail-2', position: 36, label: 'Розетки гараж 16A' },
    { instanceId: H.mcbBoilerSub, specId: 'mcb-1p-c20', railId: 'rail-2', position: 54, label: 'Автомат котельня 20A · L3' },
    { instanceId: H.mcbPumps, specId: 'mcb-1p-c10', railId: 'rail-2', position: 72, label: 'Насоси 10A' },
    { instanceId: H.mcbBoilerAuto, specId: 'mcb-1p-c10', railId: 'rail-2', position: 90, label: 'Автоматика котла 10A' },
  ]

  const wires: WireConnection[] = [
    // Ввід 3P+N: лічильник → автомат → ПЗВ → АВР
    ...wire4pChain('h-w-meter-main', H.meter, H.main),
    ...wire4pChain('h-w-main-fire', H.main, H.fireRcd),
    ...wire4pChain('h-w-fire-ats', H.fireRcd, H.transferSw),

    // Реле напруги + гребінка (контроль по L1+N після АВР)
    wire('h-w-ats-relay-l', H.transferSw, 'out-0', H.voltRelay, 'in-l', 'L1'),
    wire('h-w-ats-relay-n', H.transferSw, 'out-3', H.voltRelay, 'in-n', 'N'),

    // L1 — вуличне освітлення
    wire('h-w-relay-outdoor', H.voltRelay, 'out', H.mcbOutdoor, 'in-0', 'L1'),
    // L2 — гараж
    wire('h-w-ats-garage', H.transferSw, 'out-1', H.mcbGarageSub, 'in-0', 'L2'),
    // L3 — котельня
    wire('h-w-ats-boiler', H.transferSw, 'out-2', H.mcbBoilerSub, 'in-0', 'L3'),

    // N шина
    wire('h-w-ats-nbus', H.transferSw, 'out-3', H.nBus, 'n-0', 'N'),
    wire('h-w-rcd1-n', H.rcdKitchen, 'out-n', H.nBus, 'n-1', 'N'),
    wire('h-w-rcd2-n', H.rcdRooms, 'out-n', H.nBus, 'n-2', 'N'),
    wire('h-w-rcd3-n', H.rcdBath, 'out-n', H.nBus, 'n-3', 'N'),
    wire('h-w-n-rcd1-in', H.nBus, 'n-0', H.rcdKitchen, 'in-n', 'N'),
    wire('h-w-n-rcd2-in', H.nBus, 'n-0', H.rcdRooms, 'in-n', 'N'),
    wire('h-w-n-rcd3-in', H.nBus, 'n-0', H.rcdBath, 'in-n', 'N'),

    wire('h-w-pe', H.peBus, 'pe-0', H.peBus, 'pe-1', 'PE'),

    // Групи по фазах: L1 кухня, L2 кімнати, L3 санвузол
    wire('h-w-ats-rcd1', H.transferSw, 'out-0', H.rcdKitchen, 'in-l', 'L1'),
    wire('h-w-ats-rcd2', H.transferSw, 'out-1', H.rcdRooms, 'in-l', 'L2'),
    wire('h-w-ats-rcd3', H.transferSw, 'out-2', H.rcdBath, 'in-l', 'L3'),

    ...fanL1('h-w-rcd1', H.rcdKitchen, 'out-l', [
      H.mcbOven,
      H.mcbDish,
      H.mcbFridge,
      H.mcbKitSock,
      H.mcbKitLight,
    ]),

    ...fanL1('h-w-rcd2', H.rcdRooms, 'out-l', [
      H.mcbKidsSock,
      H.mcbKidsLight,
      H.mcbBedSock,
      H.mcbBedLight,
    ]),
    wire('h-w-ac', H.transferSw, 'out-1', H.mcbAc, 'in-0', 'L2'),

    ...fanL1('h-w-rcd3', H.rcdBath, 'out-l', [
      H.mcbWash,
      H.mcbBoiler,
      H.mcbBathSock,
      H.mcbBathLight,
    ]),
    wire('h-w-floor', H.transferSw, 'out-2', H.mcbFloor, 'in-0', 'L3'),

    // Гараж / котельня — L1 з реле напруги
    wire('h-w-garage-light', H.mcbGarageSub, 'out-0', H.mcbGarageLight, 'in-0', 'L1'),
    wire('h-w-garage-sock', H.mcbGarageSub, 'out-0', H.mcbGarageSock, 'in-0', 'L1'),
    wire('h-w-pumps', H.mcbBoilerSub, 'out-0', H.mcbPumps, 'in-0', 'L1'),
    wire('h-w-boiler-auto', H.mcbBoilerSub, 'out-0', H.mcbBoilerAuto, 'in-0', 'L1'),
  ]

  return {
    version: PROJECT_VERSION,
    id: 'demo-house-diagram',
    name: 'Приватний будинок (схема)',
    phaseCount: 3,
    groundingSystem: 'TN-C-S',
    enclosureId: 'enc-54x3',
    modules,
    wires,
    updatedAt: new Date().toISOString(),
  }
}

export const DEMO_HOUSE_PROJECT = createHouseDemoProject()
