import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createRouter, createMemoryHistory } from 'vue-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateDictation from '../CreateDictation.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/creer', component: CreateDictation },
      { path: '/dictation/:id', component: { template: '<div>play</div>' } },
    ],
  })
}

async function renderCreate() {
  const router = createTestRouter()
  await router.push('/creer')
  const result = render(CreateDictation, { global: { plugins: [router] } })
  return { ...result, router }
}

describe('CreateDictation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche le formulaire de création', async () => {
    await renderCreate()
    expect(screen.getByLabelText('Nom de la dictée')).toBeInTheDocument()
    expect(screen.getByLabelText('Ajouter un mot')).toBeInTheDocument()
    expect(screen.getByText('Enregistrer la dictée')).toBeDisabled()
  })

  it('ajoute un mot à la liste', async () => {
    await renderCreate()
    const input = screen.getByLabelText('Ajouter un mot')
    await userEvent.type(input, 'chat')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('chat')).toBeInTheDocument()
  })

  it("n'ajoute pas de doublons", async () => {
    await renderCreate()
    const input = screen.getByLabelText('Ajouter un mot')
    await userEvent.type(input, 'chat')
    await userEvent.keyboard('{Enter}')
    await userEvent.type(input, 'chat')
    await userEvent.keyboard('{Enter}')
    expect(screen.getAllByText('chat')).toHaveLength(1)
  })

  it('supprime un mot', async () => {
    await renderCreate()
    const input = screen.getByLabelText('Ajouter un mot')
    await userEvent.type(input, 'chien')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('chien')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Supprimer le mot chien'))
    expect(screen.queryByText('chien')).not.toBeInTheDocument()
  })

  it('active le bouton sauvegarder quand nom et mots sont renseignés', async () => {
    await renderCreate()
    await userEvent.type(screen.getByLabelText('Nom de la dictée'), 'Animaux')
    await userEvent.type(screen.getByLabelText('Ajouter un mot'), 'chat')
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
    const { router } = await renderCreate()

    await userEvent.type(screen.getByLabelText('Nom de la dictée'), 'Animaux')
    await userEvent.type(screen.getByLabelText('Ajouter un mot'), 'chat')
    await userEvent.keyboard('{Enter}')
    await userEvent.click(screen.getByText('Enregistrer la dictée'))

    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/dictation/abc')
    )
  })

  it('affiche une erreur si le fetch échoue', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail')))
    await renderCreate()

    await userEvent.type(screen.getByLabelText('Nom de la dictée'), 'Animaux')
    await userEvent.type(screen.getByLabelText('Ajouter un mot'), 'chat')
    await userEvent.keyboard('{Enter}')
    await userEvent.click(screen.getByText('Enregistrer la dictée'))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Une erreur est survenue')
    )
  })
})
