import { browser } from '$app/environment'
import type { NewRadio, Radio } from '$lib/types'

const KEY = 'radios'

export function createRadioStore() {
  let radios = $state<Radio[]>([])

  if (browser) {
    const stored = localStorage.getItem(KEY)
    if (stored) radios = JSON.parse(stored)
  }

  const cleanup = $effect.root(() => {
    $effect(() => {
      localStorage.setItem(KEY, JSON.stringify(radios))
    })

    return () => {
      cleanup()
    }
  })

  function add(radio: NewRadio) {
    radios.push({
      ...radio,
      id: crypto.randomUUID(),
    })
  }

  function update(radio: Radio) {
    const index = radios.findIndex((r) => r.id === radio.id)
    radios[index] = radio
  }

  function remove(radio: Radio) {
    radios = radios.filter((r) => r.id !== radio.id)
  }

  function xport() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const MM = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const HH = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const filename = `radiete_${yyyy}${MM}${dd}_${HH}${mm}${ss}.m3u8`
    const content =
      '#EXTM3U\n' +
      radios.map((r) => `#EXTINF:-1,${r.name}\n${r.url}`).join('\n')
    const mimeType = 'audio/x-mpegurl'

    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement('a')

    link.download = filename
    link.href = window.URL.createObjectURL(blob)
    link.dataset.downloadurl = [mimeType, link.download, link.href].join(':')

    const evt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })

    link.dispatchEvent(evt)
    link.remove()
  }

  async function mport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.m3u,.m3u8'
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      const file = files?.length ? files[0] : null
      if (file) {
        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const content = e.target?.result as string
            let list: Radio[]

            if (file.name.endsWith('.json')) {
              const parsed = JSON.parse(content)
              if (parsed.every((l: NewRadio) => l.name && l.url)) {
                list = parsed.map(({ id, name, url }: Radio) => ({
                  id: id || crypto.randomUUID(),
                  name,
                  url,
                }))
              } else {
                throw new Error('Invalid JSON format')
              }
            } else {
              list = parseM3U(content)
            }

            if (list.length > 0) {
              radios = list
            }
          } catch {
            alert('Please select a valid exported file')
          }
        }
        reader.readAsText(file)
      }
      input.remove()
    }
    input.click()
  }

  function parseM3U(content: string): Radio[] {
    const lines = content.split('\n').map((l) => l.trim())
    const radios: Radio[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('#EXTINF:')) {
        const name = line.split(',')[1]?.trim() || ''
        const nextLine = lines[i + 1]
        if (
          nextLine &&
          (nextLine.startsWith('http://') || nextLine.startsWith('https://'))
        ) {
          radios.push({
            id: crypto.randomUUID(),
            name: name || nextLine,
            url: nextLine,
          })
        }
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (!lines[i - 1]?.startsWith('#EXTINF:')) {
          radios.push({
            id: crypto.randomUUID(),
            name: line,
            url: line,
          })
        }
      }
    }

    return radios
  }

  return {
    get radios() {
      return radios
    },
    add,
    update,
    remove,
    xport,
    mport,
  }
}

export const radioStore = createRadioStore()
