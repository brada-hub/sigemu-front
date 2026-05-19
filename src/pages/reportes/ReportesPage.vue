<template>
  <q-page class="q-pa-lg reportes-page">
    <!-- Bienvenida y Header -->
    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="text-h4 text-weight-bolder">Generador de Reportes</div>
        <div class="text-subtitle2 text-grey-7">Filtra, visualiza y exporta listados detallados con formato institucional</div>
      </div>
      <div class="col-auto gt-sm">
        <q-chip outline color="primary" icon="today" class="text-weight-medium">
          {{ fechaHoy }}
        </q-chip>
      </div>
    </div>

    <div>
      <!-- ═══ FILTROS ═══ -->
      <q-card flat class="filtros-card q-mb-lg">
        <q-card-section class="q-pb-none">
          <div class="row items-center q-mb-md">
            <q-icon name="filter_alt" size="sm" color="primary" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold text-primary">Filtros Dinámicos</span>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select v-model="filtrosDin.festividad_id" :options="festividadesStore.festividades"
                option-value="id_festividad" option-label="nombre" emit-value map-options clearable
                label="Festividad" outlined dense>
                <template #prepend><q-icon name="celebration" color="primary" /></template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="filtrosDin.id_bloque" :options="bloquesStore.bloques"
                option-value="id_bloque" option-label="nombre" emit-value map-options clearable
                label="Bloque" outlined dense>
                <template #prepend><q-icon name="account_tree" color="primary" /></template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="filtrosDin.id_tipo_fraterno" :options="tiposFraternos"
                option-value="id_tipo_fraterno" option-label="nombre" emit-value map-options clearable
                label="Tipo de Fraterno" outlined dense>
                <template #prepend><q-icon name="badge" color="primary" /></template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="filtrosDin.metodo_pago"
                :options="['Efectivo', 'Transferencia', 'QR', 'Otro']" clearable
                label="Método de Pago" outlined dense>
                <template #prepend><q-icon name="credit_card" color="primary" /></template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="filtrosDin.registrado_por_id" :options="usuarios"
                option-value="id_user"
                :option-label="(u: any) => u.persona ? `${u.persona.nombres} ${u.persona.primer_apellido || ''}`.trim() : u.username"
                emit-value map-options clearable
                label="Recibido Por (Cajero)" outlined dense>
                <template #prepend><q-icon name="person" color="primary" /></template>
              </q-select>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="row justify-end q-gutter-sm">
          <q-btn class="bg-unitepc-teal text-white" icon="file_download"
            label="Exportar Excel" @click="exportarExcel"
            :disable="!filasAgrupadas.length" no-caps />
        </q-card-section>
      </q-card>

      <!-- ═══ RESUMEN ESTADÍSTICO ═══ -->
      <div v-if="filasAgrupadas.length" class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-4">
          <q-card flat class="stat-card bg-unitepc-indigo sso-grid">
            <q-card-section class="text-center text-on-gradient">
              <q-icon name="people" size="md" class="q-mb-xs" />
              <div class="text-h4 text-weight-bolder">{{ totalFraternos }}</div>
              <div class="text-caption" style="opacity:.85">Fraternos Únicos</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card flat class="stat-card bg-unitepc-green sso-grid">
            <q-card-section class="text-center text-on-gradient">
              <q-icon name="payments" size="md" class="q-mb-xs" />
              <div class="text-h4 text-weight-bolder">Bs. {{ totalMonto.toFixed(2) }}</div>
              <div class="text-caption" style="opacity:.85">Total Recaudado</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-4">
          <q-card flat class="stat-card bg-unitepc-dark sso-grid">
            <q-card-section class="text-center text-on-gradient">
              <q-icon name="receipt_long" size="md" class="q-mb-xs" />
              <div class="text-h4 text-weight-bolder">{{ totalPagosCount }}</div>
              <div class="text-caption" style="opacity:.85">Transacciones Totales</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ═══ TABLA REPORTE CON FILAS POR PAGO ═══ -->
      <q-card v-if="filasAgrupadas.length > 0" flat class="reporte-table-card">
        <q-card-section class="q-pb-none row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold text-primary">
            <q-icon name="table_chart" class="q-mr-xs" />Vista Previa del Reporte
          </div>
          <q-badge color="deep-purple" :label="`${totalFraternos} fraternos — ${totalPagosCount} pagos`" />
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <div class="reporte-tabla-wrap">
            <table class="reporte-tabla">
              <thead>
                <tr>
                  <th class="th-num">#</th>
                  <th>Fraterno</th>
                  <th>C.I.</th>
                  <th>Bloque</th>
                  <th>Tipo</th>
                  <th class="text-right">Monto Registrado</th>
                  <th>FECHA</th>
                  <th>HORA</th>
                  <th>Método</th>
                  <th>Recibido Por</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(grupo, gi) in filasAgrupadas" :key="gi">
                  <tr v-for="(pago, pi) in grupo.pagos" :key="`${gi}-${pi}`"
                      :class="gi % 2 === 0 ? 'fila-par' : 'fila-impar'">
                    <!-- # — solo primera fila del grupo -->
                    <td v-if="pi === 0" :rowspan="grupo.pagos.length" class="td-num">{{ gi + 1 }}</td>
                    <!-- Fraterno — merge -->
                    <td v-if="pi === 0" :rowspan="grupo.pagos.length" class="td-fraterno">
                      {{ grupo.fraterno }}
                    </td>
                    <!-- CI — merge -->
                    <td v-if="pi === 0" :rowspan="grupo.pagos.length">{{ grupo.ci || '—' }}</td>
                    <!-- Bloque — merge -->
                    <td v-if="pi === 0" :rowspan="grupo.pagos.length">{{ grupo.bloque }}</td>
                    <!-- Tipo — merge -->
                    <td v-if="pi === 0" :rowspan="grupo.pagos.length">{{ grupo.tipo }}</td>
                    <!-- Monto — cada pago -->
                    <td class="text-right">
                      <span class="monto-badge">Bs. {{ Number(pago.monto_pagado).toFixed(2) }}</span>
                    </td>
                    <!-- Fecha -->
                    <td>{{ formatFecha(pago.created_at) }}</td>
                    <!-- Hora -->
                    <td>{{ formatHora(pago.created_at) }}</td>
                    <!-- Método -->
                    <td>
                      <q-badge v-if="!pago._dummy" :color="getMetodoColor(pago.metodo_pago)" text-color="white"
                        :label="pago.metodo_pago || '—'" class="text-weight-medium" />
                      <q-badge v-else color="grey-6" text-color="white" label="Sin pagos" class="text-weight-medium" />
                    </td>
                    <!-- Recibido Por -->
                    <td class="text-uppercase text-weight-medium">
                      {{ pago._dummy ? '—' : getNombreCajero(pago) }}
                    </td>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right text-weight-bold">TOTAL:</td>
                  <td class="text-right">
                    <span class="monto-badge monto-total">Bs. {{ totalMonto.toFixed(2) }}</span>
                  </td>
                  <td colspan="4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </q-card-section>
      </q-card>

      <!-- ═══ EMPTY STATES ═══ -->
      <AppEmptyState v-else-if="yaBusco" icon="search_off" title="Sin resultados"
        message="No se encontraron registros con los filtros seleccionados" />
      <AppEmptyState v-else icon="table_chart" title="Generador Listo"
        message="Seleccione una festividad para generar el reporte" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { useFestividadesStore } from 'src/stores/festividades.store'
