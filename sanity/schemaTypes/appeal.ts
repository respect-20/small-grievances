import {defineField, defineType} from 'sanity'

export const appeal = defineType({
  name: 'appeal',
  title: 'Appeal',
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
      name: 'filedBy',
      title: 'Filed By',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reason',
      title: 'Reason for Appeal',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required().min(10),
    }),
    defineField({
      name: 'newRuling',
      title: 'New Ruling',
      type: 'reference',
      to: [{type: 'ruling'}],
    }),
    defineField({
      name: 'status',
      title: 'Appeal Status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Reviewed', value: 'reviewed'},
        ],
      },
    }),
    defineField({
      name: 'filedAt',
      title: 'Filed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
