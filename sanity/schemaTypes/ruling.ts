import {defineField, defineType} from 'sanity'

export const ruling = defineType({
  name: 'ruling',
  title: 'Ruling',
  type: 'document',
  fields: [
    defineField({
      name: 'grievance',
      title: 'Grievance',
      type: 'reference',
      to: [{type: 'grievance'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'commissioner',
      title: 'Commissioner',
      type: 'reference',
      to: [{type: 'commissioner'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'verdict',
      title: 'Verdict',
      type: 'string',
      options: {
        list: [
          {title: 'Guilty', value: 'guilty'},
          {title: 'Not Guilty', value: 'not-guilty'},
          {title: 'Both Parties at Fault', value: 'both-at-fault'},
          {title: 'Case Dismissed', value: 'dismissed'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reasoning',
      title: 'Reasoning',
      type: 'text',
      rows: 6,
      description: "The Commissioner's written opinion",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'penalty',
      title: 'Penalty',
      type: 'string',
      description: 'What the losing party must do, e.g. "Must do dishes for one week"',
    }),
    defineField({
      name: 'issuedAt',
      title: 'Issued At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'verdict',
      subtitle: 'penalty',
    },
  },
})
