<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card flat class="q-pa-lg" style="width: 400px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05)">
      <q-card-section class="text-center">
        <q-avatar size="80px" color="primary" text-color="white" icon="lock_reset" class="q-mb-md" />
        <div class="text-h5 text-weight-bolder text-primary">Actualizar Contraseña</div>
        <div class="text-caption text-grey-7 q-mt-sm">
          Por seguridad, debes cambiar tu contraseña inicial (tu C.I.) antes de continuar.
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="password"
            label="Nueva Contraseña"
            outlined rounded dense
            :type="verPass ? 'text' : 'password'"
            :rules="[
              val => !!val || 'Campo requerido',
              val => val.length >= 6 || 'Mínimo 6 caracteres'
            ]"
          >
            <template v-slot:append>
              <q-icon :name="verPass ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="verPass = !verPass" />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            label="Confirmar Contraseña"
            outlined rounded dense
            :type="verPass ? 'text' : 'password'"
            :rules="[
              val => !!val || 'Campo requerido',
              val => val === password || 'Las contraseñas no coinciden'
            ]"
          />

          <q-btn
            label="Cambiar y Entrar"
            type="submit"
            color="primary"
            class="full-width q-mt-md"
            unelevated rounded
            :loading="cargando"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'
import client from 'src/api/client'
import { useQuasar } from 'quasar'

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()

const password = ref('')
const confirmPassword = ref('')
const verPass = ref(false)
const cargando = ref(false)

async function onSubmit() {
  cargando.value = true
  try {
    await client.post('auth/cambiar-password', {
      password: password.value,
      password_confirmation: confirmPassword.value
    })
    
    // Refrescar datos del usuario (para actualizar el flag debe_cambiar_password)
    await auth.cargarUsuario()
    
    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada correctamente'
    })
    
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al actualizar contraseña'
    })
  } finally {
    cargando.value = false
  }
}
</script>
