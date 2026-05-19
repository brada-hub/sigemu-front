import { useQuasar } from 'quasar'

export function useNotificacion() {
  const $q = useQuasar()

  function notificar(mensaje: string, tipo = 'positive') {
    $q.notify({
      message: mensaje,
      type: tipo,
      position: 'top-right',
      timeout: 3000,
      progress: true,
    })
  }

  function notificarError(error: any) {
    let mensaje = 'Ha ocurrido un error inesperado'
    if (error.response?.data?.errors) {
      // Tomar el primer error de validación
      const errors = error.response.data.errors
      mensaje = Object.values(errors).flat()[0] as string
    } else if (error.response?.data?.message) {
      mensaje = error.response.data.message
    }
    
    $q.notify({
      message: mensaje,
      type: 'negative',
      position: 'top-right',
      icon: 'report_problem',
      timeout: 5000,
    })
  }
  function confirmar(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirmar',
        message: mensaje,
        ok: { label: 'Sí, continuar', color: 'negative', flat: true },
        cancel: { label: 'Cancelar', flat: true },
      }).onOk(() => resolve(true)).onCancel(() => resolve(false))
    })
  }

  return { notificar, notificarError, confirmar }
}
