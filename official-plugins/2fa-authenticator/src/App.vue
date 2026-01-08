<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as OTPAuth from 'otpauth'
import qrcode from 'qrcode-generator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'

interface Account {
  id: string
  name: string
  issuer: string
  secret: string
  totp: OTPAuth.TOTP
}

const accounts = ref<Account[]>([])
const currentTime = ref(Date.now())
const showAddDialog = ref(false)
const showTestDialog = ref(false)
const showQRDialog = ref(false)
const showImportDialog = ref(false)
const qrCodeData = ref({ dataUrl: '', name: '', issuer: '', secret: '' })

const newAccount = ref({ name: '', issuer: '', secret: '' })
const importUri = ref('')
const testSecret = ref('')
const testToken = ref('')
const testError = ref('')
const testTotp = ref<OTPAuth.TOTP | null>(null)

const timeProgress = computed(() => {
  const seconds = Math.floor(currentTime.value / 1000) % 30
  return (seconds / 30) * 100
})

const remainingSeconds = computed(() => {
  return 30 - (Math.floor(currentTime.value / 1000) % 30)
})

const generateToken = (totp: OTPAuth.TOTP): string => {
  return totp.generate()
}

const addAccount = (): void => {
  if (!newAccount.value.name || !newAccount.value.secret) {
    toast.error('请填写账户名称和密钥')
    return
  }

  const secret = newAccount.value.secret.replace(/\s/g, '').toUpperCase()

  try {
    const totp = new OTPAuth.TOTP({
      issuer: newAccount.value.issuer || 'Unknown',
      label: newAccount.value.name,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    })

    accounts.value.push({
      id: Date.now().toString(),
      name: newAccount.value.name,
      issuer: newAccount.value.issuer,
      secret: secret,
      totp
    })

    saveAccounts()
    newAccount.value = { name: '', issuer: '', secret: '' }
    showAddDialog.value = false
  } catch (e) {
    toast.error(`添加失败: ${e instanceof Error ? e.message : String(e)}`)
  }
}

const removeAccount = (id: string): void => {
  if (confirm('确定要删除这个账户吗？')) {
    accounts.value = accounts.value.filter((acc) => acc.id !== id)
    saveAccounts()
  }
}

const testGenerateToken = (): void => {
  try {
    testError.value = ''
    if (!testSecret.value.trim()) {
      testError.value = '请输入密钥'
      return
    }

    const secret = testSecret.value.replace(/\s/g, '').toUpperCase()

    const totp = new OTPAuth.TOTP({
      issuer: 'Quick',
      label: 'Quick',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    })

    testToken.value = totp.generate()
    testTotp.value = totp
  } catch (e) {
    testError.value = `生成失败: ${e instanceof Error ? e.message : String(e)}`
    testToken.value = ''
    testTotp.value = null
  }
}

const copyToken = async (token: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(token)
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败')
  }
}

const generateQRCodeImage = (text: string): string => {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()

  const size = 4
  const canvas = document.createElement('canvas')
  const moduleCount = qr.getModuleCount()

  const canvasSize = moduleCount * size
  canvas.width = canvasSize
  canvas.height = canvasSize

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 canvas context')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  ctx.fillStyle = '#000000'
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(col * size, row * size, size, size)
      }
    }
  }

  return canvas.toDataURL('image/png')
}

const showQRCode = async (account: Account): Promise<void> => {
  try {
    const uri = account.totp.toString()
    const qrDataUrl = generateQRCodeImage(uri)

    qrCodeData.value = {
      dataUrl: qrDataUrl,
      name: account.name,
      issuer: account.issuer,
      secret: account.secret
    }
    showQRDialog.value = true
  } catch (e) {
    toast.error(`显示二维码失败: ${e instanceof Error ? e.message : String(e)}`)
  }
}

