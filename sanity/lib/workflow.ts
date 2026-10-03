import {client, writeClient} from './client'

/**
 * sanity-plugin-workflow tracks state on a separate `workflow.metadata`
 * document (keyed by `documentId`), not on the content document itself.
 * This keeps that metadata document in sync with our own `status` field
 * so the Workflow board in the Studio reflects reality.
 */
export async function syncWorkflowState(documentId: string, state: string) {
  const existing = await client.fetch(
    `*[_type == "workflow.metadata" && documentId == $documentId][0]._id`,
    {documentId},
  )

  if (existing) {
    await writeClient.patch(existing).set({state}).commit()
  } else {
    await writeClient.create({
      _type: 'workflow.metadata',
      documentId,
      state,
      assignees: [],
      orderRank: '0',
    })
  }
}
