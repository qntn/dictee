import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateDictation from '../CreateDictation'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, useNavigate: () => mockNavigate }
})

function renderCreate() {
  return render(
    <MemoryRouter>
      <CreateDictation />
    </MemoryRouter>
  )
}

describe('CreateDictation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockNavigate.mockReset()
  })

  it('affiche le formulaire de création', () => {
    renderCreate()
    expect(screen.getByLabelText('Nom de la dictée')).toBeInTheDocument()
    expect(screen.getByLabelText('Ajouter un mot')).toBeInTheDocument()
    expect(screen.getByText('Enregistrer la dictée')).toBeDisabled()
  })

  it('ajoute un mot à la liste', async () => {
    renderCreate()
    const input = screen.getByLabelText('Ajouter un mot')
    await userEvent.type(input, 'chat')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('chat')).toBeInTheDocument()
  })

  it('n\'ajoute pas de doublons', async () => {
    renderCreate()
    const input = screen.getByLabelText('Ajouter un mot')
    await userEvent.type(input, 'chat')
    await userEvent.keyboard('{Enter}')
    await userEvent.type(input, 'chat')
    await userEvent.keyboard('{Enter}')
    expect(screen.getAllByText('chat')).toHaveLength(1)
  })

  it('supprime un mot', async () => {
    renderCreate()
    const input = screen.getByLabelText('Ajouter un mot')
    await userEvent.type(input, 'chien')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('chien')).toBeInTheDocument()

    const deleteBtn = screen.getByLabelText('Supprimer le mot chien')
    await userEvent.click(deleteBtn)
    expect(screen.queryByText('chien')).not.toBeInTheDocument()
  })

  it('active le bouton sauvegarder quand nom et mots sont renseignés', async () => {
    renderCreate()
    const nameInput = screen.getByLabelText('Nom de la dictée')
    const wordInput = screen.getByLabelText('Ajouter un mot')

    await userEvent.type(nameInput, 'Animaux')
    await userEvent.type(wordInput, 'chat')
    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('Enregistrer la dictée')).not.toBeDisabled()
  })

  it('navigue après une sauvegarde réussie', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'abc', name: 'Animaux', words: ['chat'] }),
      })
    )
    renderCreate()

    await userEvent.type(screen.getByLabelText('Nom de la dictée'), 'Animaux')
    await userEvent.type(screen.getByLabelText('Ajouter un mot'), 'chat')
    await userEvent.keyboard('{Enter}')
    await userEvent.click(screen.getByText('Enregistrer la dictée'))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dictation/abc'))
  })

  it('affiche une erreur si le fetch échoue', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail')))
    renderCreate()

    await userEvent.type(screen.getByLabelText('Nom de la dictée'), 'Animaux')
    await userEvent.type(screen.getByLabelText('Ajouter un mot'), 'chat')
    await userEvent.keyboard('{Enter}')
    await userEvent.click(screen.getByText('Enregistrer la dictée'))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue')
    )
  })
})