const showTestQRCode = async (): Promise<void> => {
  if (!testTotp.value) return

  try {
    const uri = testTotp.value.toString()
    const qrDataUrl = generateQRCodeImage(uri)

    qrCodeData.value = {
      dataUrl: qrDataUrl,
      name: '快速获取',
      issuer: '快速获取验证码',
      secret: testSecret.value.replace(/\s/g, '').toUpperCase()
    }
    showQRDialog.value = true
  } catch (e) {
    toast.error(`生成二维码失败: ${e instanceof Error ? e.message : String(e)}`)
  }
}

const importFromUri = (): void => {
  if (!importUri.value.trim()) {
    toast.error('请输入 URI')
    return
  }

  try {
    const totp = OTPAuth.URI.parse(importUri.value.trim())
    if (!(totp instanceof OTPAuth.TOTP)) {
      toast.error('只支持 TOTP 类型')
      return
    }

    accounts.value.push({
      id: Date.now().toString(),
      name: totp.label,
      issuer: totp.issuer || 'Unknown',
      secret: totp.secret.base32,
      totp
    })

    saveAccounts()
    toast.success('导入成功！')
    showImportDialog.value = false
    importUri.value = ''
  } catch (e) {
    toast.error(`导入失败: ${e instanceof Error ? e.message : String(e)}`)
  }
}

const saveAccounts = (): void => {
  const data = accounts.value.map((acc) => ({
    id: acc.id,
    name: acc.name,
    issuer: acc.issuer,
    secret: acc.secret
  }))
  localStorage.setItem('2fa-accounts', JSON.stringify(data))
}

const loadAccounts = (): void => {
  const data = localStorage.getItem('2fa-accounts')
  if (!data) return

  try {
    const saved = JSON.parse(data)
    accounts.value = saved.map(
      (acc: { id: string; name: string; issuer: string; secret: string }) => {
        const totp = new OTPAuth.TOTP({
          issuer: acc.issuer,
          label: acc.name,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: acc.secret
        })

        return {
          id: acc.id,
          name: acc.name,
          issuer: acc.issuer,
          secret: acc.secret,
          totp
        }
      }
    )
  } catch (e) {
    console.error('加载账户失败:', e)
  }
}

let timer: number | null = null

