<template>
  <div class="ticket-impresion" id="impresion-ticket">
    <div class="ticket-container">
      <div class="header row items-center">
        <div class="col-auto logo-container">
          <img src="~assets/sigemu.png" alt="Logo" class="logo" />
        </div>
        <div class="col text-center title-container">
          <h2 class="ticket-title">TICKET DE MORENADA UNITEPC</h2>
          <div class="ticket-subtitle">COMPROBANTE DE PAGO N° {{ pago?.nro_comprobante || 'S/N' }}</div>
        </div>
      </div>

      <table class="ticket-table">
        <tbody>
          <tr>
            <th class="label">NOMBRE</th>
            <td class="value">{{ fraternoNombre }}</td>
          </tr>
          <tr>
            <th class="label">TIPO DE PAGO</th>
            <td class="value">{{ pago?.metodo_pago }}</td>
          </tr>
          <tr>
            <th class="label">NOMBRE DE BLOQUE</th>
            <td class="value">{{ inscripcion?.bloque?.nombre || 'SIN BLOQUE' }}</td>
          </tr>
          <tr>
            <th class="label">FRATERNO</th>
            <td class="value">{{ inscripcion?.tipo_fraterno?.nombre || 'NUEVO' }}</td>
          </tr>
          <tr>
            <th class="label">MONTO</th>
            <td class="value">Bs. {{ pago?.monto_pagado }}</td>
          </tr>
          <tr>
            <th class="label">SALDO</th>
            <td class="value">Bs. {{ inscripcion?.saldo_pendiente }}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer row justify-between items-end">
        <div class="firma-box">
          <div class="firma-line"></div>
          <div class="firma-label">FIRMA / SELLO DE PAGO</div>
        </div>
        <div class="fecha-box text-right">
          <div class="fecha-text">Fecha: {{ pago?.fecha_pago }} {{ pago?.hora_pago }}</div>
          <div class="fecha-text">Recibido por: {{ usuarioRegistro }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pago: any
}>()

const inscripcion = computed(() => props.pago?.inscripcion)

const fraternoNombre = computed(() => {
  const persona = inscripcion.value?.persona
  if (!persona) return ''
  return `${persona.nombres} ${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.trim().toUpperCase()
})

const usuarioRegistro = computed(() => {
  const u = props.pago?.registrado_por
  if (u?.persona?.nombres) {
    return `${u.persona.nombres} ${u.persona.primer_apellido || ''}`.trim()
  }
  return u?.username || ''
})
</script>

<style scoped>
/* Estos estilos aplican para la visualización y se forzarán en la impresión */
.ticket-impresion {
  display: none; /* Por defecto oculto, solo visible en @media print o cuando se invoque */
  background: white;
  color: black;
  font-family: Arial, Helvetica, sans-serif;
  width: 100%;
}

@media print {
  body * {
    visibility: hidden;
  }
  
  .ticket-impresion, .ticket-impresion * {
    visibility: visible;
  }

  .ticket-impresion {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  @page {
    margin: 0;
    size: auto;
  }
}

.ticket-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #000;
  box-sizing: border-box;
}

.header {
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.logo {
  width: 80px;
  height: auto;
}

.ticket-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding: 0;
  text-align: center;
}

.ticket-subtitle {
  font-size: 14px;
  margin-top: 5px;
  text-align: center;
}

.ticket-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}

.ticket-table th, .ticket-table td {
  border: 1px solid #000;
  padding: 8px 12px;
  font-size: 14px;
}

.ticket-table th.label {
  width: 35%;
  text-align: left;
  font-weight: bold;
  background-color: #f0f0f0; /* Color gris suave */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.ticket-table td.value {
  text-align: right;
  font-weight: normal;
}

.footer {
  margin-top: 40px;
}

.firma-box {
  width: 250px;
  text-align: center;
}

.firma-line {
  border-bottom: 1px solid #000;
  margin-bottom: 5px;
  height: 40px; /* Espacio para la firma */
}

.firma-label {
  font-size: 12px;
  font-weight: bold;
}

.fecha-box {
  font-size: 12px;
}
.fecha-text {
  margin-bottom: 4px;
}
</style>
