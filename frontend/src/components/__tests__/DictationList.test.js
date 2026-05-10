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
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', name: 'Animaux', words: ['chat', 'chien'] },
            { id: '2', name: 'Couleurs', words: ['rouge'] },
          ]),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
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
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })

    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText(/Impossible de charger/)).toBeInTheDocument())

    await userEvent.click(screen.getByText('Réessayer'))
    await waitFor(() => expect(screen.getByText(/Aucune dictée/)).toBeInTheDocument())
  })

  it('supprime une dictée visuellement après confirmation', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', name: 'Animaux', words: ['chat', 'chien'] },
            { id: '2', name: 'Couleurs', words: ['rouge'] },
          ]),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true })

    global.confirm = vi.fn(() => true)

    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())
    expect(screen.getByText('Couleurs')).toBeInTheDocument()

    const deleteButtons = screen.getAllByLabelText(/Supprimer la dictée/)
    await userEvent.click(deleteButtons[0])

    await waitFor(() => expect(screen.queryByText('Animaux')).not.toBeInTheDocument())
    expect(screen.getByText('Couleurs')).toBeInTheDocument()
  })

  it('ne supprime pas une dictée si l\'utilisateur annule', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', name: 'Animaux', words: ['chat', 'chien'] },
          ]),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
    global.confirm = vi.fn(() => false)

    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())

    const deleteButton = screen.getByLabelText(/Supprimer la dictée/)
    await userEvent.click(deleteButton)

    expect(screen.getByText('Animaux')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('restaure la dictée si la suppression échoue', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', name: 'Animaux', words: ['chat', 'chien'] },
            { id: '2', name: 'Couleurs', words: ['rouge'] },
          ]),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: false })

    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()

    render(DictationList, { global: { stubs } })
    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())

    const deleteButtons = screen.getAllByLabelText(/Supprimer la dictée/)
    await userEvent.click(deleteButtons[0])

    await waitFor(() => expect(screen.getByText('Animaux')).toBeInTheDocument())
    expect(screen.getByText('Couleurs')).toBeInTheDocument()
    expect(global.alert).toHaveBeenCalledWith('Impossible de supprimer la dictée.')
  })
})
