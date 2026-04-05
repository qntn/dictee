import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DictationList from '../DictationList.vue'

const stubs = { RouterLink: { template: '<a><slot /></a>' } }

describe('DictationList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche un indicateur de chargement au départ', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    render(DictationList, { global: { stubs } })
    expect(screen.getByText('Chargement…')).toBeInTheDocument()
  })

  it('affiche un message quand la liste est vide', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    )
    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText(/Aucune dictée/)).toBeInTheDocument())
  })

  it('affiche les dictées chargées', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', name: 'Animaux', words: ['chat', 'chien'] },
            { id: '2', name: 'Couleurs', words: ['rouge'] },
          ]),
      })
    )
    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())
    expect(screen.getByText('Couleurs')).toBeInTheDocument()
    expect(screen.getByText('2 mot(s)')).toBeInTheDocument()
  })

  it("affiche un message d'erreur si le fetch échoue", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network error')))
    render(DictationList, { global: { stubs } })
    await waitFor(() =>
      expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument()
    )
  })

  it("affiche un message d'erreur si la réponse n'est pas ok", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(DictationList, { global: { stubs } })
    await waitFor(() =>
      expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument()
    )
  })

  it('permet de recharger après une erreur', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })

    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument())

    await userEvent.click(screen.getByText('Réessayer'))
    await waitFor(() => expect(screen.getByText(/Aucune dictée/)).toBeInTheDocument())
  })
})
