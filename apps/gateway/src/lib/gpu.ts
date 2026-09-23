// Состояние видеокарты через nvidia-smi (ставится вместе с драйвером NVIDIA).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { DiagInfo, GpuInfo } from '@strela/shared'
import { errorMessage } from './metrics'

const run = promisify(execFile)
const FIELDS = 'name,driver_version,memory.used,memory.total,utilization.gpu,temperature.gpu'

export async function readGpu(): Promise<DiagInfo['gpu']> {
  try {
    const { stdout } = await run(
      'nvidia-smi',
      [`--query-gpu=${FIELDS}`, '--format=csv,noheader,nounits'],
      { timeout: 5000, windowsHide: true },
    )
    const gpus = stdout.trim().split(/\r?\n/).map(parseLine)
    return { ok: true, gpus }
  } catch (err) {
    return { ok: false, error: errorMessage(err), gpus: [] }
  }
}

function parseLine(line: string): GpuInfo {
  const [name = '', driver = '', used, total, util, temp] = line.split(',').map((s) => s.trim())
  return {
    name,
    driver,
    memUsedMb: Number(used),
    memTotalMb: Number(total),
    utilPct: Number(util),
    tempC: Number(temp),
  }
}
