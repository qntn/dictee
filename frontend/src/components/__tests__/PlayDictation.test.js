import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createRouter, createMemoryHistory } from 'vue-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlayDictation from '../PlayDictation.vue'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

const mockDictation = { id: 'abc', name: 'Animaux', words: ['chat', 'chien'] }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/dictation/:id', component: PlayDictation },
    ],
  })
}

async function renderPlay() {
  const router = createTestRouter()
  await router.push('/dictation/abc')
  return render(PlayDictation, { global: { plugins: [router] } })
}

describe('PlayDictation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    global.window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn() }
    global.SpeechSynthesisUtterance = vi.fn()

    global.fetch = vi.fn((url) => {
      if (url.includes('/scores')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDictation),
      })
    })
  })

  it('affiche un message de chargement puis le nom de la dictée', async () => {
    await renderPlay()
    expect(screen.getByText('Chargement…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())
  })

  it('navigue vers / si la dictée est introuvable', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    const router = createTestRouter()
    await router.push('/dictation/unknown')
    render(PlayDictation, { global: { plugins: [router] } })
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
  })

  it('affiche le compteur de mots', async () => {
    await renderPlay()
    await waitFor(() => expect(screen.getByText('Mot 1 / 2')).toBeInTheDocument())
  })

  it('valide une bonne réponse et affiche le feedback', async () => {
    await renderPlay()
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())

    await userEvent.type(screen.getByPlaceholderText(/cris le mot/), 'chat')
    await userEvent.click(screen.getByText('Valider'))

    await waitFor(() => expect(screen.getByText(/Bravo/)).toBeInTheDocument())
    await waitFor(
      () => expect(screen.getByText('Mot 2 / 2')).toBeInTheDocument(),
      { timeout: 3000 }
    )
  }, 10000)

  it("affiche un feedback d'erreur pour une mauvaise réponse", async () => {
    await renderPlay()
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())

    await userEvent.type(screen.getByPlaceholderText(/cris le mot/), 'cheval')
    await userEvent.click(screen.getByText('Valider'))

    await waitFor(() => expect(screen.getByText(/Rat/)).toBeInTheDocument())
  })

  it("affiche l'écran de fin avec le score", async () => {
    await renderPlay()
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())

    await userEvent.type(screen.getByPlaceholderText(/cris le mot/), 'chat')
    await userEvent.click(screen.getByText('Valider'))
    await waitFor(() => expect(screen.getByText('Mot 2 / 2')).toBeInTheDocument(), { timeout: 3000 })

    await userEvent.type(screen.getByPlaceholderText(/cris le mot/), 'cheva')
    await userEvent.click(screen.getByText('Valider'))

    await waitFor(() => expect(screen.getByText(/Termin/)).toBeInTheDocument(), { timeout: 3000 })
  }, 15000)

  it('le mode tolérance accent accepte une réponse sans accent', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/scores')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'abc', name: 'Test', words: ['\u00e9l\u00e8ve'] }),
      })
    })

    await renderPlay()
    await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument())

    await userEvent.click(screen.getByLabelText('Accepter sans accents'))
    await userEvent.type(screen.getByPlaceholderText(/cris le mot/), 'eleve')
    await userEvent.click(screen.getByText('Valider'))

    await waitFor(() => expect(screen.getByText(/Bravo/)).toBeInTheDocument())
  })
})