import { useBloquesStore } from 'src/stores/bloques.store'
import { pagosApi } from 'src/api/pagos.api'
import client from 'src/api/client'
import AppEmptyState from 'src/components/common/AppEmptyState.vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface GrupoFraterno {
  fraterno: string
  ci: string
  bloque: string
  tipo: string
  pagos: any[]
}

const $q = useQuasar()
const festividadesStore = useFestividadesStore()
const bloquesStore = useBloquesStore()

const tiposFraternos = ref<any[]>([])
const usuarios = ref<any[]>([])
const generando = ref(false)
const yaBusco = ref(false)
const inscripcionesRaw = ref<any[]>([])

const filtrosDin = ref({
  festividad_id: null as number | null,
  id_bloque: null as number | null,
  id_tipo_fraterno: null as number | null,
  metodo_pago: null as string | null,
  registrado_por_id: null as number | null
})

const fechaHoy = computed(() => date.formatDate(Date.now(), 'DD/MM/YYYY'))

/* ── Mapear inscripciones a grupos ── */
const filasAgrupadas = computed<GrupoFraterno[]>(() => {
  return inscripcionesRaw.value.map((ins: any) => {
    return {
      fraterno: `${ins.persona?.nombres || ''} ${ins.persona?.primer_apellido || ''} ${ins.persona?.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim(),
      ci: ins.persona?.ci || '',
      bloque: ins.bloque?.nombre || 'No asignado',
      tipo: ins.tipo_fraterno?.nombre || 'Antiguo',
      pagos: ins.pagos && ins.pagos.length > 0 ? ins.pagos : [{ monto_pagado: 0, _dummy: true, created_at: ins.inscrito_at || ins.created_at }]
    }
  })
})

const totalMonto = computed(() =>
  inscripcionesRaw.value.reduce((sum: number, ins: any) => 
    sum + (ins.pagos || []).reduce((s: number, p: any) => s + Number(p.monto_pagado || 0), 0)
  , 0)
)
const totalPagosCount = computed(() => 
  inscripcionesRaw.value.reduce((count: number, ins: any) => count + (ins.pagos ? ins.pagos.length : 0), 0)
)
const totalFraternos = computed(() => filasAgrupadas.value.length)

/* ── Helpers ── */
function formatFecha(d: string) { return date.formatDate(d, 'D/M/YYYY') }
function formatHora(d: string) { return date.formatDate(d, 'HH:mm:ss') }

function getNombreCajero(pago: any): string {
  if (pago._dummy) return '—'
  if (pago.registrado_por?.persona) {
    return `${pago.registrado_por.persona.nombres} ${pago.registrado_por.persona.primer_apellido || ''}`.trim()
  }
  return pago.registrado_por?.username || 'Sistema'
}

function getMetodoColor(metodo: string) {
  const m: Record<string, string> = { Efectivo: 'teal-8', Transferencia: 'indigo-8', QR: 'deep-purple-8', Otro: 'blue-grey-7' }
  return m[metodo] || 'grey-7'
}

/* ── Watch filtros ── */
watch(filtrosDin, () => {
  if (filtrosDin.value.festividad_id) generarReporte()
}, { deep: true })

/* ── Mount ── */
onMounted(async () => {
  await festividadesStore.cargar()
  await bloquesStore.cargar()
  const [tf, us] = await Promise.all([
    client.get('/tipos-fraternos'),
    client.get('/usuarios?has_pagos=true')
  ])
  tiposFraternos.value = tf.data.data || tf.data
  usuarios.value = us.data.data || us.data
  if (festividadesStore.festividades.length > 0) {
    filtrosDin.value.festividad_id = festividadesStore.festividades[0]?.id_festividad as any
    generarReporte()
  }
})

/* ── Generar ── */
async function generarReporte() {
  generando.value = true
  yaBusco.value = true
  try {
    const { data } = await client.get('/reportes/generador', { params: filtrosDin.value })
    inscripcionesRaw.value = data.data || data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al generar reporte' })
  } finally {
    generando.value = false
  }
}

/* ══════════════════════════════════════════════════════════════
   EXPORTAR EXCEL CON COLORES INSTITUCIONALES + MERGE POR FRATERNO
   ══════════════════════════════════════════════════════════════ */
async function exportarExcel() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SIGEMU – Morenada UNITEPC'
  const ws = wb.addWorksheet('Reporte de Pagos', {
    views: [{ state: 'frozen', ySplit: 2 }]
  })

  // ── Colores institucionales ──
  const purpleDark = '4F2789'
  const indigoDark = '1A237E'
  const tealDark = '004D40'
  const tealLight = '00796B'
  const cyanAccent = '00C2CB'
  const lightPurpleBg = 'F3EDFF'
  const whiteBg = 'FFFFFF'

  // ── Fuentes ──
  const fontHeader: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' }
  const fontTitle: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14, name: 'Calibri' }
  const fontNormal: Partial<ExcelJS.Font> = { size: 10, name: 'Calibri' }
  const fontBold: Partial<ExcelJS.Font> = { bold: true, size: 10, name: 'Calibri' }
  const fontMonto: Partial<ExcelJS.Font> = { bold: true, size: 10, name: 'Calibri', color: { argb: `FF${tealDark}` } }
  const fontTotal: Partial<ExcelJS.Font> = { bold: true, size: 12, name: 'Calibri', color: { argb: 'FFFFFFFF' } }

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
  }

  const headers = ['#', 'Fraterno', 'C.I.', 'Bloque', 'Tipo', 'Monto Registrado', 'FECHA', 'HORA', 'Método', 'Recibido Por']
  const colWidths = [5, 28, 12, 18, 14, 18, 16, 12, 14, 28]

  // ── Fila 1: Título institucional ──
  ws.mergeCells('A1:J1')
  const titleCell = ws.getCell('A1')
  const festObj = festividadesStore.festividades.find((f: any) => f.id_festividad === filtrosDin.value.festividad_id) as any
  titleCell.value = `REPORTE DE PAGOS — ${festObj?.nombre || 'General'} — ${fechaHoy.value}`
  titleCell.font = fontTitle
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  titleCell.fill = { type: 'gradient', gradient: 'angle', degree: 135, stops: [
    { position: 0, color: { argb: `FF${purpleDark}` } },
    { position: 1, color: { argb: `FF${cyanAccent}` } }
  ]}
  ws.getRow(1).height = 36

  // ── Fila 2: Headers ──
  const headerRow = ws.addRow(headers)
  headerRow.height = 24
  headerRow.eachCell((cell, colNum) => {
    cell.font = fontHeader
    cell.alignment = { horizontal: colNum === 6 ? 'right' : 'center', vertical: 'middle' }
    cell.fill = { type: 'gradient', gradient: 'angle', degree: 135, stops: [
      { position: 0, color: { argb: `FF${purpleDark}` } },
      { position: 1, color: { argb: `FF${indigoDark}` } }
    ]}
    cell.border = borderThin
  })

  // ── Filas de datos con merge por fraterno ──
  let currentRow = 3
  let num = 0
  filasAgrupadas.value.forEach((grupo) => {
    num++
    const startRow = currentRow
    const count = grupo.pagos.length

    grupo.pagos.forEach((pago: any, pi: number) => {
      const isEven = (num % 2 === 0)
      const bgColor = isEven ? lightPurpleBg : whiteBg
      const fillStyle: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgColor}` } }

      const rowData = [
        pi === 0 ? num : '',
        pi === 0 ? grupo.fraterno : '',
        pi === 0 ? grupo.ci : '',
        pi === 0 ? grupo.bloque : '',
        pi === 0 ? grupo.tipo : '',
        Number(pago.monto_pagado),
        formatFecha(pago.created_at),
        formatHora(pago.created_at),
        pago._dummy ? '—' : (pago.metodo_pago || ''),
        pago._dummy ? '—' : getNombreCajero(pago)
      ]

      const row = ws.addRow(rowData)
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.font = colNum === 6 ? fontMonto : (colNum <= 5 && pi === 0 ? fontBold : fontNormal)
        cell.fill = fillStyle
        cell.border = borderThin
        cell.alignment = {
          horizontal: colNum === 6 ? 'right' : (colNum === 1 ? 'center' : 'left'),
          vertical: 'middle',
          wrapText: colNum === 10
        }
      })
      // Format monto as currency
      row.getCell(6).numFmt = '"Bs." #,##0.00'
      currentRow++
    })

    // Merge fraterno columns if multiple pagos
    if (count > 1) {
      const endRow = startRow + count - 1
      ws.mergeCells(startRow, 1, endRow, 1) // #
      ws.mergeCells(startRow, 2, endRow, 2) // Fraterno
      ws.mergeCells(startRow, 3, endRow, 3) // CI
      ws.mergeCells(startRow, 4, endRow, 4) // Bloque
      ws.mergeCells(startRow, 5, endRow, 5) // Tipo
    }
  })

  // ── Fila TOTAL ──
  const totalRowData = ['', '', '', '', 'TOTAL:', totalMonto.value, '', '', '', '']
  const tRow = ws.addRow(totalRowData)
  tRow.height = 28
  tRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.font = fontTotal
    cell.fill = { type: 'gradient', gradient: 'angle', degree: 135, stops: [
      { position: 0, color: { argb: `FF${tealDark}` } },
      { position: 1, color: { argb: `FF${tealLight}` } }
    ]}
    cell.border = borderThin
    cell.alignment = { horizontal: colNum === 6 ? 'right' : (colNum === 5 ? 'right' : 'center'), vertical: 'middle' }
  })
  tRow.getCell(6).numFmt = '"Bs." #,##0.00'

  // ── Column widths ──
  colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w })

  // ── Export ──
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const nombre = festObj?.nombre || 'General'
  saveAs(blob, `Reporte_${nombre}_${date.formatDate(Date.now(), 'YYYY-MM-DD')}.xlsx`)
  $q.notify({ type: 'positive', message: 'Excel exportado exitosamente', icon: 'check_circle' })
}
</script>

