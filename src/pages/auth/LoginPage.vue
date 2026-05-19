<template>
  <q-page class="login-layout row">
    
    <!-- LADO IZQUIERDO: Branding Animado Espectacular -->
    <div class="col-12 col-md-6 flex flex-center branding-panel relative-position overflow-hidden gt-sm">
      <!-- Formas de Luz Abstractas y Animadas -->
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>

      <!-- Tarjeta Glassmorphism Frontal -->
      <div class="glass-content text-white text-center q-pa-xl z-top column items-center justify-center">
        <q-img src="~assets/sigemu.png" style="width: 160px; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.5));" class="q-mb-xl floating-logo" />
        <h1 class="text-h3 text-weight-bolder q-mb-sm text-shadow animated-title-glass">SIGEMU</h1>
        <p class="text-h6 text-weight-regular opacity-90 text-shadow-sm q-mb-none">
          Sistema de Gestión de la<br><strong class="text-weight-bold">Morenada UNITEPC</strong>
        </p>
      </div>
    </div>

    <!-- LADO DERECHO: Formulario Moderno Minimalista -->
    <div class="col-12 col-md-6 flex flex-center form-panel bg-white">
      <div class="login-box q-pa-lg" style="width: 100%; max-width: 440px;">
        
        <!-- Logo mobile solo visible en pantallas pequeñas -->
        <div class="text-center q-mb-lg lt-md">
          <q-img src="~assets/sigemu.png" style="width: 100px;" />
        </div>

        <div class="q-mb-xl text-center-sm">
          <h2 class="text-h4 text-weight-bolder q-mb-sm animated-title-form" style="letter-spacing: -0.5px;">Bienvenido</h2>
          <p class="text-subtitle1 text-grey-6">Ingresa tus credenciales para continuar</p>
        </div>

        <q-form @submit="ingresar" class="q-gutter-y-sm">
          <!-- Campo Usuario -->
          <div>
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-xs">Usuario</div>
            <q-input 
              v-model="form.username" 
              type="text" 
              outlined 
              class="premium-input"
              placeholder="Ej. admin"
              :rules="[(v: string) => !!v || 'Ingrese su usuario']" 
            >
              <template #prepend>
                <q-icon name="person_outline" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Campo Contraseña -->
          <div>
            <div class="row justify-between items-center q-mb-xs">
              <div class="text-subtitle2 text-weight-bold text-grey-8">Contraseña</div>
              <a href="#" class="text-primary text-weight-bold text-caption no-text-decoration">¿Olvidaste tu contraseña?</a>
            </div>
            
            <q-input 
              v-model="form.password" 
              :type="verPass ? 'text' : 'password'" 
              outlined 
              class="premium-input"
              placeholder="••••••••"
              :rules="[(v: string) => !!v || 'Ingrese su contraseña']"
            >
              <template #prepend>
                <q-icon name="lock_outline" color="primary" />
              </template>
              <template #append>
                <q-icon 
                  :name="verPass ? 'visibility_off' : 'visibility'" 
                  class="cursor-pointer transition" 
                  :color="verPass ? 'primary' : 'grey-5'"
                  @click="verPass = !verPass" 
                />
              </template>
            </q-input>
          </div>

          <!-- Botón de Acción -->
          <q-btn 
            type="submit" 
            unelevated 
            color="primary" 
            label="Ingresar al Sistema" 
            class="full-width premium-btn q-mt-md" 
            size="1.1rem"
            :loading="auth.cargando" 
          >
            <template #loading>
              <q-spinner-dots color="white" size="2em" />
            </template>
          </q-btn>
        </q-form>

        <div class="text-center q-mt-xl text-caption text-grey-5 text-weight-medium">
          SIGEMU v2.0 © {{ new Date().getFullYear() }} — Todos los derechos reservados
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'
import { useNotificacion } from 'src/composables/useNotificacion'

const router = useRouter()
const auth = useAuthStore()
const { notificar } = useNotificacion()

const verPass = ref(false)
const form = reactive({ username: '', password: '' })

async function ingresar() {
  try {
    await auth.login(form)
    router.push({ name: 'dashboard' })
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    const msg = err.response?.data?.message ?? 'Credenciales incorrectas'
    notificar(msg, 'negative')
  }
}
</script>

<style scoped>
.login-layout {
  background: #fff;
  min-height: 100vh;
}

