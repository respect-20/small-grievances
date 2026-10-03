'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {workflow} from 'sanity-plugin-workflow'

import {schemaTypes} from './sanity/schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Department of Small Grievances',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool(),
    visionTool(),
    workflow({
      schemaTypes: ['grievance'],
      states: [
        {
          id: 'filed',
          title: 'Filed',
          color: 'primary',
          transitions: ['under-review'],
        },
        {
          id: 'under-review',
          title: 'Under Review',
          color: 'warning',
          transitions: ['ruling-issued'],
          requireAssignment: false,
        },
        {
          id: 'ruling-issued',
          title: 'Ruling Issued',
          color: 'success',
          transitions: ['appealed', 'closed'],
        },
        {
          id: 'appealed',
          title: 'Appealed',
          color: 'danger',
          transitions: ['under-review', 'closed'],
        },
        {
          id: 'closed',
          title: 'Closed',
          color: 'primary',
          transitions: [],
        },
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