<style scoped>
.filtros-card {
  border-radius: 16px;
  border: 1px solid rgba(79, 39, 137, 0.12);
  background: #fff;
  box-shadow: 0 4px 24px rgba(79, 39, 137, 0.06);
}
body.body--dark .filtros-card {
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.reporte-table-card {
  border-radius: 16px;
  border: 1px solid rgba(79, 39, 137, 0.10);
  background: #fff;
  box-shadow: 0 4px 24px rgba(79, 39, 137, 0.06);
  overflow: hidden;
}
body.body--dark .reporte-table-card {
  background: #1e1e24;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.reporte-tabla-wrap { width: 100%; overflow-x: auto; }
.reporte-tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 850px;
}
.reporte-tabla thead tr {
  background: linear-gradient(135deg, #4f2789 0%, #303f9f 100%);
}
.reporte-tabla th {
  color: #fff;
  padding: 10px 12px;
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  border: none;
}
.reporte-tabla th.th-num { width: 40px; text-align: center; }

.reporte-tabla td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(79,39,137,0.07);
  vertical-align: middle;
}
body.body--dark .reporte-tabla td {
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.reporte-tabla td.td-num {
  text-align: center;
  font-weight: 700;
  color: #4f2789;
}
body.body--dark .reporte-tabla td.td-num {
  color: #b388ff;
}

.reporte-tabla td.td-fraterno {
  font-weight: 600;
  color: #1a237e;
}
body.body--dark .reporte-tabla td.td-fraterno {
  color: #8c9eff;
}

.reporte-tabla .fila-par { background: #faf8ff; }
.reporte-tabla .fila-impar { background: #fff; }

body.body--dark .reporte-tabla .fila-par { background: rgba(255, 255, 255, 0.02); }
body.body--dark .reporte-tabla .fila-impar { background: transparent; }

.reporte-tabla tbody tr:hover { background: rgba(79, 39, 137, 0.06); transition: background 0.15s ease; }
body.body--dark .reporte-tabla tbody tr:hover { background: rgba(255, 255, 255, 0.08); }

.monto-badge {
  display: inline-block;
  background: linear-gradient(135deg, #00796b, #004d40);
  color: #fff;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.82rem;
  white-space: nowrap;
}
.monto-total {
  background: linear-gradient(135deg, #4f2789, #00c2cb);
  font-size: 0.95rem;
  padding: 4px 14px;
}

.reporte-tabla tfoot tr {
  background: linear-gradient(135deg, rgba(79,39,137,0.08), rgba(0,194,203,0.08));
  border-top: 2px solid #4f2789;
}
body.body--dark .reporte-tabla tfoot tr {
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border-top: 2px solid #8c9eff;
}

.reporte-tabla tfoot td { padding: 10px 12px; font-size: 0.9rem; }
</style>