/* ═══ LADO IZQUIERDO: Branding animado ═══ */
.branding-panel {
  background: linear-gradient(135deg, #120a26 0%, #2b1654 50%, #101c54 100%);
}

/* Formas Abstractas Animadas de fondo */
.shape {
  position: absolute;
  filter: blur(90px);
  border-radius: 50%;
  animation: float 25s infinite alternate ease-in-out;
  opacity: 0.65;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #00c2cb; /* Cyan */
  top: -15%;
  left: -20%;
  animation-delay: 0s;
}

.shape-2 {
  width: 700px;
  height: 700px;
  background: #6f36c5; /* Vibrant Purple */
  bottom: -20%;
  right: -10%;
  animation-delay: -7s;
}

.shape-3 {
  width: 450px;
  height: 450px;
  background: #00ffcc; /* Mint/Neon */
  top: 40%;
  left: 20%;
  animation-delay: -12s;
  opacity: 0.3;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(40px, -60px) scale(1.1) rotate(15deg); }
  66% { transform: translate(-30px, 30px) scale(0.9) rotate(-10deg); }
  100% { transform: translate(50px, 50px) scale(1.05) rotate(5deg); }
}

/* Glassmorphism Tarjeta Central */
.glass-content {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 40px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05);
  width: 85%;
  max-width: 520px;
}

.divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #00c2cb, #4f2789);
  border-radius: 4px;
  margin-left: auto;
  margin-right: auto;
}

.floating-logo {
  animation: hover 6s ease-in-out infinite;
}

/* Texto Degradado Animado (Glassmorphism) */
.animated-title-glass {
  background: linear-gradient(to right, #ffffff 10%, #00ffff 30%, #e0b0ff 50%, #ffffff 70%, #00ffff 90%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 5s linear infinite;
}

@keyframes shine {
  to { background-position: 200% center; }
}

@keyframes hover {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
}

.text-shadow { text-shadow: 0 6px 16px rgba(0,0,0,0.5); }
.text-shadow-sm { text-shadow: 0 3px 10px rgba(0,0,0,0.4); }

/* ═══ LADO DERECHO: Formulario ═══ */
.form-panel {
  min-height: 100vh;
  position: relative;
}

/* Texto Degradado Animado (Formulario) */
.animated-title-form {
  background: linear-gradient(135deg, #4f2789 0%, #00c2cb 50%, #303f9f 100%, #4f2789 150%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 6s linear infinite;
}

/* Sutiles gradientes en el fondo blanco */
.form-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top right, rgba(0,194,203,0.03), transparent 50%),
              radial-gradient(circle at bottom left, rgba(79,39,137,0.03), transparent 50%);
  pointer-events: none;
}

.login-box {
  animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══ Custom Premium Inputs ═══ */
:deep(.premium-input .q-field__control) {
  border-radius: 14px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: #f8f9fc !important; /* Gris super claro con tinte azul */
  border: 2px solid transparent !important;
}

:deep(.premium-input .q-field__control:before) {
  border: none !important;
}

:deep(.premium-input.q-field--focused .q-field__control) {
  background: #fff !important;
  border: 2px solid #4f2789 !important;
  box-shadow: 0 10px 25px rgba(79, 39, 137, 0.08) !important;
  transform: translateY(-2px);
}

:deep(.premium-input .q-icon) {
  transition: color 0.3s ease;
}

/* ═══ Custom Premium Button ═══ */
.premium-btn {
  border-radius: 14px !important;
  background: linear-gradient(135deg, #4f2789 0%, #303f9f 100%) !important;
  text-transform: none;
  font-weight: 800;
  padding: 14px 0;
  box-shadow: 0 8px 25px rgba(79, 39, 137, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.premium-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(79, 39, 137, 0.45) !important;
  background: linear-gradient(135deg, #5c2ea0 0%, #3b4dbe 100%) !important;
}

.premium-btn:active {
  transform: translateY(1px);
  box-shadow: 0 5px 15px rgba(79, 39, 137, 0.25) !important;
}

.no-text-decoration { 
  text-decoration: none; 
  transition: opacity 0.2s ease;
}
.no-text-decoration:hover { 
  opacity: 0.8;
  text-decoration: underline; 
}

.text-center-sm {
  text-align: center;
}

/* ═══ DESKTOP ADJUSTMENTS ═══ */
@media (min-width: 1024px) {
  .login-layout {
    height: 100vh;
    overflow: hidden;
  }
  .branding-panel {
    height: 100vh;
  }
  .form-panel {
    height: 100vh;
    overflow-y: auto;
  }
  .text-center-sm {
    text-align: left;
  }
}
</style>
