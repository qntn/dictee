import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DictationList from '../DictationList'

function renderList() {
  return render(
    <MemoryRouter>
      <DictationList />
    </MemoryRouter>
  )
}

describe('DictationList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche un indicateur de chargement au départ', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    renderList()
    expect(screen.getByText('Chargement…')).toBeInTheDocument()
  })

  it('affiche un message quand la liste est vide', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    )
    renderList()
    await waitFor(() =>
      expect(screen.getByText(/Aucune dictée/)).toBeInTheDocument()
    )
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
    renderList()
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())
    expect(screen.getByText('Couleurs')).toBeInTheDocument()
    expect(screen.getByText('2 mot(s)')).toBeInTheDocument()
  })

  it('affiche un message d\'erreur si le fetch échoue', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network error')))
    renderList()
    await waitFor(() =>
      expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument()
    )
  })

  it('affiche un message d\'erreur si la réponse n\'est pas ok', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false })
    )
    renderList()
    await waitFor(() =>
      expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument()
    )
  })

  it('permet de recharger après une erreur', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })

    renderList()
    await waitFor(() => expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument())

    const retry = screen.getByText('Réessayer')
    await userEvent.click(retry)
    await waitFor(() => expect(screen.getByText(/Aucune dictée/)).toBeInTheDocument())
  })
})