onMounted(() => {
  loadAccounts()
  timer = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 100)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900">
    <Toaster position="top-center" />
    <div
      class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 flex-shrink-0"
    >
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">双因素验证 (2FA)</h2>

      <div class="ml-auto flex items-center gap-2">
        <Button size="sm" variant="secondary" @click="showTestDialog = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          快速获取
        </Button>
        <Button size="sm" variant="secondary" @click="showImportDialog = true"> 导入 URI </Button>
        <Button size="sm" @click="showAddDialog = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          添加账户
        </Button>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <div
        v-if="accounts.length === 0"
        class="flex flex-col items-center justify-center h-full text-gray-500"
      >
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p class="text-lg">还没有添加任何账户</p>
        <p class="text-sm mt-2">点击右上角"添加账户"开始使用</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ account.issuer }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ account.name }}</p>
            </div>
            <div class="flex gap-1 ml-2">
              <Button size="icon" variant="ghost" title="显示二维码" @click="showQRCode(account)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </Button>
              <Button size="icon" variant="ghost" title="删除" @click="removeAccount(account.id)">
                <svg
                  class="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>

          <div class="relative mb-2">
            <div class="text-3xl font-mono font-bold text-center text-gray-900 dark:text-gray-100 tracking-wider">
              {{ generateToken(account.totp) }}
            </div>
            <Button
              size="icon"
              variant="ghost"
              class="absolute right-0 top-1/2 -translate-y-1/2"
              title="复制"
              @click="copyToken(generateToken(account.totp))"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </Button>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 transition-all duration-100"
                :style="{ width: `${timeProgress}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono w-6 text-right"
              >{{ remainingSeconds }}s</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 添加账户对话框 -->
    <Dialog :open="showAddDialog" @update:open="(open) => (showAddDialog = open)">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>添加新账户</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label class="mb-1">账户名称 *</Label>
            <Input v-model="newAccount.name" type="text" placeholder="例如: user@example.com" />
          </div>

          <div>
            <Label class="mb-1">发行者</Label>
            <Input v-model="newAccount.issuer" type="text" placeholder="例如: Google, GitHub" />
          </div>

          <div>
            <Label class="mb-1">密钥 (Secret) *</Label>
            <Input
              v-model="newAccount.secret"
              type="text"
              placeholder="例如: JBSWY3DPEHPK3PXP"
              class="font-mono"
            />
            <p class="text-xs text-gray-500 mt-1">通常是 16 或 32 位的 Base32 编码字符串</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" @click="showAddDialog = false"> 取消 </Button>
          <Button @click="addAccount"> 添加 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 快速获取对话框 -->
    <Dialog :open="showTestDialog" @update:open="(open) => (showTestDialog = open)">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>快速获取验证码</DialogTitle>
          <DialogDescription>输入密钥即可获取验证码</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label class="mb-1">密钥 (Secret)</Label>
            <Input
              v-model="testSecret"
              type="text"
              placeholder="例如: JBSWY3DPEHPK3PXP"
              class="font-mono"
              @input="testGenerateToken"
            />
            <p class="text-xs text-gray-500 mt-1">输入后自动生成验证码</p>
          </div>

          <div v-if="testToken" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-2">当前验证码</div>
              <div
                class="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider mb-3"
              >
                {{ testToken }}
              </div>
              <div class="flex items-center justify-center gap-2 mb-3">
                <div
                  class="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs"
                >
                  <div
                    class="h-full bg-blue-500 transition-all duration-100"
                    :style="{ width: `${timeProgress}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-mono"
                  >{{ remainingSeconds }}s</span
                >
              </div>
              <div class="flex gap-2 justify-center">
                <Button size="sm" @click="copyToken(testToken)"> 复制验证码 </Button>
                <Button size="sm" variant="secondary" @click="showTestQRCode"> 显示二维码 </Button>
              </div>
            </div>
          </div>

          <div
            v-if="testError"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p class="text-sm text-red-900 dark:text-red-200">{{ testError }}</p>
          </div>

          <div
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
          >
            <p class="text-xs text-blue-900 dark:text-blue-200">
              <strong>提示：</strong
              >这是快速获取功能，关闭后不会保存。如需长期使用，请点击"添加账户"保存。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            @click="
              () => {
                showTestDialog = false
                testSecret = ''
                testToken = ''
                testError = ''
              }
            "
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 二维码显示对话框 -->
    <Dialog :open="showQRDialog" @update:open="(open) => (showQRDialog = open)">
      <DialogContent class="max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ qrCodeData.issuer }}</DialogTitle>
          <DialogDescription>{{ qrCodeData.name }}</DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center">
          <img
            :src="qrCodeData.dataUrl"
            alt="QR Code"
            class="rounded-lg shadow-sm w-48 h-48"
            style="image-rendering: pixelated"
          />
          <div class="mt-4 w-full bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1 text-center">密钥</p>
            <p class="font-mono text-sm text-gray-900 dark:text-gray-100 text-center break-all">
              {{ qrCodeData.secret }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" @click="showQRDialog = false"> 关闭 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 导入 URI 对话框 -->
    <Dialog :open="showImportDialog" @update:open="(open) => (showImportDialog = open)">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>导入 URI</DialogTitle>
          <DialogDescription>输入 otpauth:// URI 来导入账户</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label class="mb-1">URI</Label>
            <Input
              v-model="importUri"
              type="text"
              placeholder="otpauth://totp/Example:user@example.com?secret=..."
              class="font-mono text-xs"
            />
            <p class="text-xs text-gray-500 mt-1">
              例如: otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example
            </p>
          </div>

          <div
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
          >
            <p class="text-xs text-blue-900 dark:text-blue-200">
              <strong>提示：</strong>URI 通常可以从二维码中扫描获取，或从服务提供商处复制。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            @click="
              () => {
                showImportDialog = false
                importUri = ''
              }
            "
          >
            取消
          </Button>
          <Button @click="importFromUri"> 导入 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
